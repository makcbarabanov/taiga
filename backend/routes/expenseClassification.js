const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/expense-classification/classify?text=...
// Определяет категорию расхода на основе текста
router.get('/classify', async (req, res) => {
    try {
        const { text } = req.query;
        
        if (!text) {
            return res.status(400).json({ error: 'Параметр text обязателен' });
        }

        // Получаем все активные правила, отсортированные по приоритету
        const rules = await pool.query(`
            SELECT 
                r.id,
                r.rule_type,
                r.pattern,
                r.category_id,
                r.requires_comment,
                r.priority,
                r.description,
                c.name as category_name,
                c.alias as category_alias
            FROM taiga.expense_classification_rules r
            JOIN taiga.expense_categories c ON r.category_id = c.id
            WHERE r.is_active = TRUE
            ORDER BY r.priority DESC, r.id ASC
        `);

        let matchedRule = null;
        const normalizedText = text.trim().toLowerCase();

        // Проверяем правила по приоритету
        for (const rule of rules.rows) {
            let isMatch = false;
            const pattern = rule.pattern.toLowerCase();

            switch (rule.rule_type) {
                case 'keyword':
                    // Точное совпадение ключевого слова (с учётом регистра не учитывается)
                    if (normalizedText.includes(pattern)) {
                        isMatch = true;
                    }
                    break;

                case 'employee':
                    // Имя сотрудника - точное совпадение слова
                    const words = normalizedText.split(/\s+/);
                    if (words.includes(pattern)) {
                        isMatch = true;
                    }
                    break;

                case 'material_pattern':
                    // Регулярное выражение для шаблона материалов
                    try {
                        const regex = new RegExp(pattern, 'i');
                        if (regex.test(text)) {
                            isMatch = true;
                        }
                    } catch (e) {
                        console.error('Ошибка в регулярном выражении:', pattern, e);
                    }
                    break;

                case 'pattern':
                    // Общее регулярное выражение
                    try {
                        const regex = new RegExp(pattern, 'i');
                        if (regex.test(text)) {
                            isMatch = true;
                        }
                    } catch (e) {
                        console.error('Ошибка в регулярном выражении:', pattern, e);
                    }
                    break;
            }

            if (isMatch) {
                matchedRule = rule;
                break; // Используем первое совпавшее правило (с наивысшим приоритетом)
            }
        }

        if (matchedRule) {
            res.json({
                found: true,
                category_id: matchedRule.category_id,
                category_name: matchedRule.category_name,
                category_alias: matchedRule.category_alias,
                requires_comment: matchedRule.requires_comment,
                rule_id: matchedRule.id,
                rule_description: matchedRule.description
            });
        } else {
            // Категория не определена
            res.json({
                found: false,
                message: 'Категория не определена автоматически'
            });
        }
    } catch (error) {
        console.error('Error classifying expense:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/expense-classification/learn
// Автоматически создаёт правило на основе выбора пользователя
// Body: { text: "текст расхода", category_id: 1, requires_comment: false }
router.post('/learn', async (req, res) => {
    try {
        const { text, category_id, requires_comment = false } = req.body;

        if (!text || !category_id) {
            return res.status(400).json({ 
                error: 'Параметры text и category_id обязательны' 
            });
        }

        // Проверяем, существует ли категория
        const categoryCheck = await pool.query(
            'SELECT id, name, alias FROM taiga.expense_categories WHERE id = $1',
            [category_id]
        );

        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }

        // Определяем тип правила и паттерн
        let ruleType = 'keyword';
        let pattern = text.trim();

        // Если текст похож на имя сотрудника (одно слово, начинается с заглавной)
        if (/^[А-ЯЁ][а-яё]+$/.test(pattern)) {
            ruleType = 'employee';
        }
        // Если текст содержит шаблон размеров
        else if (/\d+[хxXХ*]\d+([хxXХ*]\d+)?/.test(pattern)) {
            ruleType = 'material_pattern';
            pattern = pattern.match(/\d+[хxXХ*]\d+([хxXХ*]\d+)?/)[0];
        }

        // Проверяем, не существует ли уже такое правило
        const existingRule = await pool.query(
            `SELECT id FROM taiga.expense_classification_rules 
             WHERE rule_type = $1 AND pattern = $2 AND category_id = $3`,
            [ruleType, pattern, category_id]
        );

        if (existingRule.rows.length > 0) {
            return res.json({
                message: 'Правило уже существует',
                rule_id: existingRule.rows[0].id,
                rule_type: ruleType,
                pattern: pattern
            });
        }

        // Определяем приоритет
        let priority = 75; // Средний приоритет по умолчанию
        if (ruleType === 'employee') {
            priority = 90;
        } else if (ruleType === 'material_pattern') {
            priority = 80;
        } else if (requires_comment) {
            priority = 100; // Маржа всегда высший приоритет
        }

        // Создаём новое правило
        const result = await pool.query(
            `INSERT INTO taiga.expense_classification_rules 
             (rule_type, pattern, category_id, requires_comment, priority, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, rule_type, pattern, category_id, requires_comment, priority, description`,
            [
                ruleType,
                pattern,
                category_id,
                requires_comment,
                priority,
                `Автоматически создано: "${text}" → ${categoryCheck.rows[0].alias}`
            ]
        );

        res.json({
            message: 'Правило успешно создано',
            rule: result.rows[0],
            category: categoryCheck.rows[0]
        });
    } catch (error) {
        console.error('Error learning rule:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/expense-classification/rules
// Получить все правила классификации
router.get('/rules', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id,
                r.rule_type,
                r.pattern,
                r.category_id,
                r.requires_comment,
                r.priority,
                r.description,
                r.is_active,
                r.created_at,
                c.name as category_name,
                c.alias as category_alias
            FROM taiga.expense_classification_rules r
            JOIN taiga.expense_categories c ON r.category_id = c.id
            ORDER BY r.priority DESC, r.id ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching classification rules:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/expense-classification/rules/:id
// Удалить правило
router.delete('/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM taiga.expense_classification_rules WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Правило не найдено' });
        }

        res.json({ message: 'Правило удалено', rule: result.rows[0] });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


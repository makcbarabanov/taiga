// ===========================================
// Скрипт для ручного разбора расходов
// Использование: node scripts/classify-expense.js "текст расхода"
// ===========================================

require('dotenv').config();
const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

// Функция классификации
async function classifyExpense(text) {
    try {
        // Получаем все активные правила
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
                    if (normalizedText.includes(pattern)) {
                        isMatch = true;
                    }
                    break;

                case 'employee':
                    const words = normalizedText.split(/\s+/);
                    if (words.includes(pattern)) {
                        isMatch = true;
                    }
                    break;

                case 'material_pattern':
                case 'pattern':
                    try {
                        const regex = new RegExp(pattern, 'i');
                        if (regex.test(text)) {
                            isMatch = true;
                        }
                    } catch (e) {
                        // Игнорируем ошибки в regex
                    }
                    break;
            }

            if (isMatch) {
                matchedRule = rule;
                break;
            }
        }

        return matchedRule;
    } catch (error) {
        console.error('Ошибка при классификации:', error);
        return null;
    }
}

// Функция создания правила
async function learnRule(text, categoryId, requiresComment = false) {
    try {
        // Проверяем категорию
        const categoryCheck = await pool.query(
            'SELECT id, name, alias FROM taiga.expense_categories WHERE id = $1',
            [categoryId]
        );

        if (categoryCheck.rows.length === 0) {
            throw new Error('Категория не найдена');
        }

        // Определяем тип правила
        let ruleType = 'keyword';
        let pattern = text.trim();

        if (/^[А-ЯЁ][а-яё]+$/.test(pattern)) {
            ruleType = 'employee';
        } else if (/\d+[хxXХ*]\d+([хxXХ*]\d+)?/.test(pattern)) {
            ruleType = 'material_pattern';
            pattern = pattern.match(/\d+[хxXХ*]\d+([хxXХ*]\d+)?/)[0];
        }

        // Проверяем существование правила
        const existingRule = await pool.query(
            `SELECT id FROM taiga.expense_classification_rules 
             WHERE rule_type = $1 AND pattern = $2 AND category_id = $3`,
            [ruleType, pattern, categoryId]
        );

        if (existingRule.rows.length > 0) {
            return { exists: true, rule_id: existingRule.rows[0].id };
        }

        // Определяем приоритет
        let priority = 75;
        if (ruleType === 'employee') {
            priority = 90;
        } else if (ruleType === 'material_pattern') {
            priority = 80;
        } else if (requiresComment) {
            priority = 100;
        }

        // Создаём правило
        const result = await pool.query(
            `INSERT INTO taiga.expense_classification_rules 
             (rule_type, pattern, category_id, requires_comment, priority, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [
                ruleType,
                pattern,
                categoryId,
                requiresComment,
                priority,
                `Автоматически создано: "${text}" → ${categoryCheck.rows[0].alias}`
            ]
        );

        return { created: true, rule_id: result.rows[0].id, rule_type: ruleType, pattern: pattern };
    } catch (error) {
        console.error('Ошибка при создании правила:', error);
        throw error;
    }
}

// Получить список категорий
async function getCategories() {
    try {
        const result = await pool.query(
            'SELECT id, name, alias FROM taiga.expense_categories ORDER BY name'
        );
        return result.rows;
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
        return [];
    }
}

// Интерактивный режим
async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    console.log('\n🐯 Режим разбора расходов\n');
    console.log('Введите "выход" или "exit" для завершения\n');

    while (true) {
        const text = await question('\n📝 Введите текст расхода: ');
        
        if (text.toLowerCase() === 'выход' || text.toLowerCase() === 'exit') {
            break;
        }

        if (!text.trim()) {
            console.log('⚠️  Пустой текст, попробуйте снова');
            continue;
        }

        // Классифицируем
        const matchedRule = await classifyExpense(text);

        if (matchedRule) {
            console.log(`\n✅ Найдена категория: ${matchedRule.category_alias} (${matchedRule.category_name})`);
            if (matchedRule.requires_comment) {
                console.log('⚠️  Требуется комментарий!');
            }
            console.log(`📋 Правило: ${matchedRule.description}`);
        } else {
            console.log('\n❌ Категория не определена автоматически');
            
            // Показываем список категорий
            const categories = await getCategories();
            console.log('\n📚 Доступные категории:');
            categories.forEach((cat, index) => {
                console.log(`  ${index + 1}. ${cat.alias} - ${cat.name} (ID: ${cat.id})`);
            });

            // Спрашиваем категорию
            const categoryInput = await question('\nВыберите номер категории или введите ID: ');
            let categoryId = null;

            if (/^\d+$/.test(categoryInput.trim())) {
                const num = parseInt(categoryInput.trim());
                if (num <= categories.length) {
                    categoryId = categories[num - 1].id;
                } else {
                    categoryId = num;
                }
            }

            if (!categoryId) {
                console.log('⚠️  Неверный номер категории');
                continue;
            }

            // Проверяем, нужен ли комментарий (для Маржи)
            const selectedCategory = categories.find(c => c.id === categoryId);
            let requiresComment = false;
            if (selectedCategory && selectedCategory.alias === 'Маржа') {
                requiresComment = true;
                console.log('⚠️  Для категории "Маржа" требуется комментарий!');
            }

            // Создаём правило
            try {
                const result = await learnRule(text, categoryId, requiresComment);
                if (result.exists) {
                    console.log('ℹ️  Правило уже существует');
                } else {
                    console.log(`\n✅ Правило создано!`);
                    console.log(`   Тип: ${result.rule_type}, Паттерн: ${result.pattern}`);
                }
            } catch (error) {
                console.error('❌ Ошибка при создании правила:', error.message);
            }
        }
    }

    rl.close();
    console.log('\n👋 До свидания!');
    await pool.end();
}

// Режим из аргументов командной строки
async function commandLineMode() {
    const text = process.argv[2];

    if (!text) {
        console.log('Использование: node scripts/classify-expense.js "текст расхода"');
        console.log('Или без аргументов для интерактивного режима');
        await pool.end();
        process.exit(1);
    }

    const matchedRule = await classifyExpense(text);

    if (matchedRule) {
        console.log(`\n✅ Категория: ${matchedRule.category_alias} (${matchedRule.category_name})`);
        if (matchedRule.requires_comment) {
            console.log('⚠️  Требуется комментарий!');
        }
        console.log(`📋 Правило: ${matchedRule.description}`);
    } else {
        console.log('\n❌ Категория не определена');
    }

    await pool.end();
}

// Главная функция
async function main() {
    try {
        if (process.argv.length > 2) {
            await commandLineMode();
        } else {
            await interactiveMode();
        }
    } catch (error) {
        console.error('Критическая ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

main();


// ===========================================
// Routes для расходов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { syncExpenseToSnab } = require('../utils/syncExpenseToSnab');

// GET /api/expenses - получить все расходы
router.get('/', async (req, res) => {
    try {
        const { project_id, category_id } = req.query;
        let query = 'SELECT * FROM taiga.expenses WHERE 1=1';
        const params = [];
        let paramCount = 1;
        
        if (project_id) {
            query += ` AND project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }
        
        if (category_id) {
            query += ` AND category_id = $${paramCount}`;
            params.push(category_id);
            paramCount++;
        }
        
        query += ' ORDER BY date DESC, id DESC';
        const result = await pool.query(query, params);
        
        // Форматируем даты в формат YYYY-MM-DD без временной зоны
        const formattedRows = result.rows.map(row => {
            if (row.date) {
                // Если дата приходит как строка или Date объект, форматируем её
                const date = row.date instanceof Date ? row.date : new Date(row.date);
                // Используем локальную дату без времени
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                row.date = `${year}-${month}-${day}`;
            }
            return row;
        });
        
        res.json(formattedRows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/expenses/:id - получить расход по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.expenses WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        // Форматируем дату
        const row = result.rows[0];
        if (row.date) {
            const date = row.date instanceof Date ? row.date : new Date(row.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            row.date = `${year}-${month}-${day}`;
        }
        
        res.json(row);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/expenses - создать расход
router.post('/', async (req, res) => {
    try {
        const {
            project_id, date, month, year, category_id, subcategory,
            unit_id, quantity, price, amount, section, wallet, shop_id, comment
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, 
              quantity, price, amount, section, wallet, shop_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING *`,
            [
                project_id, date, month || null, year || null, category_id,
                subcategory || null, unit_id || null, quantity || null, price || null,
                amount, section || null, wallet || null, shop_id || null, comment || null
            ]
        );
        
        const newExpense = result.rows[0];
        
        // Синхронизируем с СНАБ
        const syncResult = await syncExpenseToSnab(newExpense);
        
        // Если требуется действие (материал не найден для обязательной категории)
        if (syncResult.requiresAction) {
            return res.status(201).json({
                ...newExpense,
                _sync: {
                    requiresAction: true,
                    message: `Материал "${syncResult.materialName}" из категории "${syncResult.category}" не найден в СНАБ. Требуется добавить материал в СНАБ.`
                }
            });
        }
        
        res.status(201).json({
            ...newExpense,
            _sync: syncResult
        });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/expenses/:id - обновить расход
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = [];
        const values = [];
        let paramCount = 1;
        
        // Строим динамический запрос только для переданных полей
        const fields = {
            project_id: req.body.project_id,
            date: req.body.date,
            month: req.body.month,
            year: req.body.year,
            category_id: req.body.category_id,
            subcategory: req.body.subcategory,
            unit_id: req.body.unit_id,
            quantity: req.body.quantity,
            price: req.body.price,
            amount: req.body.amount,
            section: req.body.section,
            wallet: req.body.wallet,
            shop_id: req.body.shop_id,
            comment: req.body.comment
        };
        
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                // Для числовых полей и null сохраняем как есть, для строковых - null если пусто
                if (value === null || value === '') {
                    values.push(null);
                } else if (['project_id', 'category_id', 'unit_id', 'month', 'year', 'shop_id'].includes(key)) {
                    values.push(value ? parseInt(value) : null);
                } else if (['quantity', 'price', 'amount'].includes(key)) {
                    values.push(value ? parseFloat(value) : null);
                } else {
                    values.push(value);
                }
                paramCount++;
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        values.push(id);
        const query = `UPDATE taiga.expenses SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        const updatedExpense = result.rows[0];
        
        // Синхронизируем с СНАБ (если изменились категория, subcategory, quantity, price, amount)
        if (req.body.category_id !== undefined || req.body.subcategory !== undefined || 
            req.body.quantity !== undefined || req.body.price !== undefined || req.body.amount !== undefined) {
            const syncResult = await syncExpenseToSnab(updatedExpense);
            
            if (syncResult.requiresAction) {
                return res.json({
                    ...updatedExpense,
                    _sync: {
                        requiresAction: true,
                        message: `Материал "${syncResult.materialName}" из категории "${syncResult.category}" не найден в СНАБ. Требуется добавить материал в СНАБ.`
                    }
                });
            }
            
            return res.json({
                ...updatedExpense,
                _sync: syncResult
            });
        }
        
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/expenses/:id - удалить расход
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.expenses WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

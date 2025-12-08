// ===========================================
// Routes для расходов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

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
        
        query += ' ORDER BY date DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
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
        
        res.json(result.rows[0]);
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
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/expenses/:id - обновить расход
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            project_id, date, month, year, category_id, subcategory,
            unit_id, quantity, price, amount, section, wallet, shop_id, comment
        } = req.body;
        
        const result = await pool.query(
            `UPDATE taiga.expenses
             SET project_id = $1, date = $2, month = $3, year = $4, category_id = $5,
                 subcategory = $6, unit_id = $7, quantity = $8, price = $9, amount = $10,
                 section = $11, wallet = $12, shop_id = $13, comment = $14
             WHERE id = $15
             RETURNING *`,
            [
                project_id, date, month || null, year || null, category_id,
                subcategory || null, unit_id || null, quantity || null, price || null,
                amount, section || null, wallet || null, shop_id || null, comment || null, id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.json(result.rows[0]);
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



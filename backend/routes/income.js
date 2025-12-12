// ===========================================
// Routes для доходов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/income - получить все доходы
router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = 'SELECT * FROM taiga.income';
        const params = [];
        
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        
        query += ' ORDER BY date DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching income:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/income/:id - получить доход по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.income WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching income:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/income - создать доход
router.post('/', async (req, res) => {
    try {
        const { project_id, date, month, year, amount, wallet, comment } = req.body;
        
        const result = await pool.query(
            `INSERT INTO taiga.income (project_id, date, month, year, amount, wallet, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [project_id, date, month || null, year || null, amount, wallet || null, comment || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating income:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/income/:id - обновить доход
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { project_id, date, month, year, amount, wallet, comment } = req.body;
        
        const result = await pool.query(
            `UPDATE taiga.income
             SET project_id = $1, date = $2, month = $3, year = $4, amount = $5, wallet = $6, comment = $7
             WHERE id = $8
             RETURNING *`,
            [project_id, date, month || null, year || null, amount, wallet || null, comment || null, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating income:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/income/:id - удалить доход
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.income WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




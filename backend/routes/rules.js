// ===========================================
// Routes для правил обучения
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/rules - получить все правила
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, section, title, content, sort_order, created_at, updated_at
            FROM taiga.rules
            ORDER BY sort_order, id
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/rules/:id - получить правило по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT id, section, title, content, sort_order, created_at, updated_at
            FROM taiga.rules
            WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching rule:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/rules/:id - обновить правило
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { section, title, content, sort_order } = req.body;
        
        const result = await pool.query(`
            UPDATE taiga.rules
            SET section = $1, title = $2, content = $3, sort_order = $4
            WHERE id = $5
            RETURNING *
        `, [section, title, content, sort_order || 0, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;















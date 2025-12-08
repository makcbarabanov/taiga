// ===========================================
// Routes для категорий расходов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM taiga.expense_categories ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching expense categories:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;



// ===========================================
// Routes для единиц измерения
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM taiga.units ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




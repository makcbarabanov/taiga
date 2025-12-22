// ===========================================
// Routes для магазинов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM taiga.shops ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching shops:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/shops/:id - получить магазин по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.shops WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching shop:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/shops - создать магазин
router.post('/', async (req, res) => {
    try {
        const { name, phone, address, working_hours, contact_person, website } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Название магазина обязательно' });
        }
        
        const result = await pool.query(
            `INSERT INTO taiga.shops (name, phone, address, working_hours, contact_person, website)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, phone || null, address || null, working_hours || null, contact_person || null, website || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating shop:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Магазин с таким названием уже существует' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// PUT /api/shops/:id - обновить магазин
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, working_hours, contact_person, website } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Название магазина обязательно' });
        }
        
        const result = await pool.query(
            `UPDATE taiga.shops
             SET name = $1, phone = $2, address = $3, working_hours = $4, contact_person = $5, website = $6
             WHERE id = $7
             RETURNING *`,
            [name, phone || null, address || null, working_hours || null, contact_person || null, website || null, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating shop:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Магазин с таким названием уже существует' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// DELETE /api/shops/:id - удалить магазин
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.shops WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        
        res.json({ message: 'Shop deleted successfully' });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

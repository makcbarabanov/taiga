// ===========================================
// Routes для клиентов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/clients - получить всех клиентов
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM taiga.clients ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/clients/:id - получить клиента по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.clients WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/clients - создать клиента
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, address, notes } = req.body;
        
        const result = await pool.query(
            `INSERT INTO taiga.clients (name, phone, email, address, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, phone || null, email || null, address || null, notes || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/clients/:id - обновить клиента
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address, notes } = req.body;
        
        const result = await pool.query(
            `UPDATE taiga.clients
             SET name = $1, phone = $2, email = $3, address = $4, notes = $5
             WHERE id = $6
             RETURNING *`,
            [name, phone || null, email || null, address || null, notes || null, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/clients/:id - удалить клиента
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.clients WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




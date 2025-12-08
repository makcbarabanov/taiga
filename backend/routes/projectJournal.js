// ===========================================
// Routes для журнала проектов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = 'SELECT * FROM taiga.project_journal';
        const params = [];
        
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        
        query += ' ORDER BY date DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching project journal:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.project_journal WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { project_id, date, worker_name, work_id, hours, quantity_completed, notes } = req.body;
        const result = await pool.query(
            `INSERT INTO taiga.project_journal (project_id, date, worker_name, work_id, hours, quantity_completed, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [project_id, date, worker_name || null, work_id || null,
             hours || null, quantity_completed || null, notes || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, worker_name, work_id, hours, quantity_completed, notes } = req.body;
        const result = await pool.query(
            `UPDATE taiga.project_journal SET date = $1, worker_name = $2, work_id = $3,
             hours = $4, quantity_completed = $5, notes = $6
             WHERE id = $7 RETURNING *`,
            [date, worker_name || null, work_id || null,
             hours || null, quantity_completed || null, notes || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.project_journal WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;



// ===========================================
// Routes для работ проектов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = 'SELECT * FROM taiga.project_works';
        const params = [];
        
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        
        query += ' ORDER BY sort_order, id';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching project works:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.project_works WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { project_id, section, work_name, unit_id, quantity, price_per_unit, 
                total_cost, progress_percent, completed_quantity, status, notes, sort_order } = req.body;
        const result = await pool.query(
            `INSERT INTO taiga.project_works 
             (project_id, section, work_name, unit_id, quantity, price_per_unit, total_cost,
              progress_percent, completed_quantity, status, notes, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [project_id, section || null, work_name, unit_id || null, quantity || null,
             price_per_unit || null, total_cost || null, progress_percent || 0,
             completed_quantity || 0, status || 'В процессе', notes || null, sort_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { section, work_name, unit_id, quantity, price_per_unit, total_cost,
                progress_percent, completed_quantity, status, notes, sort_order } = req.body;
        const result = await pool.query(
            `UPDATE taiga.project_works SET section = $1, work_name = $2, unit_id = $3,
             quantity = $4, price_per_unit = $5, total_cost = $6, progress_percent = $7,
             completed_quantity = $8, status = $9, notes = $10, sort_order = $11
             WHERE id = $12 RETURNING *`,
            [section || null, work_name, unit_id || null, quantity || null,
             price_per_unit || null, total_cost || null, progress_percent || 0,
             completed_quantity || 0, status || 'В процессе', notes || null, sort_order || 0, id]
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
        const result = await pool.query('DELETE FROM taiga.project_works WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;



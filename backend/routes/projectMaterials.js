// ===========================================
// Routes для материалов проектов (СНАБ)
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = 'SELECT * FROM taiga.project_materials_estimate';
        const params = [];
        
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        
        query += ' ORDER BY category, material_name';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching project materials:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.project_materials_estimate WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { project_id, category, material_name, unit_id, planned_quantity, planned_price, planned_cost } = req.body;
        const result = await pool.query(
            `INSERT INTO taiga.project_materials_estimate 
             (project_id, category, material_name, unit_id, planned_quantity, planned_price, planned_cost)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [project_id, category || null, material_name, unit_id || null,
             planned_quantity || null, planned_price || null, planned_cost || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category, material_name, unit_id, planned_quantity, planned_price, planned_cost } = req.body;
        const result = await pool.query(
            `UPDATE taiga.project_materials_estimate SET category = $1, material_name = $2, unit_id = $3,
             planned_quantity = $4, planned_price = $5, planned_cost = $6
             WHERE id = $7 RETURNING *`,
            [category || null, material_name, unit_id || null,
             planned_quantity || null, planned_price || null, planned_cost || null, id]
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
        const result = await pool.query('DELETE FROM taiga.project_materials_estimate WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




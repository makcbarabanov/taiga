// ===========================================
// Routes для материалов проектов (СНАБ)
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = `
            SELECT 
                pme.*,
                rc.name as resource_category_name
            FROM taiga.project_materials_estimate pme
            LEFT JOIN taiga.cat_expense rc ON pme.resource_category_id = rc.id
        `;
        const params = [];
        
        if (project_id) {
            query += ' WHERE pme.project_id = $1';
            params.push(project_id);
        }
        
        query += ' ORDER BY pme.category, pme.material_name';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching project materials:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: error.message, details: error.stack });
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
        const { project_id, category, material_name, unit_id, planned_quantity, planned_price, planned_cost, resource_category_id, material_id } = req.body;
        const result = await pool.query(
            `INSERT INTO taiga.project_materials_estimate 
             (project_id, category, material_name, unit_id, planned_quantity, planned_price, planned_cost, resource_category_id, material_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [project_id, category || null, material_name, unit_id || null,
             planned_quantity || null, planned_price || null, planned_cost || null, resource_category_id || null, material_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category, material_name, unit_id, planned_quantity, planned_price, planned_cost, resource_category_id, material_id } = req.body;
        const result = await pool.query(
            `UPDATE taiga.project_materials_estimate SET 
             category = COALESCE($1, category), 
             material_name = COALESCE($2, material_name), 
             unit_id = COALESCE($3, unit_id),
             planned_quantity = COALESCE($4, planned_quantity), 
             planned_price = COALESCE($5, planned_price), 
             planned_cost = COALESCE($6, planned_cost),
             resource_category_id = COALESCE($7, resource_category_id),
             material_id = COALESCE($8, material_id)
             WHERE id = $9 RETURNING *`,
            [category, material_name, unit_id,
             planned_quantity, planned_price, planned_cost, resource_category_id, material_id, id]
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




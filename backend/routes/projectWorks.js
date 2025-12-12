// ===========================================
// Routes для работ проектов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        
        // Явно выбираем все поля из представления (теперь использует p_feruz)
        let query = `
            SELECT 
                id, project_id, stage_id, stage_name,
                section_id, section_name, section_alias,
                work_type_id, work_type_name,
                work_name,
                unit_id, unit_name, unit_short_name,
                quantity, price_per_unit, total_cost,
                progress_percent, completed_quantity,
                status, sort_order,
                created_at, updated_at
            FROM taiga.v_project_works_full
        `;
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
        const result = await pool.query(`
            SELECT 
                id, project_id, stage_id, stage_name,
                section_id, section_name, section_alias,
                work_type_id, work_type_name,
                work_name,
                unit_id, unit_name, unit_short_name,
                quantity, price_per_unit, total_cost,
                progress_percent, completed_quantity,
                status, sort_order,
                created_at, updated_at
            FROM taiga.v_project_works_full 
            WHERE id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { project_id, stage_id, section_id, work_type_id, unit_id, quantity, price_per_unit, 
                total_cost, progress_percent, completed_quantity, status, sort_order } = req.body;
        const result = await pool.query(
            `INSERT INTO taiga.p_feruz 
             (project_id, stage_id, section_id, work_type_id, unit_id, quantity, price_per_unit, total_cost,
              progress_percent, completed_quantity, status, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [project_id, stage_id || null, section_id || null, work_type_id || null, unit_id || null, quantity || null,
             price_per_unit || null, total_cost || null, progress_percent || 0,
             completed_quantity || 0, status || 'В процессе', sort_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stage_id, section_id, work_type_id, unit_id, quantity, price_per_unit, total_cost,
                progress_percent, completed_quantity, status, sort_order } = req.body;
        const result = await pool.query(
            `UPDATE taiga.p_feruz SET stage_id = $1, section_id = $2, work_type_id = $3, unit_id = $4,
             quantity = $5, price_per_unit = $6, total_cost = $7, progress_percent = $8,
             completed_quantity = $9, status = $10, sort_order = $11
             WHERE id = $12 RETURNING *`,
            [stage_id || null, section_id || null, work_type_id || null, unit_id || null, quantity || null,
             price_per_unit || null, total_cost || null, progress_percent || 0,
             completed_quantity || 0, status || 'В процессе', sort_order || 0, id]
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
        const result = await pool.query('DELETE FROM taiga.p_feruz WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




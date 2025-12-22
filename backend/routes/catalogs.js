// Routes для справочников (cat_work, cat_resource)
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ===========================================
// СПРАВОЧНИК РАБОТ (cat_work)
// ===========================================

// GET /api/catalogs/works - получить все работы
router.get('/works', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                cw.id,
                cw.name,
                cw.unit_id,
                u.name as unit_name,
                u.short_name as unit_short_name,
                cw.description,
                cw.created_at,
                cw.updated_at
            FROM taiga.cat_work cw
            LEFT JOIN taiga.cat_units u ON cw.unit_id = u.id
            ORDER BY cw.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching works catalog:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/catalogs/works/:id - получить работу по ID
router.get('/works/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                cw.id,
                cw.name,
                cw.unit_id,
                u.name as unit_name,
                u.short_name as unit_short_name,
                cw.description,
                cw.created_at,
                cw.updated_at
            FROM taiga.cat_work cw
            LEFT JOIN taiga.cat_units u ON cw.unit_id = u.id
            WHERE cw.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching work:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/catalogs/works - создать работу
router.post('/works', async (req, res) => {
    try {
        const { name, unit_id, description } = req.body;
        const result = await pool.query(`
            INSERT INTO taiga.cat_work (name, unit_id, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [name, unit_id || null, description || null]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating work:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/catalogs/works/:id - обновить работу
router.put('/works/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unit_id, description } = req.body;
        const result = await pool.query(`
            UPDATE taiga.cat_work
            SET name = COALESCE($1, name),
                unit_id = COALESCE($2, unit_id),
                description = COALESCE($3, description),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `, [name, unit_id, description, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating work:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/catalogs/works/:id - удалить работу
router.delete('/works/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.cat_work WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Error deleting work:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================
// СПРАВОЧНИК РЕСУРСОВ (cat_resource)
// ===========================================

// GET /api/catalogs/resources - получить все ресурсы
router.get('/resources', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                cr.id,
                cr.name,
                cr.expense_category_id,
                ec.name as expense_category_name,
                ec.icon as expense_category_icon,
                cr.resource_category_id,
                rc.name as resource_category_name,
                rc.icon as resource_category_icon,
                cr.unit_id,
                u.name as unit_name,
                u.short_name as unit_short_name,
                cr.description,
                cr.created_at,
                cr.updated_at
            FROM taiga.cat_resource cr
            LEFT JOIN taiga.cat_expense ec ON cr.expense_category_id = ec.id
            LEFT JOIN taiga.cat_expense rc ON cr.resource_category_id = rc.id
            LEFT JOIN taiga.cat_units u ON cr.unit_id = u.id
            ORDER BY cr.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching resources catalog:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/catalogs/resources/:id - получить ресурс по ID
router.get('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                cr.id,
                cr.name,
                cr.expense_category_id,
                ec.name as expense_category_name,
                ec.icon as expense_category_icon,
                cr.resource_category_id,
                rc.name as resource_category_name,
                rc.icon as resource_category_icon,
                cr.unit_id,
                u.name as unit_name,
                u.short_name as unit_short_name,
                cr.description,
                cr.created_at,
                cr.updated_at
            FROM taiga.cat_resource cr
            LEFT JOIN taiga.cat_expense ec ON cr.expense_category_id = ec.id
            LEFT JOIN taiga.cat_expense rc ON cr.resource_category_id = rc.id
            LEFT JOIN taiga.cat_units u ON cr.unit_id = u.id
            WHERE cr.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/catalogs/resources - создать ресурс
router.post('/resources', async (req, res) => {
    try {
        const { name, expense_category_id, resource_category_id, unit_id, description } = req.body;
        const result = await pool.query(`
            INSERT INTO taiga.cat_resource (name, expense_category_id, resource_category_id, unit_id, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [name, expense_category_id || null, resource_category_id || null, unit_id || null, description || null]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/catalogs/resources/:id - обновить ресурс
router.put('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, expense_category_id, resource_category_id, unit_id, description } = req.body;
        const result = await pool.query(`
            UPDATE taiga.cat_resource
            SET name = COALESCE($1, name),
                expense_category_id = COALESCE($2, expense_category_id),
                resource_category_id = COALESCE($3, resource_category_id),
                unit_id = COALESCE($4, unit_id),
                description = COALESCE($5, description),
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `, [name, expense_category_id, resource_category_id, unit_id, description, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/catalogs/resources/:id - удалить ресурс
router.delete('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.cat_resource WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

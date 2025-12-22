// Routes для ресурсов работ
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ВАЖНО: Специфичные маршруты должны быть ПЕРЕД общим маршрутом /:id

// GET /api/work-resources/categories - получить все категории ресурсов (из cat_expense)
router.get('/categories', async (req, res) => {
    try {
        // Возвращаем только категории, которые используются для ресурсов: Мат, Инструм, Расход, Накладные
        const result = await pool.query(`
            SELECT id, name, description, icon
            FROM taiga.cat_expense
            WHERE name IN ('Мат', 'Инструм', 'Расход', 'Накладные')
            ORDER BY 
                CASE name
                    WHEN 'Мат' THEN 1
                    WHEN 'Инструм' THEN 2
                    WHEN 'Расход' THEN 3
                    WHEN 'Накладные' THEN 4
                    ELSE 5
                END
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching resource categories:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: error.message, details: error.stack });
    }
});

// GET /api/work-resources/work/:workId - получить все ресурсы для работы
router.get('/work/:workId', async (req, res) => {
    try {
        const { workId } = req.params;
        const result = await pool.query(`
            SELECT 
                wr.id,
                wr.work_id,
                wr.resource_category_id,
                rc.name as category_name,
                wr.material_name,
                wr.unit_id,
                u.name as unit_name,
                u.short_name as unit_short_name,
                wr.quantity,
                wr.is_shared,
                wr.notes,
                wr.created_at,
                wr.updated_at
            FROM taiga.work_resources wr
            LEFT JOIN taiga.cat_expense rc ON wr.resource_category_id = rc.id
            LEFT JOIN taiga.cat_units u ON wr.unit_id = u.id
            WHERE wr.work_id = $1
            ORDER BY 
                CASE rc.name
                    WHEN 'Мат' THEN 1
                    WHEN 'Инструм' THEN 2
                    WHEN 'Расход' THEN 3
                    WHEN 'Накладные' THEN 4
                    ELSE 5
                END,
                wr.material_name
        `, [workId]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching work resources:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/work-resources - создать новый ресурс
router.post('/', async (req, res) => {
    try {
        const { 
            work_id, 
            resource_category_id, 
            material_name, 
            unit_id, 
            quantity, 
            is_shared,
            notes 
        } = req.body;
        
        const result = await pool.query(`
            INSERT INTO taiga.work_resources (
                work_id, resource_category_id, material_name, 
                unit_id, quantity, is_shared, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            work_id,
            resource_category_id,
            material_name,
            unit_id,
            quantity,
            is_shared || false,
            notes || null
        ]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating work resource:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/work-resources/:id - обновить ресурс
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            resource_category_id, 
            material_name, 
            unit_id, 
            quantity, 
            is_shared,
            notes 
        } = req.body;
        
        const result = await pool.query(`
            UPDATE taiga.work_resources
            SET resource_category_id = COALESCE($1, resource_category_id),
                material_name = COALESCE($2, material_name),
                unit_id = COALESCE($3, unit_id),
                quantity = COALESCE($4, quantity),
                is_shared = COALESCE($5, is_shared),
                notes = COALESCE($6, notes),
                updated_at = NOW()
            WHERE id = $7
            RETURNING *
        `, [
            resource_category_id,
            material_name,
            unit_id,
            quantity,
            is_shared,
            notes,
            id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work resource not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating work resource:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/work-resources/:id - удалить ресурс
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM taiga.work_resources WHERE id = $1 RETURNING id',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work resource not found' });
        }
        
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Error deleting work resource:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

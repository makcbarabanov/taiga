// ===========================================
// Routes для справочника материалов _list_mat
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/list-mat - Получить список всех материалов с фильтрацией
router.get('/', async (req, res) => {
    try {
        const { search, category_id } = req.query;
        
        let query = `
            SELECT 
                lm.id,
                lm.mat,
                lm.cat_expense_id,
                ce.name as category_name,
                ce.icon as category_icon,
                lm.primary_unit,
                u1.short_name as primary_unit_name,
                lm.secondary_unit,
                u2.short_name as secondary_unit_name,
                lm.rules,
                lm.characteristics,
                lm.aliases
            FROM taiga._list_mat lm
            LEFT JOIN taiga.cat_expense ce ON lm.cat_expense_id = ce.id
            LEFT JOIN taiga.cat_units u1 ON lm.primary_unit::integer = u1.id
            LEFT JOIN taiga.cat_units u2 ON lm.secondary_unit::integer = u2.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        // Фильтр по категории
        if (category_id) {
            query += ` AND lm.cat_expense_id = $${paramIndex}::integer`;
            params.push(parseInt(category_id));
            paramIndex++;
        }
        
        // Поиск по наименованию
        if (search) {
            query += ` AND (lm.mat ILIKE $${paramIndex} OR EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(COALESCE(lm.aliases, '[]'::jsonb)) alias 
                WHERE alias ILIKE $${paramIndex}
            ))`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ' ORDER BY lm.mat';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching materials list:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: error.message, details: error.stack });
    }
});

// GET /api/list-mat/:id - Получить материал по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                lm.*,
                ce.name as category_name,
                ce.icon as category_icon,
                u1.short_name as primary_unit_name,
                u2.short_name as secondary_unit_name
            FROM taiga._list_mat lm
            LEFT JOIN taiga.cat_expense ce ON lm.cat_expense_id = ce.id
            LEFT JOIN taiga.cat_units u1 ON lm.primary_unit = u1.id
            LEFT JOIN taiga.cat_units u2 ON lm.secondary_unit = u2.id
            WHERE lm.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Material not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching material:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/list-mat - Добавить новый материал "на лету"
router.post('/', async (req, res) => {
    try {
        const { mat, cat_expense_id, primary_unit, secondary_unit, rules, characteristics, aliases } = req.body;
        
        if (!mat || !cat_expense_id || !primary_unit) {
            return res.status(400).json({ 
                error: 'Required fields: mat, cat_expense_id, primary_unit' 
            });
        }
        
        // Подготавливаем JSONB значения
        const characteristicsJson = characteristics ? JSON.stringify(characteristics) : '{}';
        const aliasesJson = aliases ? JSON.stringify(aliases) : '[]';
        const rulesJson = rules ? JSON.stringify(rules) : null;
        
        const result = await pool.query(`
            INSERT INTO taiga._list_mat (
                mat, 
                cat_expense_id, 
                primary_unit, 
                secondary_unit, 
                rules, 
                characteristics, 
                aliases
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
            ON CONFLICT (mat) DO UPDATE SET
                cat_expense_id = EXCLUDED.cat_expense_id,
                primary_unit = EXCLUDED.primary_unit,
                secondary_unit = EXCLUDED.secondary_unit,
                rules = EXCLUDED.rules,
                characteristics = EXCLUDED.characteristics,
                aliases = EXCLUDED.aliases
            RETURNING *
        `, [
            mat,
            cat_expense_id,
            primary_unit,
            secondary_unit || null,
            rulesJson,
            characteristicsJson,
            aliasesJson
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

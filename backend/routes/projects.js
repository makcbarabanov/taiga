// ===========================================
// Routes для проектов (объектов)
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/projects - получить все проекты
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM taiga.projects ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/projects/:id - получить проект по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.projects WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/projects - создать проект
router.post('/', async (req, res) => {
    try {
        const {
            client_id, name, status, start_date, end_date,
            planned_profit, notes
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO taiga.projects 
             (client_id, name, status, start_date, end_date, planned_profit, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                client_id, name, status || 'В работе',
                start_date || null, end_date || null,
                planned_profit || null, notes || null
            ]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/projects/:id - обновить проект
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            client_id, name, status, start_date, end_date,
            planned_profit, actual_profit, planned_income, actual_income,
            planned_expense, actual_expense, notes
        } = req.body;
        
        const result = await pool.query(
            `UPDATE taiga.projects
             SET client_id = $1, name = $2, status = $3, start_date = $4, end_date = $5,
                 planned_profit = $6, actual_profit = $7, planned_income = $8, actual_income = $9,
                 planned_expense = $10, actual_expense = $11, notes = $12
             WHERE id = $13
             RETURNING *`,
            [
                client_id, name, status, start_date || null, end_date || null,
                planned_profit || null, actual_profit || null,
                planned_income || null, actual_income || null,
                planned_expense || null, actual_expense || null,
                notes || null, id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/projects/:id - удалить проект
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.projects WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




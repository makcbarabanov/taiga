// Routes для сессий обучения
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/learning-sessions - получить все сессии обучения
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, session_date, questions_count, unique_questions_count,
                   correct_answers_count, other_answers_count, conversion_rate,
                   learned_new, created_at, updated_at
            FROM taiga.learning_sessions
            ORDER BY session_date DESC, created_at DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching learning sessions:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/learning-sessions - создать новую сессию обучения
router.post('/', async (req, res) => {
    try {
        const { 
            session_date, 
            questions_count, 
            unique_questions_count,
            correct_answers_count, 
            other_answers_count,
            learned_new 
        } = req.body;
        
        const result = await pool.query(`
            INSERT INTO taiga.learning_sessions (
                session_date, questions_count, unique_questions_count,
                correct_answers_count, other_answers_count, learned_new
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            session_date,
            questions_count || 0,
            unique_questions_count || 0,
            correct_answers_count || 0,
            other_answers_count || 0,
            learned_new || null
        ]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating learning session:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/learning-sessions/:id - обновить сессию обучения
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            session_date, 
            questions_count, 
            unique_questions_count,
            correct_answers_count, 
            other_answers_count,
            learned_new 
        } = req.body;
        
        const result = await pool.query(`
            UPDATE taiga.learning_sessions
            SET session_date = COALESCE($1, session_date),
                questions_count = COALESCE($2, questions_count),
                unique_questions_count = COALESCE($3, unique_questions_count),
                correct_answers_count = COALESCE($4, correct_answers_count),
                other_answers_count = COALESCE($5, other_answers_count),
                learned_new = COALESCE($6, learned_new),
                updated_at = NOW()
            WHERE id = $7
            RETURNING *
        `, [
            session_date,
            questions_count,
            unique_questions_count,
            correct_answers_count,
            other_answers_count,
            learned_new,
            id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Learning session not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating learning session:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;















// ===========================================
// Routes для табеля проектов (read-only view)
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = 'SELECT * FROM taiga.project_timesheet';
        const params = [];
        
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        
        query += ' ORDER BY date DESC, worker_name';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching project timesheet:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;



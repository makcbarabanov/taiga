// ===========================================
// Routes для табеля проектов (read-only view)
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        
        // Используем представление project_timesheet_aggregated для табеля
        let query = `
            SELECT 
                pj.project_id,
                pj.date,
                e.id AS employee_id,
                TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
                SUM(pj.hours) AS total_hours,
                COUNT(DISTINCT pj.id) AS journal_entries_count
            FROM taiga.project_journal pj
            INNER JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
            INNER JOIN taiga.employees e ON pjw.employee_id = e.id
        `;
        const params = [];
        
        if (project_id) {
            query += ' WHERE pj.project_id = $1';
            params.push(project_id);
        }
        
        query += ' GROUP BY pj.project_id, pj.date, e.id, e.last_name, e.first_name, e.middle_name';
        query += ' ORDER BY pj.date DESC, e.last_name, e.first_name';
        
        const result = await pool.query(query, params);
        
        // Преобразуем дату в правильный формат
        const rows = result.rows.map(row => {
            if (row.date) {
                // Преобразуем дату в строку YYYY-MM-DD
                const date = new Date(row.date);
                row.date = date.toISOString().split('T')[0];
            }
            return row;
        });
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching project timesheet:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




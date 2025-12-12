// ===========================================
// Routes для сотрудников
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/employees - получить всех сотрудников
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM taiga.employees WHERE 1=1';
        const params = [];
        let paramCount = 1;
        
        if (status) {
            query += ` AND status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        query += ' ORDER BY last_name, first_name, middle_name';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/employees/:id - получить сотрудника по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.employees WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/employees - создать сотрудника
router.post('/', async (req, res) => {
    try {
        const {
            last_name, first_name, middle_name, address_actual, address_registration,
            phone_numbers, hire_date, dismissal_date, position, employment_type, comment
        } = req.body;
        
        if (!last_name || !first_name) {
            return res.status(400).json({ error: 'Last name and first name are required' });
        }
        
        const result = await pool.query(
            `INSERT INTO taiga.employees 
             (last_name, first_name, middle_name, address_actual, address_registration,
              phone_numbers, hire_date, dismissal_date, position, employment_type, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                last_name, first_name || null, middle_name || null,
                address_actual || null, address_registration || null,
                phone_numbers || [], hire_date || null, dismissal_date || null,
                position || null, employment_type || 'постоянно', comment || null
            ]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/employees/:id - обновить сотрудника
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = [];
        const values = [];
        let paramCount = 1;
        
        const fields = {
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            address_actual: req.body.address_actual,
            address_registration: req.body.address_registration,
            phone_numbers: req.body.phone_numbers,
            hire_date: req.body.hire_date,
            dismissal_date: req.body.dismissal_date,
            position: req.body.position,
            employment_type: req.body.employment_type,
            comment: req.body.comment
        };
        
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                if (value === null || value === '') {
                    values.push(null);
                } else if (key === 'phone_numbers' && Array.isArray(value)) {
                    values.push(value);
                } else {
                    values.push(value);
                }
                paramCount++;
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        values.push(id);
        const query = `UPDATE taiga.employees SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/employees/:id - удалить сотрудника
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.employees WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({ message: 'Employee deleted successfully', employee: result.rows[0] });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




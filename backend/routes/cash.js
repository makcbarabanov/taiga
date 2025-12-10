// ===========================================
// Routes для кассы
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/cash/current - получить текущую кассу (сумма доходов - сумма расходов)
router.get('/current', async (req, res) => {
    try {
        // Сначала обновляем запись на сегодня
        await pool.query('SELECT taiga.update_today_cash_record()');
        
        // Рассчитываем текущую кассу
        const result = await pool.query('SELECT taiga.calculate_current_cash() as cash');
        const cashAmount = result.rows[0].cash || 0;
        
        res.json({ cash: cashAmount });
    } catch (error) {
        console.error('Error fetching current cash:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/cash - получить все записи кассы
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        let query = 'SELECT * FROM taiga.cash';
        const params = [];
        
        if (date) {
            query += ' WHERE date = $1';
            params.push(date);
        }
        
        query += ' ORDER BY date DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cash:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/cash/:id - получить запись кассы по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM taiga.cash WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cash record not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching cash:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/cash - создать запись кассы
router.post('/', async (req, res) => {
    try {
        const { date, calculated_amount, actual_amount, difference, initial_balance, notes } = req.body;
        
        // Проверяем, не существует ли уже запись с такой датой
        const existing = await pool.query('SELECT id FROM taiga.cash WHERE date = $1', [date]);
        if (existing.rows.length > 0) {
            // Если запись существует, обновляем её вместо создания новой
            const result = await pool.query(
                `UPDATE taiga.cash
                 SET calculated_amount = $1, actual_amount = $2, 
                     difference = $3, initial_balance = $4, notes = $5
                 WHERE date = $6
                 RETURNING *`,
                [
                    calculated_amount || null, actual_amount || null,
                    difference || null, initial_balance || 0, notes || null, date
                ]
            );
            return res.json(result.rows[0]);
        }
        
        const result = await pool.query(
            `INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, initial_balance, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                date, calculated_amount || null, actual_amount || null,
                difference || null, initial_balance || 0, notes || null
            ]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating cash record:', error);
        // Если ошибка из-за дубликата, пытаемся обновить существующую запись
        if (error.code === '23505') { // PostgreSQL unique violation
            try {
                const { date, calculated_amount, actual_amount, difference, initial_balance, notes } = req.body;
                const result = await pool.query(
                    `UPDATE taiga.cash
                     SET calculated_amount = $1, actual_amount = $2, 
                         difference = $3, initial_balance = $4, notes = $5
                     WHERE date = $6
                     RETURNING *`,
                    [
                        calculated_amount || null, actual_amount || null,
                        difference || null, initial_balance || 0, notes || null, date
                    ]
                );
                return res.json(result.rows[0]);
            } catch (updateError) {
                console.error('Error updating cash record:', updateError);
                return res.status(500).json({ error: updateError.message });
            }
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/cash/:id - обновить запись кассы
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, calculated_amount, actual_amount, difference, initial_balance, notes } = req.body;
        
        const result = await pool.query(
            `UPDATE taiga.cash
             SET date = $1, calculated_amount = $2, actual_amount = $3, 
                 difference = $4, initial_balance = $5, notes = $6
             WHERE id = $7
             RETURNING *`,
            [
                date, calculated_amount || null, actual_amount || null,
                difference || null, initial_balance || 0, notes || null, id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cash record not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating cash record:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/cash/:id - удалить запись кассы
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM taiga.cash WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cash record not found' });
        }
        
        res.json({ message: 'Cash record deleted successfully' });
    } catch (error) {
        console.error('Error deleting cash record:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




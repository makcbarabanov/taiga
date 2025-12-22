// ===========================================
// Routes для журнала проектов
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// Вспомогательная функция для вычисления часов из времени
function calculateHours(timeStart, timeEnd, breakDuration) {
    if (!timeStart || !timeEnd) return null;
    
    const start = new Date(`2000-01-01T${timeStart}`);
    const end = new Date(`2000-01-01T${timeEnd}`);
    let diff = (end - start) / (1000 * 60 * 60); // разница в часах
    
    if (breakDuration) {
        // breakDuration в формате INTERVAL (например, "01:00:00")
        const breakMatch = breakDuration.match(/(\d+):(\d+):(\d+)/);
        if (breakMatch) {
            const breakHours = parseInt(breakMatch[1]) + parseInt(breakMatch[2]) / 60 + parseInt(breakMatch[3]) / 3600;
            diff -= breakHours;
        }
    }
    
    return Math.max(0, diff);
}

// Вспомогательная функция для вычисления remaining_at_time
// Вычисляет, сколько оставалось выполнить работы на момент создания/редактирования записи
async function calculateRemainingAtTime(client, workId, date, timeStart, excludeJournalId = null) {
    if (!workId) return null;
    
    // Получаем плановое количество работы
    // Пробуем сначала p_feruz, потом project_works
    let workResult;
    try {
        workResult = await client.query(
            'SELECT quantity FROM taiga.p_feruz WHERE id = $1',
            [workId]
        );
    } catch (e) {
        workResult = await client.query(
            'SELECT quantity FROM taiga.project_works WHERE id = $1',
            [workId]
        );
    }
    
    if (workResult.rows.length === 0 || !workResult.rows[0].quantity) {
        return null;
    }
    
    const plannedQuantity = parseFloat(workResult.rows[0].quantity) || 0;
    
    // Находим все записи журнала для этой работы, которые были сделаны ДО текущей записи
    // Сортируем по дате и времени, чтобы учесть порядок выполнения
    let query = `
        SELECT COALESCE(SUM(quantity_completed), 0) as total_completed
        FROM taiga.project_journal
        WHERE work_id = $1
        AND (
            date < $2
            OR (date = $2 AND (time_start < $3 OR (time_start IS NULL AND $3 IS NOT NULL)))
        )
    `;
    const params = [workId, date, timeStart || null];
    
    // Исключаем текущую запись при редактировании
    if (excludeJournalId) {
        query += ' AND id != $4';
        params.push(excludeJournalId);
    }
    
    const completedResult = await client.query(query, params);
    const totalCompleted = parseFloat(completedResult.rows[0].total_completed) || 0;
    
    // Вычисляем остаток
    const remaining = plannedQuantity - totalCompleted;
    
    return Math.max(0, remaining); // Не может быть отрицательным
}

// GET /api/project-journal - получить все записи журнала (с фильтром по project_id)
router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = `
            SELECT 
                pj.id,
                pj.project_id,
                pj.date,
                pj.worker_name,
                pj.work_id,
                pj.hours,
                pj.quantity_completed,
                pj.notes,
                pj.created_at,
                pj.updated_at,
                pj.time_start,
                pj.time_end,
                pj.break_duration,
                pj.remaining_at_time,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', e.id,
                            'last_name', e.last_name,
                            'first_name', e.first_name,
                            'middle_name', e.middle_name,
                            'full_name', TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, '')))
                        )
                    ) FILTER (WHERE e.id IS NOT NULL),
                    '[]'::json
                ) AS employees
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
            LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
        `;
        const params = [];
        
        if (project_id) {
            query += ' WHERE pj.project_id = $1';
            params.push(project_id);
        }
        
        query += ' GROUP BY pj.id, pj.project_id, pj.date, pj.worker_name, pj.work_id, pj.hours, pj.quantity_completed, pj.notes, pj.created_at, pj.updated_at, pj.time_start, pj.time_end, pj.break_duration';
        query += ' ORDER BY pj.date DESC, pj.time_start';
        const result = await pool.query(query, params);
        
        // Преобразуем employees и break_duration
        const rows = result.rows.map(row => {
            // Преобразуем break_duration из INTERVAL в строку формата "чч:мм"
            if (row.break_duration) {
                if (typeof row.break_duration === 'object' && row.break_duration.hours !== undefined) {
                    const hours = row.break_duration.hours || 0;
                    const minutes = row.break_duration.minutes || 0;
                    row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
                } else if (typeof row.break_duration === 'string') {
                    const match = row.break_duration.match(/(\d+):(\d+):?(\d+)?/);
                    if (match) {
                        const hours = parseInt(match[1]);
                        const minutes = parseInt(match[2]);
                        row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
                    }
                }
            }
            
            // Проверяем employees
            if (row.employees === null || row.employees === undefined) {
                row.employees = [];
            } else if (typeof row.employees === 'string') {
                try {
                    row.employees = JSON.parse(row.employees);
                } catch (e) {
                    console.warn('Ошибка парсинга employees:', e);
                    row.employees = [];
                }
            } else if (!Array.isArray(row.employees)) {
                // Если это не массив и не строка, делаем пустым массивом
                row.employees = [];
            }
            return row;
        });
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching project journal:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/project-journal/:id - получить одну запись журнала
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                pj.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', e.id,
                            'last_name', e.last_name,
                            'first_name', e.first_name,
                            'middle_name', e.middle_name,
                            'full_name', TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, '')))
                        )
                    ) FILTER (WHERE e.id IS NOT NULL),
                    '[]'::json
                ) AS employees
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
            LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
            WHERE pj.id = $1
            GROUP BY pj.id
        `, [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const row = result.rows[0];
        
        // Преобразуем break_duration из INTERVAL в строку формата "чч:мм"
        if (row.break_duration) {
            // Если это объект INTERVAL, преобразуем в строку
            if (typeof row.break_duration === 'object' && row.break_duration.hours !== undefined) {
                const hours = row.break_duration.hours || 0;
                const minutes = row.break_duration.minutes || 0;
                row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
            } else if (typeof row.break_duration === 'string') {
                // Если это строка в формате "01:00:00", преобразуем в "1:00"
                const match = row.break_duration.match(/(\d+):(\d+):?(\d+)?/);
                if (match) {
                    const hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
                }
            }
        }
        
        // Преобразуем employees
        if (row.employees === null || row.employees === undefined) {
            row.employees = [];
        } else if (typeof row.employees === 'string') {
            try {
                row.employees = JSON.parse(row.employees);
            } catch (e) {
                row.employees = [];
            }
        } else if (!Array.isArray(row.employees)) {
            row.employees = [];
        }
        
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/project-journal - создать новую запись в журнале
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { 
            project_id, 
            date, 
            time_start, 
            time_end, 
            break_duration,
            work_id, 
            quantity_completed, 
            notes,
            employee_ids = [] // массив ID сотрудников
        } = req.body;
        
        // Вычисляем часы автоматически, если не указаны
        let hours = req.body.hours;
        if (!hours && time_start && time_end) {
            hours = calculateHours(time_start, time_end, break_duration);
        }
        
        // Вычисляем remaining_at_time (сколько оставалось на момент создания записи)
        const remainingAtTime = await calculateRemainingAtTime(client, work_id, date, time_start, null);
        
        // Вставляем запись в журнал
        const journalResult = await client.query(
            `INSERT INTO taiga.project_journal 
                (project_id, date, time_start, time_end, break_duration, hours, work_id, quantity_completed, notes, remaining_at_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [
                project_id, 
                date, 
                time_start || null, 
                time_end || null, 
                break_duration || null,
                hours || null, 
                work_id || null, 
                quantity_completed || null, 
                notes || null,
                remainingAtTime
            ]
        );
        
        const journalId = journalResult.rows[0].id;
        
        // Добавляем сотрудников
        if (Array.isArray(employee_ids) && employee_ids.length > 0) {
            for (const employeeId of employee_ids) {
                await client.query(
                    'INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)',
                    [journalId, employeeId]
                );
            }
        }
        
        await client.query('COMMIT');
        
        // Возвращаем полную запись с сотрудниками
        const fullResult = await client.query(`
            SELECT 
                pj.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', e.id,
                            'last_name', e.last_name,
                            'first_name', e.first_name,
                            'middle_name', e.middle_name,
                            'full_name', TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, '')))
                        )
                    ) FILTER (WHERE e.id IS NOT NULL),
                    '[]'::json
                ) AS employees
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
            LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
            WHERE pj.id = $1
            GROUP BY pj.id
        `, [journalId]);
        
        if (fullResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Failed to retrieve created entry' });
        }
        
        const row = fullResult.rows[0];
        
        // Преобразуем break_duration из INTERVAL в строку формата "чч:мм"
        if (row.break_duration) {
            if (typeof row.break_duration === 'object' && row.break_duration.hours !== undefined) {
                const hours = row.break_duration.hours || 0;
                const minutes = row.break_duration.minutes || 0;
                row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
            } else if (typeof row.break_duration === 'string') {
                const match = row.break_duration.match(/(\d+):(\d+):?(\d+)?/);
                if (match) {
                    const hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
                }
            }
        }
        
        // Преобразуем employees
        if (row.employees === null || row.employees === undefined) {
            row.employees = [];
        } else if (typeof row.employees === 'string') {
            try {
                row.employees = JSON.parse(row.employees);
            } catch (e) {
                row.employees = [];
            }
        } else if (!Array.isArray(row.employees)) {
            row.employees = [];
        }
        
        res.status(201).json(row);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating journal entry:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// PUT /api/project-journal/:id - обновить запись в журнале
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const { 
            date, 
            time_start, 
            time_end, 
            break_duration,
            work_id, 
            hours,
            quantity_completed, 
            notes,
            employee_ids // массив ID сотрудников (если передан, заменяем всех)
        } = req.body;
        
        // Вычисляем часы автоматически, если не указаны
        let calculatedHours = hours;
        if (!calculatedHours && time_start && time_end) {
            calculatedHours = calculateHours(time_start, time_end, break_duration);
        }
        
        // Вычисляем remaining_at_time (сколько оставалось на момент редактирования записи)
        // Исключаем текущую запись из расчета, чтобы не учитывать её в сумме выполненных
        const remainingAtTime = await calculateRemainingAtTime(client, work_id, date, time_start, id);
        
        // Обновляем запись в журнале
        const journalResult = await client.query(
            `UPDATE taiga.project_journal 
             SET date = $1, time_start = $2, time_end = $3, break_duration = $4,
                 hours = $5, work_id = $6, quantity_completed = $7, notes = $8, remaining_at_time = $9
             WHERE id = $10 
             RETURNING *`,
            [
                date, 
                time_start || null, 
                time_end || null, 
                break_duration || null,
                calculatedHours || null, 
                work_id || null, 
                quantity_completed || null, 
                notes || null,
                remainingAtTime,
                id
            ]
        );
        
        if (journalResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Not found' });
        }
        
        // Обновляем сотрудников, если передан массив employee_ids
        if (Array.isArray(employee_ids)) {
            // Удаляем старых сотрудников
            await client.query('DELETE FROM taiga.project_journal_workers WHERE journal_id = $1', [id]);
            
            // Добавляем новых
            for (const employeeId of employee_ids) {
                await client.query(
                    'INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)',
                    [id, employeeId]
                );
            }
        }
        
        await client.query('COMMIT');
        
        // Возвращаем полную запись с сотрудниками
        const fullResult = await client.query(`
            SELECT 
                pj.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', e.id,
                            'last_name', e.last_name,
                            'first_name', e.first_name,
                            'middle_name', e.middle_name,
                            'full_name', TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, '')))
                        )
                    ) FILTER (WHERE e.id IS NOT NULL),
                    '[]'::json
                ) AS employees
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
            LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
            WHERE pj.id = $1
            GROUP BY pj.id
        `, [id]);
        
        if (fullResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Not found' });
        }
        
        const row = fullResult.rows[0];
        
        // Преобразуем break_duration из INTERVAL в строку формата "чч:мм"
        if (row.break_duration) {
            if (typeof row.break_duration === 'object' && row.break_duration.hours !== undefined) {
                const hours = row.break_duration.hours || 0;
                const minutes = row.break_duration.minutes || 0;
                row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
            } else if (typeof row.break_duration === 'string') {
                const match = row.break_duration.match(/(\d+):(\d+):?(\d+)?/);
                if (match) {
                    const hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    row.break_duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
                }
            }
        }
        
        // Преобразуем employees
        if (row.employees === null || row.employees === undefined) {
            row.employees = [];
        } else if (typeof row.employees === 'string') {
            try {
                row.employees = JSON.parse(row.employees);
            } catch (e) {
                row.employees = [];
            }
        } else if (!Array.isArray(row.employees)) {
            row.employees = [];
        }
        
        res.json(row);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating journal entry:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// DELETE /api/project-journal/:id - удалить запись из журнала
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // CASCADE удалит связанные записи из project_journal_workers
        const result = await pool.query('DELETE FROM taiga.project_journal WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

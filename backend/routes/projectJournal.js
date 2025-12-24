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
    // Пробуем сначала project_works (основная таблица), потом p_feruz (fallback)
    let plannedQuantity = 0;
    
    try {
        // Сначала пробуем project_works
        const workResult = await client.query(
            'SELECT quantity FROM taiga.project_works WHERE id = $1',
            [workId]
        );
        
        if (workResult.rows.length > 0 && workResult.rows[0].quantity) {
            plannedQuantity = parseFloat(workResult.rows[0].quantity) || 0;
        } else {
            // Если не нашли в project_works, пробуем p_feruz
            try {
                const feruzResult = await client.query(
                    'SELECT quantity FROM taiga.p_feruz WHERE id = $1',
                    [workId]
                );
                if (feruzResult.rows.length > 0 && feruzResult.rows[0].quantity) {
                    plannedQuantity = parseFloat(feruzResult.rows[0].quantity) || 0;
                }
            } catch (e2) {
                // Если p_feruz не существует или ошибка - игнорируем
                console.warn('Не удалось получить quantity из p_feruz для work_id=' + workId + ':', e2.message);
            }
        }
    } catch (e) {
        // Если project_works не существует или ошибка, пробуем p_feruz
        try {
            const feruzResult = await client.query(
                'SELECT quantity FROM taiga.p_feruz WHERE id = $1',
                [workId]
            );
            if (feruzResult.rows.length > 0 && feruzResult.rows[0].quantity) {
                plannedQuantity = parseFloat(feruzResult.rows[0].quantity) || 0;
            }
        } catch (e2) {
            console.error('Ошибка при получении quantity для работы ' + workId + ':', e2.message);
            return null;
        }
    }
    
    if (plannedQuantity === 0) {
        return null;
    }
    
    // Находим все записи журнала для этой работы, которые были сделаны ДО текущей записи
    // Сортируем по дате и времени, чтобы учесть порядок выполнения
    if (!date) {
        return null; // Не можем вычислить без даты
    }
    
    // Строим запрос с правильной обработкой NULL для timeStart
    // Используем два отдельных запроса в зависимости от наличия timeStart
    let query;
    const params = [workId, date];
    
    if (timeStart) {
        // Если timeStart указан, используем его для сравнения
        query = `
            SELECT COALESCE(SUM(quantity_completed), 0) as total_completed
            FROM taiga.project_journal
            WHERE work_id = $1
            AND (
                date < $2::date
                OR (date = $2::date AND (
                    time_start IS NULL 
                    OR (time_start IS NOT NULL AND time_start::time < $3::time)
                ))
            )
        `;
        params.push(timeStart);
    } else {
        // Если timeStart не указан, считаем что записи без времени идут раньше
        query = `
            SELECT COALESCE(SUM(quantity_completed), 0) as total_completed
            FROM taiga.project_journal
            WHERE work_id = $1
            AND (
                date < $2::date
                OR (date = $2::date AND time_start IS NULL)
            )
        `;
    }
    
    // Исключаем текущую запись при редактировании
    if (excludeJournalId) {
        query += ' AND id != $' + (params.length + 1);
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
        
        // Получаем старую запись для сравнения
        const oldEntry = await client.query(
            'SELECT date, time_start, work_id, quantity_completed FROM taiga.project_journal WHERE id = $1',
            [id]
        );
        
        if (oldEntry.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Entry not found' });
        }
        
        const oldRow = oldEntry.rows[0];
        // Преобразуем даты в строки для корректного сравнения
        let oldDate = null;
        if (oldRow.date) {
            if (oldRow.date instanceof Date) {
                oldDate = oldRow.date.toISOString().split('T')[0];
            } else {
                // Если это строка, пытаемся извлечь дату
                const dateStr = String(oldRow.date);
                oldDate = dateStr.split('T')[0].split(' ')[0];
            }
        }
        const oldTimeStart = oldRow.time_start ? String(oldRow.time_start) : null;
        const oldWorkId = oldRow.work_id;
        const oldQuantityCompleted = oldRow.quantity_completed;
        
        // Преобразуем новую дату в строку для сравнения
        let newDate = null;
        if (date) {
            if (date instanceof Date) {
                newDate = date.toISOString().split('T')[0];
            } else {
                // Если это строка, пытаемся извлечь дату
                const dateStr = String(date);
                newDate = dateStr.split('T')[0].split(' ')[0];
            }
        }
        const newTimeStart = time_start ? String(time_start) : null;
        
        // Вычисляем часы автоматически, если не указаны
        let calculatedHours = hours;
        if (!calculatedHours && time_start && time_end) {
            calculatedHours = calculateHours(time_start, time_end, break_duration);
        }
        
        // Вычисляем remaining_at_time (сколько оставалось на момент редактирования записи)
        // Исключаем текущую запись из расчета, чтобы не учитывать её в сумме выполненных
        let remainingAtTime = null;
        if (work_id && newDate) {
            try {
                remainingAtTime = await calculateRemainingAtTime(client, work_id, newDate, newTimeStart, id);
            } catch (calcError) {
                console.error('Ошибка при вычислении remaining_at_time:', calcError);
                // Продолжаем без remaining_at_time, если ошибка
            }
        }
        
        // Обновляем запись в журнале
        // Используем исходные значения из req.body для UPDATE, но нормализуем дату
        const updateDate = newDate || date || null;
        const updateTimeStart = newTimeStart || time_start || null;
        
        const journalResult = await client.query(
            `UPDATE taiga.project_journal 
             SET date = $1, time_start = $2, time_end = $3, break_duration = $4,
                 hours = $5, work_id = $6, quantity_completed = $7, notes = $8, remaining_at_time = $9
             WHERE id = $10 
             RETURNING *`,
            [
                updateDate, 
                updateTimeStart, 
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
        
        // Пересчитываем remaining_at_time для всех последующих записей той же работы
        // Это нужно, потому что изменение количества в текущей записи влияет на остаток в последующих
        // Также пересчитываем, если изменилась дата/время или work_id
        const workIdsToRecalculate = new Set();
        if (work_id) workIdsToRecalculate.add(work_id);
        if (oldWorkId && oldWorkId !== work_id) workIdsToRecalculate.add(oldWorkId);
        
        // Определяем, нужно ли пересчитывать (если изменилось количество, дата, время или work_id)
        const quantityChanged = quantity_completed !== undefined && 
                               parseFloat(quantity_completed || 0) !== parseFloat(oldQuantityCompleted || 0);
        const needsRecalculation = 
            oldDate !== newDate || 
            oldTimeStart !== newTimeStart || 
            oldWorkId !== work_id ||
            quantityChanged;
        
        if (needsRecalculation && workIdsToRecalculate.size > 0 && newDate) {
            try {
                for (const recalcWorkId of workIdsToRecalculate) {
                    // Находим все записи этой работы, которые идут после обновлённой записи
                    // Используем новую дату/время для определения "после"
                    let subsequentQuery;
                    let subsequentParams;
                    
                    if (newTimeStart) {
                        // Если время указано, используем его для сравнения
                        subsequentQuery = `
                            SELECT id, date, time_start 
                            FROM taiga.project_journal 
                            WHERE work_id = $1 
                            AND id != $2
                            AND (
                                date > $3::date
                                OR (date = $3::date AND (
                                    time_start IS NULL 
                                    OR (time_start IS NOT NULL AND time_start::time > $4::time)
                                ))
                            )
                            ORDER BY date ASC, COALESCE(time_start, '00:00:00'::time) ASC
                        `;
                        subsequentParams = [recalcWorkId, id, newDate, newTimeStart];
                    } else {
                        // Если время не указано, ищем записи с более поздней датой или с временем на ту же дату
                        subsequentQuery = `
                            SELECT id, date, time_start 
                            FROM taiga.project_journal 
                            WHERE work_id = $1 
                            AND id != $2
                            AND (
                                date > $3::date
                                OR (date = $3::date AND time_start IS NOT NULL)
                            )
                            ORDER BY date ASC, COALESCE(time_start, '00:00:00'::time) ASC
                        `;
                        subsequentParams = [recalcWorkId, id, newDate];
                    }
                    
                    const subsequentEntries = await client.query(subsequentQuery, subsequentParams);
                    
                    // Пересчитываем remaining_at_time для каждой последующей записи
                    for (const entry of subsequentEntries.rows) {
                        try {
                            // Нормализуем дату записи
                            let entryDate = null;
                            if (entry.date) {
                                if (entry.date instanceof Date) {
                                    entryDate = entry.date.toISOString().split('T')[0];
                                } else {
                                    const dateStr = String(entry.date);
                                    entryDate = dateStr.split('T')[0].split(' ')[0];
                                }
                            }
                            const entryTimeStart = entry.time_start ? String(entry.time_start) : null;
                            
                            if (entryDate) {
                                const newRemaining = await calculateRemainingAtTime(
                                    client, 
                                    recalcWorkId, 
                                    entryDate, 
                                    entryTimeStart, 
                                    null // не исключаем запись, так как пересчитываем для неё
                                );
                                
                                if (newRemaining !== null) {
                                    await client.query(
                                        'UPDATE taiga.project_journal SET remaining_at_time = $1 WHERE id = $2',
                                        [newRemaining, entry.id]
                                    );
                                }
                            }
                        } catch (recalcError) {
                            console.error(`Ошибка при пересчёте remaining_at_time для записи ${entry.id}:`, recalcError);
                            // Продолжаем обработку других записей
                        }
                    }
                }
            } catch (recalcError) {
                console.error('Ошибка при пересчёте последующих записей:', recalcError);
                // Не прерываем транзакцию, так как основная запись уже обновлена
                // Продолжаем выполнение, чтобы сохранить основную запись
            }
        }
        
        // Коммитим транзакцию - основная запись должна быть сохранена
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
        console.error('Error stack:', error.stack);
        console.error('Request params:', req.params);
        console.error('Request body:', req.body);
        res.status(500).json({ error: error.message, details: error.stack });
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

// ===========================================
// Обновление записей журнала согласно списку
// ===========================================

const pool = require('../db');

async function updateJournalEntries() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим проект
        const projectRes = await client.query(`
            SELECT id, name FROM taiga.projects 
            WHERE name LIKE '%Гостевой 5х8%' OR name LIKE '%Феруз%'
            ORDER BY id LIMIT 1
        `);
        
        if (projectRes.rows.length === 0) {
            throw new Error('Проект не найден');
        }
        
        const projectId = projectRes.rows[0].id;
        console.log(`✅ Найден проект: ${projectRes.rows[0].name} (ID: ${projectId})`);
        
        // Находим сотрудников
        const maxRes = await client.query(`
            SELECT id FROM taiga.employees 
            WHERE last_name = 'Барабанов' AND first_name = 'Максим'
            LIMIT 1
        `);
        
        const zhuraRes = await client.query(`
            SELECT id FROM taiga.employees 
            WHERE last_name = 'Жура'
            LIMIT 1
        `);
        
        if (maxRes.rows.length === 0 || zhuraRes.rows.length === 0) {
            throw new Error('Сотрудники не найдены');
        }
        
        const maxId = maxRes.rows[0].id;
        const zhuraId = zhuraRes.rows[0].id;
        console.log(`✅ Найдены сотрудники: Макс (ID: ${maxId}), Жура (ID: ${zhuraId})`);
        
        // Находим работы
        const works = {};
        
        // Перевозка инструмента
        let workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Подсобка'
            AND wt.name LIKE '%перевозка инструмента%'
            LIMIT 1
        `, [projectId]);
        works['перевозка инструмента'] = workRes.rows.length > 0 ? workRes.rows[0].id : null;
        
        // Обустройство бытовки
        workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Подсобка'
            AND wt.name LIKE '%обустройство бытовки%'
            LIMIT 1
        `, [projectId]);
        works['обустройство бытовки'] = workRes.rows.length > 0 ? workRes.rows[0].id : null;
        
        // Стены 50х100хх6000
        workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Стены'
            AND wt.name LIKE '%50х100%'
            LIMIT 1
        `, [projectId]);
        works['50х100хх6000'] = workRes.rows.length > 0 ? workRes.rows[0].id : null;
        
        // Доставка материала
        workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Подсобка'
            AND wt.name LIKE '%доставка материала%'
            LIMIT 1
        `, [projectId]);
        works['доставка материала'] = workRes.rows.length > 0 ? workRes.rows[0].id : null;
        
        // Установка свай
        workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Фундамент'
            AND wt.name LIKE '%Установка свай%'
            LIMIT 1
        `, [projectId]);
        works['установка свай'] = workRes.rows.length > 0 ? workRes.rows[0].id : null;
        
        console.log('✅ Найдены работы:', works);
        
        // Функция для вычисления часов
        function calculateHours(timeStart, timeEnd, breakDuration) {
            if (!timeStart || !timeEnd) return null;
            const start = new Date(`2000-01-01T${timeStart}`);
            const end = new Date(`2000-01-01T${timeEnd}`);
            let diff = (end - start) / (1000 * 60 * 60);
            if (breakDuration) {
                const breakMatch = breakDuration.match(/(\d+):(\d+)/);
                if (breakMatch) {
                    const breakHours = parseInt(breakMatch[1]) + parseInt(breakMatch[2]) / 60;
                    diff -= breakHours;
                }
            }
            return Math.max(0, Math.round(diff * 100) / 100);
        }
        
        // Функция для добавления/обновления записи
        async function upsertJournalEntry(date, timeStart, timeEnd, breakDuration, workKey, quantity, employeeIds, notes = null) {
            const workId = works[workKey];
            if (!workId) {
                console.log(`   ⚠️  Работа "${workKey}" не найдена, пропускаем`);
                return;
            }
            
            const hours = calculateHours(timeStart, timeEnd, breakDuration);
            
            // Проверяем, есть ли уже запись на эту дату и время
            const existingRes = await client.query(`
                SELECT id FROM taiga.project_journal
                WHERE project_id = $1 
                AND date = $2 
                AND time_start = $3
                AND work_id = $4
                LIMIT 1
            `, [projectId, date, timeStart, workId]);
            
            let journalId;
            
            if (existingRes.rows.length > 0) {
                // Обновляем существующую запись
                journalId = existingRes.rows[0].id;
                await client.query(`
                    UPDATE taiga.project_journal
                    SET time_end = $1, break_duration = $2, hours = $3, 
                        quantity_completed = $4, notes = $5
                    WHERE id = $6
                `, [timeEnd, breakDuration, hours, quantity, notes, journalId]);
                console.log(`   ✅ Обновлена запись ID ${journalId}: ${date} ${timeStart}-${timeEnd}`);
            } else {
                // Создаём новую запись
                const journalRes = await client.query(`
                    INSERT INTO taiga.project_journal 
                    (project_id, date, time_start, time_end, break_duration, hours, work_id, quantity_completed, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id
                `, [projectId, date, timeStart, timeEnd, breakDuration, hours, workId, quantity, notes]);
                journalId = journalRes.rows[0].id;
                console.log(`   ✅ Создана запись ID ${journalId}: ${date} ${timeStart}-${timeEnd}`);
            }
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [journalId]);
            
            // Добавляем новых сотрудников
            for (const empId of employeeIds) {
                await client.query(`
                    INSERT INTO taiga.project_journal_workers (journal_id, employee_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `, [journalId, empId]);
            }
        }
        
        console.log('\n📝 Обновляем записи в журнале...\n');
        
        // 5.12. Подсобные - перевозка инструмента с цеха на объект 9:00-21:00 Макс Жура
        await upsertJournalEntry('2025-12-05', '09:00', '21:00', null, 'перевозка инструмента', null, [maxId, zhuraId]);
        
        // 6.12. Подсобные - обустройство бытовки Жура 10:00-19:00 Перерыв 1час
        await upsertJournalEntry('2025-12-06', '10:00', '19:00', '1:00', 'обустройство бытовки', null, [zhuraId]);
        
        // 7.12. Подсобные - обустройство бытовки Макс Жура 12:00-19:00
        await upsertJournalEntry('2025-12-07', '12:00', '19:00', null, 'обустройство бытовки', null, [maxId, zhuraId]);
        
        // 8.12. Стены 50х100хх6000 шт 1 Макс Жура 10:00-19:00 Перерыв 1час
        await upsertJournalEntry('2025-12-08', '10:00', '19:00', '1:00', '50х100хх6000', 1, [maxId, zhuraId]);
        
        // 9.12. Стены 50х100хх6000 шт 1 Макс Жура 10:00-19:00 Перерыв 1час
        await upsertJournalEntry('2025-12-09', '10:00', '19:00', '1:00', '50х100хх6000', 1, [maxId, zhuraId]);
        
        // 10.12. Стены 50х100хх6000 шт 2 Макс Жура 10:00-19:00 Перерыв 1час
        await upsertJournalEntry('2025-12-10', '10:00', '19:00', '1:00', '50х100хх6000', 2, [maxId, zhuraId]);
        
        // 11.12. Подсобные - доставка материала на объект Макс 10:00-21:00
        await upsertJournalEntry('2025-12-11', '10:00', '21:00', null, 'доставка материала', null, [maxId]);
        
        // 10.12 Фундамент Установка свай шт 15,00 Подрядчик МетроСваи
        // Это подрядчик, не сотрудники, поэтому employeeIds пустой массив
        await upsertJournalEntry('2025-12-10', null, null, null, 'установка свай', 15, [], 'Подрядчик МетроСваи');
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи обновлены успешно!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updateJournalEntries();




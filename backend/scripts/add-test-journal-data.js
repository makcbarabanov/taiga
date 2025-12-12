// ===========================================
// Добавление тестовых данных в журнал
// ===========================================

const pool = require('../db');

async function addTestJournalData() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим проект "Гостевой 5х8" или "Феруз Гостевой 5х8"
        const projectRes = await client.query(`
            SELECT id, name FROM taiga.projects 
            WHERE name LIKE '%Гостевой 5х8%' OR name LIKE '%Феруз%'
            ORDER BY id LIMIT 1
        `);
        
        if (projectRes.rows.length === 0) {
            throw new Error('Проект не найден');
        }
        
        const projectId = projectRes.rows[0].id;
        const projectName = projectRes.rows[0].name;
        console.log(`✅ Найден проект: ${projectName} (ID: ${projectId})`);
        
        // Находим сотрудников
        const employeesRes = await client.query(`
            SELECT id, last_name, first_name, middle_name 
            FROM taiga.employees 
            WHERE (last_name ILIKE '%Макс%' OR first_name ILIKE '%Макс%' OR last_name ILIKE '%Барабанов%')
               OR (last_name ILIKE '%Жура%' OR first_name ILIKE '%Жура%')
            ORDER BY id
        `);
        
        const employees = {};
        employeesRes.rows.forEach(emp => {
            const fullName = `${emp.last_name || ''} ${emp.first_name || ''} ${emp.middle_name || ''}`.trim().toLowerCase();
            if (fullName.includes('макс') || fullName.includes('барабанов')) {
                employees['Макс'] = emp.id;
            }
            if (fullName.includes('жура')) {
                employees['Жура'] = emp.id;
            }
        });
        
        console.log('✅ Найдены сотрудники:', employees);
        
        // Находим или создаём работы
        const works = {};
        
        // Подсобные - перевозка инструмента
        let workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Подсобка'
            AND wt.name LIKE '%перевозка инструмента%'
            LIMIT 1
        `, [projectId]);
        
        if (workRes.rows.length === 0) {
            // Создаём работу
            const sectionRes = await client.query(`SELECT id FROM taiga.work_sections WHERE name = 'Подсобка' LIMIT 1`);
            if (sectionRes.rows.length === 0) {
                throw new Error('Раздел "Подсобка" не найден');
            }
            const workTypeRes = await client.query(`
                INSERT INTO taiga.work_types (name) 
                VALUES ('перевозка инструмента с цеха на объект')
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `);
            const workTypeId = workTypeRes.rows[0].id;
            
            workRes = await client.query(`
                INSERT INTO taiga.project_works (project_id, section_id, work_type_id, quantity, unit_id)
                VALUES ($1, $2, $3, 1, (SELECT id FROM taiga.units WHERE name = 'шт' LIMIT 1))
                RETURNING id
            `, [projectId, sectionRes.rows[0].id, workTypeId]);
        }
        works['перевозка инструмента'] = workRes.rows[0].id;
        
        // Подсобные - обустройство бытовки
        workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Подсобка'
            AND wt.name LIKE '%обустройство бытовки%'
            LIMIT 1
        `, [projectId]);
        
        if (workRes.rows.length === 0) {
            const sectionRes = await client.query(`SELECT id FROM taiga.work_sections WHERE name = 'Подсобка' LIMIT 1`);
            const workTypeRes = await client.query(`
                INSERT INTO taiga.work_types (name) 
                VALUES ('обустройство бытовки')
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `);
            const workTypeId = workTypeRes.rows[0].id;
            
            workRes = await client.query(`
                INSERT INTO taiga.project_works (project_id, section_id, work_type_id, quantity, unit_id)
                VALUES ($1, $2, $3, 1, (SELECT id FROM taiga.units WHERE name = 'шт' LIMIT 1))
                RETURNING id
            `, [projectId, sectionRes.rows[0].id, workTypeId]);
        }
        works['обустройство бытовки'] = workRes.rows[0].id;
        
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
        
        if (workRes.rows.length > 0) {
            works['50х100хх6000'] = workRes.rows[0].id;
        } else {
            console.log('⚠️  Работа "Стены 50х100хх6000" не найдена, пропускаем');
        }
        
        // Подсобные - доставка материала
        workRes = await client.query(`
            SELECT pw.id FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1 
            AND wsec.name = 'Подсобка'
            AND wt.name LIKE '%доставка материала%'
            LIMIT 1
        `, [projectId]);
        
        if (workRes.rows.length === 0) {
            const sectionRes = await client.query(`SELECT id FROM taiga.work_sections WHERE name = 'Подсобка' LIMIT 1`);
            const workTypeRes = await client.query(`
                INSERT INTO taiga.work_types (name) 
                VALUES ('доставка материала на объект')
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `);
            const workTypeId = workTypeRes.rows[0].id;
            
            workRes = await client.query(`
                INSERT INTO taiga.project_works (project_id, section_id, work_type_id, quantity, unit_id)
                VALUES ($1, $2, $3, 1, (SELECT id FROM taiga.units WHERE name = 'шт' LIMIT 1))
                RETURNING id
            `, [projectId, sectionRes.rows[0].id, workTypeId]);
        }
        works['доставка материала'] = workRes.rows[0].id;
        
        console.log('✅ Найдены/созданы работы:', works);
        
        // Функция для добавления записи в журнал
        async function addJournalEntry(date, timeStart, timeEnd, breakDuration, workKey, quantity, employeeNames) {
            const workId = works[workKey];
            if (!workId) {
                console.log(`⚠️  Работа "${workKey}" не найдена, пропускаем`);
                return;
            }
            
            // Вычисляем часы
            let hours = null;
            if (timeStart && timeEnd) {
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
                hours = Math.max(0, Math.round(diff * 100) / 100);
            }
            
            // Добавляем запись в журнал
            const journalRes = await client.query(`
                INSERT INTO taiga.project_journal 
                (project_id, date, time_start, time_end, break_duration, hours, work_id, quantity_completed)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [projectId, date, timeStart, timeEnd, breakDuration, hours, workId, quantity]);
            
            const journalId = journalRes.rows[0].id;
            
            // Добавляем сотрудников
            for (const empName of employeeNames) {
                const empId = employees[empName];
                if (empId) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [journalId, empId]);
                }
            }
            
            console.log(`   ✅ Добавлена запись: ${date} ${timeStart}-${timeEnd} ${workKey}`);
        }
        
        // Добавляем данные
        console.log('\n📝 Добавляем записи в журнал...\n');
        
        // 5.12. Подсобные - перевозка инструмента с цеха на объект 9:00-21:00 Макс Жура
        await addJournalEntry('2025-12-05', '09:00', '21:00', null, 'перевозка инструмента', null, ['Макс', 'Жура']);
        
        // 6.12. Подсобные - обустройство бытовки Жура 10:00-19:00 Перерыв 1час
        await addJournalEntry('2025-12-06', '10:00', '19:00', '1:00', 'обустройство бытовки', null, ['Жура']);
        
        // 7.12. Подсобные - обустройство бытовки Макс Жура 12:00-19:00
        await addJournalEntry('2025-12-07', '12:00', '19:00', null, 'обустройство бытовки', null, ['Макс', 'Жура']);
        
        // 8.12. Стены 50х100хх6000 шт 1 Макс Жура 10:00-19:00 Перерыв 1час
        if (works['50х100хх6000']) {
            await addJournalEntry('2025-12-08', '10:00', '19:00', '1:00', '50х100хх6000', 1, ['Макс', 'Жура']);
        }
        
        // 9.12. Стены 50х100хх6000 шт 1 Макс Жура 10:00-19:00 Перерыв 1час
        if (works['50х100хх6000']) {
            await addJournalEntry('2025-12-09', '10:00', '19:00', '1:00', '50х100хх6000', 1, ['Макс', 'Жура']);
        }
        
        // 10.12. Стены 50х100хх6000 шт 2 Макс Жура 10:00-19:00 Перерыв 1час
        if (works['50х100хх6000']) {
            await addJournalEntry('2025-12-10', '10:00', '19:00', '1:00', '50х100хх6000', 2, ['Макс', 'Жура']);
        }
        
        // 11.12. Подсобные - доставка материала на объект Макс 10:00-21:00
        await addJournalEntry('2025-12-11', '10:00', '21:00', null, 'доставка материала', null, ['Макс']);
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи добавлены успешно!');
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

addTestJournalData();


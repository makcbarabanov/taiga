// ===========================================
// Исправление сотрудников во всех записях журнала
// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();




// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();

// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();




// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();

// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();




// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();

// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();




// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();

// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();




// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();

// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();




// ===========================================

const pool = require('../db');

async function fixJournalEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим ID сотрудников
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
        
        // Находим все записи журнала за последние дни с информацией о работах
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end, 
                   wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}\n`);
        
        // Обновляем записи
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start ? entry.time_start.substring(0, 5) : null;
            const workName = entry.work_type_name || '';
            const sectionName = entry.section_name || '';
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            let employeesToAdd = [];
            
            // Определяем сотрудников по названию работы
            if (workName.includes('перевозка инструмента')) {
                // 5.12. перевозка инструмента - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('обустройство бытовки')) {
                // Проверяем дату для определения сотрудников
                if (date === '2025-12-06' || (date === '2025-12-07' && timeStart === '12:00')) {
                    // 6.12. или 7.12. 12:00 - только Жура
                    employeesToAdd = [zhuraId];
                } else if (date === '2025-12-07') {
                    // 7.12. - Макс, Жура
                    employeesToAdd = [maxId, zhuraId];
                } else {
                    // По умолчанию - Жура
                    employeesToAdd = [zhuraId];
                }
            } else if (workName.includes('50х100')) {
                // 8-10.12. Стены 50х100 - Макс, Жура
                employeesToAdd = [maxId, zhuraId];
            } else if (workName.includes('доставка материала')) {
                // 11.12. доставка материала - Макс
                employeesToAdd = [maxId];
            }
            
            // Добавляем сотрудников
            if (employeesToAdd.length > 0) {
                for (const empId of employeesToAdd) {
                    await client.query(`
                        INSERT INTO taiga.project_journal_workers (journal_id, employee_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [entry.id, empId]);
                }
                const empNames = employeesToAdd.map(id => id === maxId ? 'Макс' : 'Жура').join(', ');
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart || '-'}): ${empNames}`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart || '-'}, ${sectionName} - ${workName}) - не определены сотрудники`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи журнала обновлены!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixJournalEmployees();

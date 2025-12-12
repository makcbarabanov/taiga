// ===========================================
// Обновление сотрудников в записях журнала
// ===========================================

const pool = require('../db');

async function updateJournalEmployees() {
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
        
        // Находим все записи журнала за последние дни
        const journalRes = await client.query(`
            SELECT pj.id, pj.date, pj.time_start, pj.time_end
            FROM taiga.project_journal pj
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date, pj.time_start
        `);
        
        console.log(`\n📝 Найдено записей в журнале: ${journalRes.rows.length}`);
        
        // Обновляем записи в зависимости от даты и времени
        for (const entry of journalRes.rows) {
            const date = entry.date.toISOString().split('T')[0];
            const timeStart = entry.time_start;
            
            // Удаляем старых сотрудников
            await client.query(`
                DELETE FROM taiga.project_journal_workers 
                WHERE journal_id = $1
            `, [entry.id]);
            
            // Добавляем правильных сотрудников
            if (date === '2025-12-05' && timeStart === '09:00:00') {
                // 5.12. перевозка инструмента - Макс, Жура
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, maxId]);
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, zhuraId]);
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart}): Макс, Жура`);
            } else if (date === '2025-12-06' && timeStart === '10:00:00') {
                // 6.12. обустройство бытовки - Жура
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, zhuraId]);
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart}): Жура`);
            } else if (date === '2025-12-07' && timeStart === '12:00:00') {
                // 7.12. обустройство бытовки - Макс, Жура
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, maxId]);
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, zhuraId]);
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart}): Макс, Жура`);
            } else if (date === '2025-12-08' && timeStart === '10:00:00') {
                // 8.12. Стены - Макс, Жура
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, maxId]);
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, zhuraId]);
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart}): Макс, Жура`);
            } else if (date === '2025-12-09' && timeStart === '10:00:00') {
                // 9.12. Стены - Макс, Жура
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, maxId]);
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, zhuraId]);
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart}): Макс, Жура`);
            } else if (date === '2025-12-10' && timeStart === '10:00:00') {
                // 10.12. Стены - Макс, Жура
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, maxId]);
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, zhuraId]);
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart}): Макс, Жура`);
            } else if (date === '2025-12-11' && timeStart === '10:00:00') {
                // 11.12. доставка материала - Макс
                await client.query(`INSERT INTO taiga.project_journal_workers (journal_id, employee_id) VALUES ($1, $2)`, [entry.id, maxId]);
                console.log(`   ✅ Обновлена запись ${entry.id} (${date} ${timeStart}): Макс`);
            } else {
                console.log(`   ⚠️  Пропущена запись ${entry.id} (${date} ${timeStart}) - не соответствует шаблону`);
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

updateJournalEmployees();


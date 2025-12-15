// ===========================================
// Проверка сотрудников в записях журнала
// ===========================================

const pool = require('../db');

async function checkJournalEmployees() {
    try {
        const res = await pool.query(`
            SELECT 
                pj.id,
                pj.date,
                pj.time_start,
                pj.time_end,
                e.id as employee_id,
                e.last_name,
                e.first_name,
                e.middle_name
            FROM taiga.project_journal pj
            LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
            LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
            WHERE pj.date >= '2025-12-05'
            ORDER BY pj.date DESC, pj.time_start
        `);
        
        console.log('Записи журнала с сотрудниками:\n');
        
        const grouped = {};
        res.rows.forEach(row => {
            if (!grouped[row.id]) {
                grouped[row.id] = {
                    id: row.id,
                    date: row.date,
                    time_start: row.time_start,
                    time_end: row.time_end,
                    employees: []
                };
            }
            if (row.employee_id) {
                const name = [row.last_name, row.first_name, row.middle_name].filter(x => x).join(' ') || 'Без имени';
                grouped[row.id].employees.push(name);
            }
        });
        
        Object.values(grouped).forEach(entry => {
            const date = entry.date.toISOString().split('T')[0];
            const time = entry.time_start && entry.time_end 
                ? `${entry.time_start.substring(0,5)} - ${entry.time_end.substring(0,5)}`
                : '-';
            const employees = entry.employees.length > 0 ? entry.employees.join(', ') : '-';
            console.log(`ID: ${entry.id}, Дата: ${date}, Время: ${time}`);
            console.log(`   Сотрудники: ${employees}\n`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

checkJournalEmployees();




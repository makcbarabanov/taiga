// ===========================================
// Тест SQL запроса журнала
// ===========================================

const pool = require('../db');

async function testJournalQuery() {
    try {
        const projectId = 1;
        
        const query = `
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
            WHERE pj.project_id = $1
            GROUP BY pj.id, pj.project_id, pj.date, pj.worker_name, pj.work_id, pj.hours, pj.quantity_completed, pj.notes, pj.created_at, pj.updated_at, pj.time_start, pj.time_end, pj.break_duration
            ORDER BY pj.date DESC, pj.time_start
            LIMIT 3
        `;
        
        const result = await pool.query(query, [projectId]);
        
        console.log('Результат запроса:');
        result.rows.forEach((row, index) => {
            console.log(`\nЗапись ${index + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Дата: ${row.date}`);
            console.log(`  employees:`, row.employees);
            console.log(`  employees type:`, typeof row.employees);
            console.log(`  employees isArray:`, Array.isArray(row.employees));
        });
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

testJournalQuery();




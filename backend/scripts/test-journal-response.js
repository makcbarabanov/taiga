// ===========================================
// Тест ответа API журнала
// ===========================================

const pool = require('../db');

async function testJournalResponse() {
    try {
        const projectId = 1;
        
        const query = `
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
            WHERE pj.project_id = $1
            GROUP BY pj.id
            ORDER BY pj.date DESC, pj.time_start
            LIMIT 3
        `;
        
        const result = await pool.query(query, [projectId]);
        
        // Преобразуем как в API
        const rows = result.rows.map(row => {
            if (row.employees && typeof row.employees === 'string') {
                try {
                    row.employees = JSON.parse(row.employees);
                } catch (e) {
                    row.employees = [];
                }
            }
            if (!row.employees) {
                row.employees = [];
            }
            return row;
        });
        
        console.log('Результат после обработки (как в API):');
        console.log(JSON.stringify(rows, null, 2));
        
        // Проверяем первую запись
        if (rows.length > 0) {
            const first = rows[0];
            console.log('\nПервая запись:');
            console.log('  ID:', first.id);
            console.log('  Дата:', first.date);
            console.log('  employees:', first.employees);
            console.log('  employees type:', typeof first.employees);
            console.log('  employees isArray:', Array.isArray(first.employees));
            if (Array.isArray(first.employees)) {
                console.log('  employees length:', first.employees.length);
                first.employees.forEach((emp, i) => {
                    console.log(`    ${i + 1}. ${emp.full_name || 'Без имени'}`);
                });
            }
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

testJournalResponse();




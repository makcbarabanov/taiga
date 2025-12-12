// ===========================================
// Тест API журнала
// ===========================================

const pool = require('../db');

async function testJournalAPI() {
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
        
        console.log('Результаты запроса:');
        result.rows.forEach((row, index) => {
            console.log(`\nЗапись ${index + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Дата: ${row.date}`);
            console.log(`  Время: ${row.time_start} - ${row.time_end}`);
            console.log(`  Сотрудники (тип): ${typeof row.employees}`);
            console.log(`  Сотрудники (значение):`, row.employees);
            if (row.employees) {
                if (typeof row.employees === 'string') {
                    try {
                        const parsed = JSON.parse(row.employees);
                        console.log(`  Сотрудники (распарсено):`, parsed);
                    } catch (e) {
                        console.log(`  Ошибка парсинга:`, e.message);
                    }
                } else if (Array.isArray(row.employees)) {
                    console.log(`  Количество сотрудников: ${row.employees.length}`);
                    row.employees.forEach((emp, i) => {
                        console.log(`    ${i + 1}. ${emp.full_name || 'Без имени'}`);
                    });
                }
            }
        });
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

testJournalAPI();


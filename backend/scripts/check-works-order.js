// ===========================================
// Проверка порядка работ
// ===========================================

const pool = require('../db');

async function checkWorksOrder() {
    try {
        const res = await pool.query(`
            SELECT pw.id, pw.sort_order, 
                   COALESCE(wsec.name || ' - ' || wt.name, wt.name) as work_name,
                   wsec.name as section_name
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = 1
            ORDER BY pw.sort_order
            LIMIT 20
        `);
        
        console.log('Первые 20 работ по sort_order:');
        res.rows.forEach(r => {
            console.log(`  ${r.sort_order}: ${r.work_name}`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

checkWorksOrder();




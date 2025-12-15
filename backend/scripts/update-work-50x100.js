// ===========================================
// Обновление работы: Стены 50х100хх6000
// ===========================================

const pool = require('../db');

async function updateWork() {
    try {
        // Находим работу
        const findRes = await pool.query(`
            SELECT pw.id, pw.quantity, pw.unit_id, u.name as unit_name, wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            LEFT JOIN taiga.units u ON pw.unit_id = u.id
            WHERE wsec.name = 'Стены'
            AND wt.name LIKE '%50х100хх6000%'
            AND pw.quantity = 31.00
        `);
        
        if (findRes.rows.length === 0) {
            console.log('⚠️  Работа не найдена');
            await pool.end();
            return;
        }
        
        console.log('Найдена работа:');
        findRes.rows.forEach(work => {
            console.log(`  ID: ${work.id}`);
            console.log(`  Раздел: ${work.section_name}`);
            console.log(`  Тип работы: ${work.work_type_name}`);
            console.log(`  Текущее количество: ${work.quantity} ${work.unit_name}`);
        });
        
        // Находим единицу измерения "шт"
        const unitRes = await pool.query(`
            SELECT id, name FROM taiga.units WHERE name = 'шт' OR short_name = 'шт' LIMIT 1
        `);
        
        if (unitRes.rows.length === 0) {
            console.log('⚠️  Единица измерения "шт" не найдена');
            await pool.end();
            return;
        }
        
        const unitId = unitRes.rows[0].id;
        console.log(`\nЕдиница измерения "шт" найдена: ID ${unitId}`);
        
        // Обновляем работу
        for (const work of findRes.rows) {
            await pool.query(`
                UPDATE taiga.project_works
                SET quantity = 7,
                    unit_id = $1
                WHERE id = $2
            `, [unitId, work.id]);
            
            console.log(`\n✅ Работа ID ${work.id} обновлена:`);
            console.log(`   Количество: 31.00 м → 7 шт`);
            console.log(`   Единица измерения: ${work.unit_name} → шт`);
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

updateWork();




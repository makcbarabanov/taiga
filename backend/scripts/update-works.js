// ===========================================
// Обновление и удаление работ
// ===========================================

const pool = require('../db');

async function updateWorks() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу "Стены 50х100хх6000" с единицей измерения "м" и количеством 31
        console.log('🔍 Ищем работу "Стены 50х100хх6000 м 31,00"...');
        const findWork1 = await client.query(`
            SELECT pw.id, pw.project_id, p.name as project_name, 
                   wsec.name as section_name, wt.name as work_type_name, 
                   pw.quantity, u.name as unit_name, u.id as unit_id
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            LEFT JOIN taiga.units u ON pw.unit_id = u.id
            LEFT JOIN taiga.projects p ON pw.project_id = p.id
            WHERE (wsec.name || ' - ' || wt.name) LIKE '%50х100хх6000%'
            AND u.name = 'м'
            AND pw.quantity = 31
        `);
        
        if (findWork1.rows.length > 0) {
            console.log(`✅ Найдено работ: ${findWork1.rows.length}`);
            findWork1.rows.forEach(r => {
                console.log(`   ID: ${r.id}, Проект: ${r.project_name}, Работа: ${r.section_name} - ${r.work_type_name}, Кол-во: ${r.quantity} ${r.unit_name}`);
            });
            
            // Находим единицу измерения "шт"
            const unitSh = await client.query(`SELECT id FROM taiga.units WHERE name = 'шт' LIMIT 1`);
            if (unitSh.rows.length === 0) {
                throw new Error('Единица измерения "шт" не найдена');
            }
            const unitShId = unitSh.rows[0].id;
            
            // Обновляем каждую найденную работу
            for (const work of findWork1.rows) {
                await client.query(
                    `UPDATE taiga.project_works 
                     SET quantity = $1, unit_id = $2 
                     WHERE id = $3`,
                    [7, unitShId, work.id]
                );
                console.log(`   ✅ Обновлена работа ID ${work.id}: количество = 7, единица = шт`);
            }
        } else {
            console.log('⚠️  Работа "Стены 50х100хх6000 м 31,00" не найдена');
        }
        
        // 2. Находим и удаляем работу "Стены 25х100х6000 раскос"
        console.log('\n🔍 Ищем работу "Стены 25х100х6000 раскос шт 9,00"...');
        const findWork2 = await client.query(`
            SELECT pw.id, pw.project_id, p.name as project_name, 
                   wsec.name as section_name, wt.name as work_type_name, 
                   pw.quantity, u.name as unit_name
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            LEFT JOIN taiga.units u ON pw.unit_id = u.id
            LEFT JOIN taiga.projects p ON pw.project_id = p.id
            WHERE (wsec.name || ' - ' || wt.name) LIKE '%25х100х6000 раскос%'
        `);
        
        if (findWork2.rows.length > 0) {
            console.log(`✅ Найдено работ: ${findWork2.rows.length}`);
            findWork2.rows.forEach(r => {
                console.log(`   ID: ${r.id}, Проект: ${r.project_name}, Работа: ${r.section_name} - ${r.work_type_name}, Кол-во: ${r.quantity} ${r.unit_name}`);
            });
            
            // Удаляем каждую найденную работу
            for (const work of findWork2.rows) {
                await client.query(`DELETE FROM taiga.project_works WHERE id = $1`, [work.id]);
                console.log(`   ✅ Удалена работа ID ${work.id}`);
            }
        } else {
            console.log('⚠️  Работа "Стены 25х100х6000 раскос" не найдена');
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все операции выполнены успешно!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updateWorks();


// ===========================================
// Исправление количества в работе "Установка свай"
// ===========================================

const pool = require('../db');

async function fixPilesQuantity() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим работу "Установка свай" в проекте
        const workRes = await client.query(`
            SELECT pw.id, pw.quantity, p.name as project_name
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            LEFT JOIN taiga.projects p ON pw.project_id = p.id
            WHERE wsec.name = 'Фундамент'
            AND wt.name LIKE '%Установка свай%'
            AND pw.quantity = 13
        `);
        
        if (workRes.rows.length > 0) {
            for (const work of workRes.rows) {
                await client.query(`
                    UPDATE taiga.project_works
                    SET quantity = 15
                    WHERE id = $1
                `, [work.id]);
                console.log(`✅ Обновлена работа ID ${work.id} (${work.project_name}): количество изменено с 13 на 15`);
            }
        } else {
            console.log('⚠️  Работа "Установка свай" с количеством 13 не найдена');
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Количество исправлено!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixPilesQuantity();


// ===========================================
// Исправление прогресса работы: Стены 50х100хх6000
// ===========================================

const pool = require('../db');

async function fixWorkProgress() {
    try {
        const workId = 133;
        
        // Пересчитываем completed_quantity и progress_percent
        await pool.query(`
            SELECT taiga.update_work_progress($1)
        `, [workId]);
        
        // Проверяем результат
        const checkRes = await pool.query(`
            SELECT pw.id, pw.quantity, pw.completed_quantity, pw.progress_percent, 
                   u.name as unit_name
            FROM taiga.project_works pw
            LEFT JOIN taiga.units u ON pw.unit_id = u.id
            WHERE pw.id = $1
        `, [workId]);
        
        if (checkRes.rows.length > 0) {
            const work = checkRes.rows[0];
            console.log('✅ Прогресс пересчитан:');
            console.log(`   Количество: ${work.quantity} ${work.unit_name}`);
            console.log(`   Выполнено: ${work.completed_quantity} ${work.unit_name}`);
            console.log(`   Прогресс: ${work.progress_percent}%`);
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

fixWorkProgress();




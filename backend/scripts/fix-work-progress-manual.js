// ===========================================
// Исправление прогресса работы вручную
// ===========================================

const pool = require('../db');

async function fixWorkProgress() {
    try {
        const workId = 133;
        
        // Считаем сумму выполненных работ из журнала
        const journalRes = await pool.query(`
            SELECT COALESCE(SUM(pj.quantity_completed), 0) as total_completed
            FROM taiga.project_journal pj
            WHERE pj.work_id = $1
        `, [workId]);
        
        const totalCompleted = parseFloat(journalRes.rows[0].total_completed) || 0;
        
        // Получаем общее количество работы
        const workRes = await pool.query(`
            SELECT quantity FROM taiga.project_works WHERE id = $1
        `, [workId]);
        
        const totalQuantity = parseFloat(workRes.rows[0].quantity) || 0;
        
        // Рассчитываем прогресс
        const progressPercent = totalQuantity > 0 ? (totalCompleted / totalQuantity) * 100 : 0;
        
        console.log(`Выполнено: ${totalCompleted}`);
        console.log(`Всего: ${totalQuantity}`);
        console.log(`Прогресс: ${progressPercent.toFixed(2)}%`);
        
        // Обновляем в БД
        await pool.query(`
            UPDATE taiga.project_works
            SET completed_quantity = $1,
                progress_percent = $2
            WHERE id = $3
        `, [totalCompleted, progressPercent.toFixed(2), workId]);
        
        console.log('\n✅ Прогресс обновлён!');
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

fixWorkProgress();




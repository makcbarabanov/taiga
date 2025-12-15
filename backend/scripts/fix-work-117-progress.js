// Исправление прогресса для работы ID 117 (Установка свай)
const pool = require('../db');

async function fixWork117Progress() {
    const client = await pool.connect();
    
    try {
        // Пересчитываем прогресс на основе текущих данных
        const updateQuery = `
            UPDATE taiga.project_works
            SET 
                progress_percent = CASE
                    WHEN quantity > 0 THEN
                        LEAST(ROUND(completed_quantity / quantity * 100, 2), 100.00)
                    ELSE 0
                END,
                updated_at = NOW()
            WHERE id = 117
            RETURNING id, quantity, completed_quantity, progress_percent;
        `;
        
        const result = await client.query(updateQuery);
        console.log('✅ Прогресс обновлён:');
        console.log(result.rows[0]);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

fixWork117Progress();




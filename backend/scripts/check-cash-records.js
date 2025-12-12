// Проверка записей кассы
const pool = require('../db');

async function checkCash() {
    try {
        const result = await pool.query(`
            SELECT id, date, calculated_amount, actual_amount, difference 
            FROM taiga.cash 
            ORDER BY date DESC 
            LIMIT 5
        `);
        
        console.log('Последние записи кассы:');
        result.rows.forEach(row => {
            const date = row.date instanceof Date 
                ? row.date.toISOString().split('T')[0] 
                : row.date.split('T')[0];
            console.log(`  ${date}: calculated=${row.calculated_amount}, actual=${row.actual_amount}, diff=${row.difference}`);
        });
        
        // Проверяем запись за сегодня
        const today = new Date().toISOString().split('T')[0];
        console.log(`\nСегодня: ${today}`);
        
        const todayRecord = result.rows.find(row => {
            const rowDate = row.date instanceof Date 
                ? row.date.toISOString().split('T')[0] 
                : row.date.split('T')[0];
            return rowDate === today;
        });
        
        if (todayRecord) {
            console.log(`Запись за сегодня найдена: ID ${todayRecord.id}`);
            console.log(`  calculated: ${todayRecord.calculated_amount}`);
            console.log(`  actual: ${todayRecord.actual_amount}`);
            console.log(`  difference: ${todayRecord.difference}`);
            
            if (todayRecord.actual_amount !== null) {
                const diff = Math.abs(parseFloat(todayRecord.actual_amount) - parseFloat(todayRecord.calculated_amount));
                console.log(`  Разница: ${diff}`);
                if (diff <= 0.01) {
                    console.log('  ✅ Должен быть зелёный');
                } else {
                    console.log('  ❌ Должен быть красный');
                }
            } else {
                console.log('  ❌ actual_amount = null, должен быть красный');
            }
        } else {
            console.log('❌ Запись за сегодня не найдена');
        }
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCash();


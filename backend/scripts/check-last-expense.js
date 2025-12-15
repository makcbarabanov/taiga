const pool = require('../db');

(async () => {
    try {
        const result = await pool.query(
            `SELECT id, subcategory, amount, date, shop_id 
             FROM taiga.expenses 
             WHERE date = CURRENT_DATE 
             ORDER BY id DESC 
             LIMIT 1`
        );
        
        if (result.rows.length > 0) {
            console.log('✅ Последний расход сегодня:');
            console.log(result.rows[0]);
        } else {
            console.log('❌ Расходы за сегодня не найдены');
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
})();






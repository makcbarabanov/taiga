// Проверка расхода Семишагофф
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        // Проверяем по сумме
        const result1 = await client.query(
            `SELECT id, date, amount, subcategory, comment, 
                    (SELECT name FROM taiga.shops WHERE id = shop_id) as shop_name
             FROM taiga.expenses 
             WHERE (amount = 1545.83 OR amount = 1546 OR (amount BETWEEN 1545 AND 1546))
             ORDER BY date DESC, id DESC 
             LIMIT 5`
        );
        
        // Проверяем по названию магазина
        const result2 = await client.query(
            `SELECT id, date, amount, subcategory, comment, 
                    (SELECT name FROM taiga.shops WHERE id = shop_id) as shop_name
             FROM taiga.expenses 
             WHERE date >= '2025-12-11' AND date <= '2025-12-14'
               AND (subcategory ILIKE '%сем%' OR comment ILIKE '%сем%' 
                    OR shop_id IN (SELECT id FROM taiga.shops WHERE name ILIKE '%сем%'))
             ORDER BY date DESC`
        );
        
        console.log('📋 Поиск по сумме 1545.83:');
        if (result1.rows.length > 0) {
            result1.rows.forEach(row => {
                console.log(`ID: ${row.id} | ${row.date} | ${row.amount} ₽ | ${row.shop_name || ''}`);
            });
        } else {
            console.log('Не найдено');
        }
        
        console.log('\n📋 Поиск по названию "Семишагофф":');
        if (result2.rows.length > 0) {
            result2.rows.forEach(row => {
                console.log(`ID: ${row.id} | ${row.date} | ${row.amount} ₽ | ${row.shop_name || ''}`);
            });
        } else {
            console.log('Не найдено');
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
})();


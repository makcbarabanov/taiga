// Проверка последних расходов для определения точки остановки
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        // Проверяем расходы за 11-12 декабря, отсортированные по дате и ID
        const result = await client.query(
            `SELECT id, date, amount, subcategory, comment, shop_id, 
                    (SELECT name FROM taiga.shops WHERE id = shop_id) as shop_name,
                    (SELECT name FROM taiga.expense_categories WHERE id = category_id) as category_name
             FROM taiga.expenses 
             WHERE date >= '2025-12-11' AND date <= '2025-12-14'
             ORDER BY date DESC, id DESC 
             LIMIT 20`
        );
        
        console.log('📋 Последние расходы за 11-14 декабря:\n');
        if (result.rows.length > 0) {
            result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id} | ${row.date} | ${row.amount} ₽ | ${row.category_name || 'N/A'} | ${row.subcategory || 'N/A'} | ${row.comment || ''} | ${row.shop_name || ''}`);
            });
        } else {
            console.log('❌ Расходы за этот период не найдены');
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
})();


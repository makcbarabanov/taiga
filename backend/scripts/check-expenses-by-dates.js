// Проверка расходов по датам из новой выписки
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        console.log('📋 Расходы за 12.12.2025:\n');
        const result12 = await client.query(
            `SELECT id, date, amount, subcategory, comment, 
                    (SELECT name FROM taiga.shops WHERE id = shop_id) as shop_name,
                    (SELECT name FROM taiga.expense_categories WHERE id = category_id) as category_name
             FROM taiga.expenses 
             WHERE date = '2025-12-12'
             ORDER BY id`
        );
        result12.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.amount} ₽ | ${row.category_name} | ${row.subcategory || ''} | ${row.shop_name || ''} | ${row.comment || ''}`);
        });
        console.log(`Всего: ${result12.rows.length} записей\n`);

        console.log('📋 Расходы за 13.12.2025:\n');
        const result13 = await client.query(
            `SELECT id, date, amount, subcategory, comment, 
                    (SELECT name FROM taiga.shops WHERE id = shop_id) as shop_name,
                    (SELECT name FROM taiga.expense_categories WHERE id = category_id) as category_name
             FROM taiga.expenses 
             WHERE date = '2025-12-13'
             ORDER BY id`
        );
        result13.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.amount} ₽ | ${row.category_name} | ${row.subcategory || ''} | ${row.shop_name || ''} | ${row.comment || ''}`);
        });
        console.log(`Всего: ${result13.rows.length} записей\n`);

        console.log('📋 Расходы за 14.12.2025:\n');
        const result14 = await client.query(
            `SELECT id, date, amount, subcategory, comment, 
                    (SELECT name FROM taiga.shops WHERE id = shop_id) as shop_name,
                    (SELECT name FROM taiga.expense_categories WHERE id = category_id) as category_name
             FROM taiga.expenses 
             WHERE date = '2025-12-14'
             ORDER BY id`
        );
        result14.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.amount} ₽ | ${row.category_name} | ${row.subcategory || ''} | ${row.shop_name || ''} | ${row.comment || ''}`);
        });
        console.log(`Всего: ${result14.rows.length} записей\n`);

    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
})();


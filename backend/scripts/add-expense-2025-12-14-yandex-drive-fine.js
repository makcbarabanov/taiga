// Добавление расхода: Яндекс Драйв штраф за парковку 14.12.2025
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        const date = '2025-12-14';
        const amount = 8600; // штраф

        // IDs
        const [{ id: projectId }] = (await client.query(`SELECT id FROM taiga.projects WHERE id = 1`)).rows;
        const [{ id: categoryId }] = (await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Накладные'`)).rows;
        const [{ id: unitId }] = (await client.query(`SELECT id FROM taiga.units WHERE short_name = 'шт'`)).rows;
        const [{ id: shopId }] = (await client.query(`SELECT id FROM taiga.shops WHERE name = 'Яндекс Драйв'`)).rows;

        const insertSql = `
            INSERT INTO taiga.expenses (
                project_id, date, month, year, category_id, subcategory,
                unit_id, quantity, price, amount, section, wallet, shop_id, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, NULL, $11, $12)
            RETURNING id;
        `;

        const res = await client.query(insertSql, [
            projectId,
            date,
            12,
            2025,
            categoryId,
            'Транспорт Яндекс Драйв',
            unitId,
            1,
            amount,
            amount,
            shopId,
            'Штраф за неправильную парковку'
        ]);

        console.log(`✅ Добавлен расход ID ${res.rows[0].id}: ${date} - ${amount} ₽ (Накладные - Транспорт Яндекс Драйв)`);
    } catch (err) {
        console.error('❌ Ошибка при добавлении штрафа Яндекс Драйв:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
})();



// Добавление расхода: Билайн 100₽ 12.12.2025
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        const date = '2025-12-12';
        const amount = 100;

        // IDs
        const [{ id: projectId }] = (await client.query(`SELECT id FROM taiga.projects WHERE id = 1`)).rows;
        const [{ id: categoryId }] = (await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Накладные'`)).rows;
        const [{ id: unitId }] = (await client.query(`SELECT id FROM taiga.units WHERE short_name = 'шт'`)).rows;

        // Магазин Билайн: создаём при отсутствии
        const shopRes = await client.query(`SELECT id FROM taiga.shops WHERE name ILIKE $1`, ['%Билайн%']);
        let shopId = shopRes.rows[0]?.id;
        if (!shopId) {
            const insertShop = await client.query(
                `INSERT INTO taiga.shops (name) VALUES ($1) RETURNING id`,
                ['Билайн']
            );
            shopId = insertShop.rows[0].id;
            console.log(`✅ Добавлен магазин Билайн (id=${shopId})`);
        }

        const insertSql = `
            INSERT INTO taiga.expenses (
                project_id, date, month, year, category_id, subcategory,
                unit_id, quantity, price, amount, section, wallet, shop_id, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, NULL, $11, NULL)
            RETURNING id;
        `;

        const res = await client.query(insertSql, [
            projectId,
            date,
            12,
            2025,
            categoryId,
            'Связь',
            unitId,
            1,
            amount,
            amount,
            shopId
        ]);

        console.log(`✅ Добавлен расход ID ${res.rows[0].id}: ${date} - ${amount} ₽ (Накладные - Связь, Билайн)`);
    } catch (err) {
        console.error('❌ Ошибка при добавлении расхода Билайн:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
})();


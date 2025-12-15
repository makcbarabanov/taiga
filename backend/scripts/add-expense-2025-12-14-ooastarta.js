// Добавление расхода Маржа: Oooastarta 14.12.2025
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        const date = '2025-12-14';
        const amount = 1766; // 10156 - 3390 - 5000

        // Находим IDs
        const [{ id: projectId }] = (await client.query(`SELECT id FROM taiga.projects WHERE id = 1`)).rows;
        const [{ id: categoryId }] = (await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Маржа'`)).rows;
        const [{ id: unitId }] = (await client.query(`SELECT id FROM taiga.units WHERE short_name = 'шт'`)).rows;

        // Магазин Oooastarta: создаём при отсутствии
        const shopRes = await client.query(`SELECT id FROM taiga.shops WHERE name = $1`, ['Oooastarta']);
        let shopId = shopRes.rows[0]?.id;
        if (!shopId) {
            const insertShop = await client.query(
                `INSERT INTO taiga.shops (name) VALUES ($1) RETURNING id`,
                ['Oooastarta']
            );
            shopId = insertShop.rows[0].id;
            console.log(`✅ Добавлен магазин Oooastarta (id=${shopId})`);
        }

        // Вставка расхода
        const insertExpense = `
            INSERT INTO taiga.expenses (
                project_id, date, month, year, category_id, subcategory,
                unit_id, quantity, price, amount, section, wallet, shop_id, comment
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, NULL, $11, $12)
            RETURNING id;
        `;

        const result = await client.query(insertExpense, [
            projectId,
            date,
            12,
            2025,
            categoryId,
            'Барабанов М.В.',
            unitId,
            1,
            amount,
            amount,
            shopId,
            'Встреча с Викторией Макаровой (ресторан), скинулись Тарас Г. 3390₽ и Николай А. 5000₽'
        ]);

        console.log(`✅ Добавлен расход ID ${result.rows[0].id}: ${date} - ${amount} ₽ (Маржа, Oooastarta)`);
    } catch (error) {
        console.error('❌ Ошибка при добавлении расхода:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();



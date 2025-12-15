// Добавление расхода: Аренда цеха
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        const date = new Date().toISOString().split('T')[0]; // Сегодняшняя дата
        const amount = 10000;

        // IDs
        const [{ id: projectId }] = (await client.query(`SELECT id FROM taiga.projects WHERE id = 1`)).rows; // Гостевой 5х8
        const [{ id: categoryId }] = (await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Накладные'`)).rows;
        const [{ id: unitId }] = (await client.query(`SELECT id FROM taiga.units WHERE short_name = 'шт'`)).rows;

        const insertSql = `
            INSERT INTO taiga.expenses (
                project_id, date, month, year, category_id, subcategory,
                unit_id, quantity, price, amount, section, wallet, shop_id, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, NULL, NULL, $11)
            RETURNING id;
        `;

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        const res = await client.query(insertSql, [
            projectId,
            date,
            month,
            year,
            categoryId,
            'Аренда цеха',
            unitId,
            1,
            amount,
            amount,
            '⚠️ КЛИЕНТ: Логинова Ксения (не добавлен в БД) | ОБЪЕКТ: Гостевой 5х6 (не добавлен в БД)'
        ]);

        console.log(`✅ Добавлен расход ID ${res.rows[0].id}: ${date} - ${amount} ₽ (Накладные - Аренда цеха)`);
        console.log(`⚠️ ВНИМАНИЕ: Клиент "Логинова Ксения" и объект "Гостевой 5х6" указаны в комментарии, но не добавлены в БД!`);
    } catch (err) {
        console.error('❌ Ошибка при добавлении расхода:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
})();


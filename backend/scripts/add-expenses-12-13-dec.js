// Добавление расходов за 12-13 декабря 2025
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        // Находим IDs
        const [{ id: projectId }] = (await client.query(`SELECT id FROM taiga.projects WHERE id = 1`)).rows;
        const [{ id: categoryId }] = (await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Накладные'`)).rows;
        const [{ id: unitId }] = (await client.query(`SELECT id FROM taiga.units WHERE short_name = 'шт'`)).rows;

        // Функция для получения или создания магазина
        async function getOrCreateShop(name) {
            const shopRes = await client.query(`SELECT id FROM taiga.shops WHERE name ILIKE $1`, [`%${name}%`]);
            if (shopRes.rows[0]) {
                return shopRes.rows[0].id;
            }
            const insertShop = await client.query(
                `INSERT INTO taiga.shops (name) VALUES ($1) RETURNING id`,
                [name]
            );
            console.log(`✅ Добавлен магазин ${name} (id=${insertShop.rows[0].id})`);
            return insertShop.rows[0].id;
        }

        // Расходы для добавления
        const expenses = [
            {
                date: '2025-12-12',
                amount: 350,
                subcategory: 'Связь',
                shopName: 'Билайн',
                comment: null
            },
            {
                date: '2025-12-12',
                amount: 204.06,
                subcategory: 'Транспорт',
                shopName: 'Делимобиль',
                comment: null
            },
            {
                date: '2025-12-12',
                amount: 7720,
                subcategory: 'Ремонт Авто',
                shopName: 'ЕвроАвто',
                comment: 'дворник, защита, диагностика, габариты'
            },
            {
                date: '2025-12-13',
                amount: 377.97,
                subcategory: 'Продукты',
                shopName: 'Магнит',
                comment: null
            }
        ];

        // Добавляем расходы
        for (const expense of expenses) {
            const shopId = await getOrCreateShop(expense.shopName);
            
            const insertQuery = `
                INSERT INTO taiga.expenses (
                    project_id, date, month, year, category_id, subcategory,
                    unit_id, quantity, price, amount, section, wallet, shop_id, comment
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, NULL, $11, $12)
                RETURNING id, date, amount;
            `;
            
            const result = await client.query(insertQuery, [
                projectId,
                expense.date,
                12,
                2025,
                categoryId,
                expense.subcategory,
                unitId,
                1,
                expense.amount,
                expense.amount,
                shopId,
                expense.comment
            ]);
            
            console.log(`✅ Добавлен расход ID ${result.rows[0].id}: ${result.rows[0].date} - ${result.rows[0].amount} ₽ (${expense.subcategory}, ${expense.shopName})`);
        }
        
        console.log('\n✅ Все расходы добавлены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();


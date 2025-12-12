// Добавление записи с Толстовкой (Маржа)
const pool = require('../db');

async function addTolstovka() {
    try {
        console.log('🚀 Добавляю запись с Толстовкой...\n');

        // Получаем категорию Маржа (ID 8)
        // Получаем магазин Озон
        const shop = await pool.query('SELECT id FROM taiga.shops WHERE name = $1', ['Озон']);
        const shopId = shop.rows[0].id;

        // Получаем единицу измерения "шт"
        const unit = await pool.query('SELECT id FROM taiga.units WHERE short_name = $1', ['шт']);
        const unitId = unit.rows[0].id;

        // Добавляем запись
        const result = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, 
              quantity, price, amount, shop_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
            [
                1, // project_id
                '2025-12-10', // date
                12, // month
                2025, // year
                8, // category_id (Маржа)
                'Толстовка', // subcategory (название товара)
                unitId, // unit_id
                1, // quantity
                1039, // price
                1039, // amount
                shopId, // shop_id
                null // comment
            ]
        );

        console.log(`✅ Добавлена запись: Толстовка (1039₽) → Маржа [ID: ${result.rows[0].id}]`);
        console.log('✅ Готово!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

addTolstovka();


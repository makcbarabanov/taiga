// Добавление расхода: 120 руб, накладные, связь
const pool = require('../db');

async function addExpense() {
    try {
        console.log('🚀 Добавляю расход: 120 руб, накладные, связь...\n');

        // Получаем категорию "Накладные" (алиас "Накл", ID 4)
        const category = await pool.query('SELECT id FROM taiga.expense_categories WHERE alias = $1', ['Накл']);
        const categoryId = category.rows[0].id;

        // Получаем единицу измерения "шт"
        const unit = await pool.query('SELECT id FROM taiga.units WHERE short_name = $1', ['шт']);
        const unitId = unit.rows[0].id;

        // Дата: 10.12.2025
        const date = '2025-12-10';
        const month = 12;
        const year = 2025;

        // Добавляем запись
        const result = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, 
              quantity, price, amount, shop_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
            [
                1, // project_id (Гостевой 5х8)
                date,
                month,
                year,
                categoryId, // Накладные
                'связь', // subcategory
                unitId, // unit_id
                1, // quantity
                120, // price
                120, // amount
                null, // shop_id (не указан)
                null // comment
            ]
        );

        console.log(`✅ Добавлен расход: связь (120₽) → Накладные [ID: ${result.rows[0].id}]`);
        console.log('✅ Готово!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

addExpense();


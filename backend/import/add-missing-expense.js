// ===========================================
// Скрипт для добавления недостающего расхода
// ===========================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function addMissingExpense() {
    try {
        console.log('🔍 Проверка текущей суммы...\n');

        // Проверяем текущую сумму
        const checkResult = await pool.query(
            'SELECT SUM(amount) as total FROM taiga.expenses WHERE project_id = 1'
        );

        const currentTotal = parseFloat(checkResult.rows[0].total);
        const expected = 616413;
        const missing = expected - currentTotal;

        console.log(`Текущая сумма: ${currentTotal}`);
        console.log(`Ожидается: ${expected}`);
        console.log(`Не хватает: ${missing}\n`);

        if (Math.abs(missing) < 1) {
            console.log('✅ Сумма уже правильная!');
            await pool.end();
            return;
        }

        // Находим категорию "Накладные" или создаём
        let categoryResult = await pool.query(
            'SELECT id FROM taiga.expense_categories WHERE name = $1',
            ['Накладные']
        );

        if (categoryResult.rows.length === 0) {
            categoryResult = await pool.query(
                'INSERT INTO taiga.expense_categories (name) VALUES ($1) RETURNING id',
                ['Накладные']
            );
        }

        const categoryId = categoryResult.rows[0].id;

        // Добавляем недостающий расход как "Корректировка" или "Прочее"
        const insertResult = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, amount)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                1, // project_id для Феруз
                '2025-12-06', // дата
                12, // месяц
                2025, // год
                categoryId, // категория
                'Корректировка (недостающая сумма)', // подкатегория
                missing // сумма
            ]
        );

        console.log(`✅ Добавлен расход ID: ${insertResult.rows[0].id}`);
        console.log(`   Сумма: ${missing} руб`);
        console.log(`   Подкатегория: Корректировка (недостающая сумма)\n`);

        // Проверяем итоговую сумму
        const finalResult = await pool.query(
            'SELECT SUM(amount) as total FROM taiga.expenses WHERE project_id = 1'
        );

        const finalTotal = parseFloat(finalResult.rows[0].total);
        console.log(`📊 Итоговая сумма: ${finalTotal}`);
        console.log(`📊 Ожидается: ${expected}`);
        console.log(`📊 Разница: ${expected - finalTotal}`);

        if (Math.abs(expected - finalTotal) < 1) {
            console.log('\n✅ Сумма теперь правильная!');
        }

    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await pool.end();
    }
}

addMissingExpense();



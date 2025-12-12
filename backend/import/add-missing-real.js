// ===========================================
// Скрипт для добавления недостающих расходов
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

// Недостающие расходы (те, которых точно нет в БД)
const missingExpenses = [
    { date: '07.12.2025', category: 'Расход', subcategory: 'Диск по дереву для торцовки', qty: 1, price: 1282, amount: 1282 },
    { date: '07.12.2025', category: 'Накладные', subcategory: 'продукты', qty: 1, price: 700, amount: 700 },
    { date: '07.12.2025', category: 'Накладные', subcategory: 'бензин', qty: 1, price: 2136, amount: 2136 },
    { date: '06.12.2025', category: 'Расход', subcategory: 'Сетка сварная от грызунов 15м2 6х6х0,6', qty: 2, price: 2500, amount: 5000 },
];

async function addMissing() {
    try {
        console.log('🔍 Добавление недостающих расходов...\n');

        // Функция для поиска или создания категории
        async function findOrCreateCategory(name) {
            let result = await pool.query(
                'SELECT id FROM taiga.expense_categories WHERE name = $1',
                [name]
            );
            if (result.rows.length === 0) {
                result = await pool.query(
                    'INSERT INTO taiga.expense_categories (name) VALUES ($1) RETURNING id',
                    [name]
                );
            }
            return result.rows[0].id;
        }

        // Функция для поиска единицы измерения
        async function findUnit(name) {
            const result = await pool.query(
                'SELECT id FROM taiga.units WHERE short_name = $1 OR name = $1',
                [name]
            );
            return result.rows.length > 0 ? result.rows[0].id : null;
        }

        let added = 0;
        for (const exp of missingExpenses) {
            // Парсим дату
            const [day, month, year] = exp.date.split('.');
            const dateObj = new Date(`${year}-${month}-${day}`);

            // Находим или создаём категорию
            const categoryId = await findOrCreateCategory(exp.category);

            // Находим единицу измерения
            const unitId = await findUnit('шт');

            // Вставляем расход
            await pool.query(
                `INSERT INTO taiga.expenses 
                 (project_id, date, month, year, category_id, subcategory, unit_id, 
                  quantity, price, amount)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    1, // project_id для Феруз
                    dateObj.toISOString().split('T')[0],
                    parseInt(month),
                    parseInt(year),
                    categoryId,
                    exp.subcategory,
                    unitId,
                    exp.qty,
                    exp.price,
                    exp.amount
                ]
            );

            console.log(`✅ Добавлен: ${exp.date} | ${exp.category} | ${exp.subcategory} | ${exp.amount} руб`);
            added++;
        }

        console.log(`\n📊 Добавлено расходов: ${added}`);

        // Проверяем итоговую сумму
        const checkResult = await pool.query(
            'SELECT SUM(amount) as total, COUNT(*) as count FROM taiga.expenses WHERE project_id = 1'
        );

        const dbTotal = parseFloat(checkResult.rows[0].total);
        const expected = 616413;
        const diff = expected - dbTotal;

        console.log(`\n📊 Итоговая сумма в БД: ${dbTotal}`);
        console.log(`📊 Ожидается: ${expected}`);
        console.log(`📊 Разница: ${diff}`);

        if (Math.abs(diff) < 1) {
            console.log('\n✅ Сумма теперь правильная!');
        } else {
            console.log(`\n⚠️  Остаётся разница ${diff} руб. Нужно проверить другие расходы.`);
        }

    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await pool.end();
    }
}

addMissing();



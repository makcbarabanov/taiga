// ===========================================
// Скрипт для добавления расходов из разбора
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

// Определяем даты (сегодня и вчера)
const today = new Date();
today.setHours(0, 0, 0, 0);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

async function addExpenses() {
    try {
        // Получаем категории
        const categoriesResult = await pool.query('SELECT id, alias, name FROM taiga.expense_categories');
        const categories = {};
        categoriesResult.rows.forEach(cat => {
            categories[cat.alias] = cat.id;
        });

        // Получаем project_id (проект "Стеклянный Феруз" - ID 1)
        const projectResult = await pool.query("SELECT id FROM taiga.projects WHERE id = 1");
        if (projectResult.rows.length === 0) {
            throw new Error('Проект с ID 1 не найден');
        }
        const projectId = 1;

        // Получаем текущий месяц и год
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const prevMonth = yesterday.getMonth() + 1;
        const prevYear = yesterday.getFullYear();

        // Список расходов для добавления
        const expenses = [
            {
                date: formatDate(today),
                month: currentMonth,
                year: currentYear,
                category_alias: 'Накл',
                subcategory: 'связь',
                amount: 200.00,
                comment: 'Т-Мобайл'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Накл',
                subcategory: 'хозтовары',
                amount: 109.00,
                comment: 'Газпромнефть (зажигалка)'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Расх',
                subcategory: 'мешки для мусора 10шт по 15руб',
                amount: 150.00,
                comment: 'ИП Варенов'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Мат',
                subcategory: 'Профлист МП-20/С-20 (5шт х 3200мм, 8шт х 2800мм, 12шт х 2600мм)',
                amount: 42411.71,
                comment: 'ООО "Тамбовская 50"'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Мат',
                subcategory: 'Муфта п/п д=32мм, 1 дюйм папа',
                amount: 425.00,
                comment: 'Товары для дома (объект: Логинова Ксения)'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Накл',
                subcategory: 'бензин',
                amount: 2236.26,
                comment: 'Татнефть (с учётом кэшбэка: -3600 + 1363.74)'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Накл',
                subcategory: 'продукты',
                amount: 499.50,
                comment: 'Пятёрочка (170,26) + Верный (329,24)'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Инстр',
                subcategory: 'домкрат 4т',
                amount: 1730.00,
                comment: 'Магазин Старт'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Расх',
                subcategory: 'шлифкруги для УШМ 125мм уп=5шт, зерно 80мм',
                amount: 110.00,
                comment: 'ООО Стройторговля (Вимос)'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Накл',
                subcategory: 'не учёл',
                amount: 82.85,
                comment: 'ООО Стройторговля (Вимос) - остаток счёта'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Накл',
                subcategory: 'продукты',
                amount: 435.00,
                comment: 'Шав24БМ'
            },
            {
                date: formatDate(yesterday),
                month: prevMonth,
                year: prevYear,
                category_alias: 'Маржа',
                subcategory: 'Барабанов М.В.',
                amount: 2180.00,
                comment: 'абонплата за cursor'
            }
        ];

        console.log(`\n📝 Добавляю ${expenses.length} расходов...\n`);

        let added = 0;
        let errors = 0;

        for (const expense of expenses) {
            try {
                const categoryId = categories[expense.category_alias];
                if (!categoryId) {
                    console.error(`❌ Категория "${expense.category_alias}" не найдена для расхода: ${expense.comment}`);
                    errors++;
                    continue;
                }

                // Проверяем, нужен ли комментарий (для Маржи)
                const categoryInfo = categoriesResult.rows.find(c => c.id === categoryId);
                if (categoryInfo && categoryInfo.alias === 'Маржа' && !expense.comment) {
                    console.error(`❌ Для категории "Маржа" обязателен комментарий: ${expense.comment}`);
                    errors++;
                    continue;
                }

                const result = await pool.query(
                    `INSERT INTO taiga.expenses 
                     (project_id, date, month, year, category_id, subcategory, amount, comment)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id`,
                    [
                        projectId,
                        expense.date,
                        expense.month,
                        expense.year,
                        categoryId,
                        expense.subcategory,
                        expense.amount,
                        expense.comment || null
                    ]
                );

                console.log(`✅ Добавлен расход ID ${result.rows[0].id}: ${expense.category_alias} / ${expense.subcategory} - ${expense.amount} ₽`);
                added++;

            } catch (error) {
                console.error(`❌ Ошибка при добавлении "${expense.comment}":`, error.message);
                errors++;
            }
        }

        console.log(`\n📊 Итого: добавлено ${added}, ошибок ${errors}`);

        // Подсчитываем общую сумму
        const totalResult = await pool.query(
            `SELECT SUM(amount) as total FROM taiga.expenses WHERE project_id = $1 AND date >= $2`,
            [projectId, formatDate(yesterday)]
        );
        console.log(`💰 Общая сумма добавленных расходов: ${totalResult.rows[0].total || 0} ₽\n`);

    } catch (error) {
        console.error('Критическая ошибка:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

addExpenses();


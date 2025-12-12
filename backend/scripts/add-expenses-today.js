// Добавление расходов за 11.12.2025

const pool = require('../db');

async function addExpenses() {
    try {
        console.log('📝 Добавляю расходы за 11.12.2025...\n');

        // Находим проект "Гостевой 5х8"
        const projectResult = await pool.query(
            `SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1`
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        console.log(`✅ Проект найден: ID ${projectId}`);

        // Находим категории
        const categories = {};
        const categoryNames = ['Накладные', 'ТЗР'];
        for (const catName of categoryNames) {
            const catResult = await pool.query(
                `SELECT id FROM taiga.expense_categories WHERE name = $1 OR alias = $1 LIMIT 1`,
                [catName]
            );
            if (catResult.rows.length > 0) {
                categories[catName] = catResult.rows[0].id;
            }
        }
        console.log(`✅ Категории найдены`);

        // Находим единицу измерения "шт"
        const unitResult = await pool.query(
            `SELECT id FROM taiga.units WHERE short_name = 'шт' OR name = 'штука' LIMIT 1`
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица измерения "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        console.log(`✅ Единица измерения найдена: ID ${unitId}`);

        // Находим магазин "Делимобиль"
        const shopResult = await pool.query(
            `SELECT id FROM taiga.shops WHERE name = 'Делимобиль' LIMIT 1`
        );
        
        const delimobilId = shopResult.rows.length > 0 ? shopResult.rows[0].id : null;
        if (delimobilId) {
            console.log(`✅ Магазин "Делимобиль" найден: ID ${delimobilId}`);
        }

        // Дата: 11.12.2025
        const dateStr = '2025-12-11';
        const month = 12;
        const year = 2025;

        // Массив расходов
        const expenses = [
            {
                category: 'Накладные',
                subcategory: 'Метро',
                quantity: 1,
                price: 86,
                amount: 86,
                shop_id: null,
                comment: null
            },
            {
                category: 'ТЗР',
                subcategory: 'доставка с трёх точек (Тосина 12а, Московское шоссе 972 и Покровская дорога д 22)',
                quantity: 1,
                price: 9251,
                amount: 9251,
                shop_id: delimobilId,
                comment: null
            },
            {
                category: 'Накладные',
                subcategory: 'Продукты',
                quantity: 1,
                price: 205,
                amount: 205,
                shop_id: null,
                comment: 'Магнит'
            },
            {
                category: 'Накладные',
                subcategory: 'Продукты',
                quantity: 1,
                price: 512,
                amount: 512,
                shop_id: null,
                comment: 'Дикси'
            },
            {
                category: 'Накладные',
                subcategory: 'Продукты',
                quantity: 1,
                price: 300,
                amount: 300,
                shop_id: null,
                comment: 'Столовая'
            },
            {
                category: 'Накладные',
                subcategory: 'Транспорт Яндекс Драйв',
                quantity: 1,
                price: 1,
                amount: 1,
                shop_id: null,
                comment: null
            }
        ];

        // Добавляем расходы
        let addedCount = 0;
        for (const expense of expenses) {
            const categoryId = categories[expense.category];
            if (!categoryId) {
                console.log(`⚠️ Категория "${expense.category}" не найдена, пропускаю`);
                continue;
            }

            const result = await pool.query(
                `INSERT INTO taiga.expenses 
                 (project_id, date, month, year, category_id, subcategory, unit_id, 
                  quantity, price, amount, shop_id, comment)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING *`,
                [
                    projectId,
                    dateStr,
                    month,
                    year,
                    categoryId,
                    expense.subcategory,
                    unitId,
                    expense.quantity,
                    expense.price,
                    expense.amount,
                    expense.shop_id,
                    expense.comment
                ]
            );
            addedCount++;
            console.log(`✅ Добавлен расход: ${expense.subcategory} - ${expense.amount}₽ (ID: ${result.rows[0].id})`);
        }

        console.log(`\n✅ Всего добавлено расходов: ${addedCount}`);
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        console.log(`💰 Общая сумма: ${totalAmount}₽`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

addExpenses();

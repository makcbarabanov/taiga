// Скрипт для добавления расходов в Админку после классификации
// Использование: node scripts/add-expenses-from-classification.js

const pool = require('../db');

// Данные расходов после классификации
// Используем алиасы категорий: Накл, Расх, Инстр, Маржа, Мат
// name - название товара (сохраняется в subcategory)
// subcategory - подкатегория категории (например, "Барабанов М.В." для Маржи)
const expensesData = [
    { name: 'Толстовка', amount: 1039, category: 'Маржа', shop: 'Озон', comment: null, subcategory: 'Барабанов М.В.' },
    { name: 'Ботинки рабочие (размер 41)', amount: 937, category: 'Накл', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Ботинки рабочие (размер 42)', amount: 937, category: 'Накл', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Светодиодная лента IP22', amount: 227, category: 'Накл', shop: 'Озон', comment: 'для бытовки', subcategory: null },
    { name: 'Светодиодная лента IP65', amount: 326, category: 'Накл', shop: 'Озон', comment: 'для бытовки', subcategory: null },
    { name: 'Круг абразивный P80', amount: 540, category: 'Расх', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Круг абразивный P36', amount: 708, category: 'Расх', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Круг абразивный P120', amount: 708, category: 'Расх', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Мешки для мусора', amount: 710, category: 'Расх', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Лезвия для канцелярских ножей', amount: 61, category: 'Расх', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Саморезы по дереву 3,5×51 мм (1 кг)', amount: 1528, category: 'Мат', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Нож канцелярский', amount: 231, category: 'Расх', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Диск пильный по дереву', amount: 435, category: 'Расх', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Кабель ВВГ-Пнг(А)-LS 2×1.5 мм² (100 м)', amount: 3748, category: 'Мат', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Прожектор светодиодный уличный 100 Вт', amount: 496, category: 'Инстр', shop: 'Озон', comment: null, subcategory: null },
    { name: 'Фонарь налобный аккумуляторный', amount: 319, category: 'Инстр', shop: 'Озон', comment: null, subcategory: null }
];

async function addExpenses() {
    try {
        console.log('🚀 Начинаю добавление расходов в Админку...\n');

        // Получаем категории
        const categories = await pool.query('SELECT id, name, alias FROM taiga.expense_categories');
        const categoryMap = {};
        categories.rows.forEach(cat => {
            categoryMap[cat.alias] = cat.id;
        });

        // Получаем или создаём магазин "Озон"
        let shopResult = await pool.query('SELECT id FROM taiga.shops WHERE name = $1', ['Озон']);
        let shopId = null;
        if (shopResult.rows.length === 0) {
            const newShop = await pool.query('INSERT INTO taiga.shops (name) VALUES ($1) RETURNING id', ['Озон']);
            shopId = newShop.rows[0].id;
            console.log('✅ Создан магазин "Озон" (ID: ' + shopId + ')');
        } else {
            shopId = shopResult.rows[0].id;
            console.log('✅ Найден магазин "Озон" (ID: ' + shopId + ')');
        }

        // Используем проект ID = 1
        const projectCheck = await pool.query('SELECT id, name FROM taiga.projects WHERE id = $1', [1]);
        if (projectCheck.rows.length === 0) {
            throw new Error('Проект с ID = 1 не найден. Создайте проект в Админке.');
        }
        const projectId = 1;
        console.log('✅ Используется проект: ' + projectCheck.rows[0].name + ' (ID: ' + projectId + ')\n');

        // Получаем единицу измерения "шт"
        const units = await pool.query('SELECT id FROM taiga.units WHERE short_name = $1', ['шт']);
        const unitId = units.rows.length > 0 ? units.rows[0].id : null;

        // Дата: 10.12.2025
        const date = '2025-12-10';
        const month = 12;
        const year = 2025;

        let addedCount = 0;
        let errorCount = 0;

        // Добавляем каждый расход
        for (const expense of expensesData) {
            try {
                const categoryId = categoryMap[expense.category];
                if (!categoryId) {
                    console.error(`❌ Категория "${expense.category}" не найдена`);
                    errorCount++;
                    continue;
                }

                // Для Маржи подкатегория категории должна быть "Барабанов М.В."
                // Но название товара (expense.name) сохраняется в subcategory
                let subcategoryValue = expense.name; // Название товара идёт в subcategory
                let categorySubcategory = expense.subcategory; // Подкатегория категории (для Маржи)
                
                if (expense.category === 'Маржа') {
                    // Для Маржи: subcategory = название товара, но если есть categorySubcategory, используем её
                    if (categorySubcategory) {
                        // Если указана подкатегория категории, сохраняем её, а название товара в comment
                        subcategoryValue = categorySubcategory;
                        // Название товара можно сохранить в comment, если нужно
                    }
                }

                const result = await pool.query(
                    `INSERT INTO taiga.expenses 
                     (project_id, date, month, year, category_id, subcategory, unit_id, 
                      quantity, price, amount, shop_id, comment)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                     RETURNING id`,
                    [
                        projectId, date, month, year, categoryId,
                        subcategoryValue, unitId, 1, expense.amount, expense.amount,
                        shopId, expense.comment
                    ]
                );

                console.log(`✅ Добавлен: ${expense.name} (${expense.amount}₽) → ${expense.category} [ID: ${result.rows[0].id}]`);
                addedCount++;
            } catch (error) {
                console.error(`❌ Ошибка при добавлении "${expense.name}":`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📊 Итого: добавлено ${addedCount}, ошибок ${errorCount}`);
        console.log('✅ Готово!');

    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
    } finally {
        await pool.end();
    }
}

// Запуск
addExpenses();


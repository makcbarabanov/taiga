// Добавление расхода: Доборные элементы

const pool = require('../db');

async function addExpense() {
    try {
        console.log('📝 Добавляю расход: Доборные элементы...\n');

        // Находим проект "Гостевой 5х8"
        const projectResult = await pool.query(
            `SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1`
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        console.log(`✅ Проект найден: ID ${projectId}`);

        // Находим категорию "Мат"
        const categoryResult = await pool.query(
            `SELECT id FROM taiga.expense_categories WHERE alias = 'Мат' LIMIT 1`
        );
        
        if (categoryResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена');
        }
        const categoryId = categoryResult.rows[0].id;
        console.log(`✅ Категория найдена: ID ${categoryId}`);

        // Находим единицу измерения "компл" (комплект)
        const unitResult = await pool.query(
            `SELECT id FROM taiga.units WHERE short_name = 'компл' OR name LIKE '%комплект%' LIMIT 1`
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица измерения "компл" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        console.log(`✅ Единица измерения найдена: ID ${unitId}`);

        // Находим магазин "Гнет металл"
        const shopResult = await pool.query(
            `SELECT id FROM taiga.shops WHERE name = 'Гнет металл' LIMIT 1`
        );
        
        if (shopResult.rows.length === 0) {
            throw new Error('Магазин "Гнет металл" не найден');
        }
        const shopId = shopResult.rows[0].id;
        console.log(`✅ Магазин найден: ID ${shopId}`);

        // Дата: 11.12.2025
        const dateStr = '2025-12-11';
        const month = 12;
        const year = 2025;

        // Данные расхода
        const expenseData = {
            project_id: projectId,
            date: dateStr,
            month: month,
            year: year,
            category_id: categoryId,
            subcategory: 'Доборные элементы (конёк 4шт, карнизная 8шт, угол 60х60 4шт, отлив полка 100мм-1шт) L=3200vv',
            unit_id: unitId,
            quantity: 1,
            price: 13500,
            amount: 13500,
            shop_id: shopId,
            comment: null
        };

        // Добавляем расход
        const result = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, 
              quantity, price, amount, shop_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                expenseData.project_id,
                expenseData.date,
                expenseData.month,
                expenseData.year,
                expenseData.category_id,
                expenseData.subcategory,
                expenseData.unit_id,
                expenseData.quantity,
                expenseData.price,
                expenseData.amount,
                expenseData.shop_id,
                expenseData.comment
            ]
        );

        console.log('\n✅ Расход успешно добавлен!');
        console.log('📋 Данные:');
        console.log(`   Категория: Мат`);
        console.log(`   Подкатегория: ${expenseData.subcategory}`);
        console.log(`   Количество: ${expenseData.quantity} комплект`);
        console.log(`   Цена: ${expenseData.price}₽`);
        console.log(`   Сумма: ${expenseData.amount}₽`);
        console.log(`   Магазин: Гнет металл`);
        console.log(`   ID записи: ${result.rows[0].id}`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

addExpense();




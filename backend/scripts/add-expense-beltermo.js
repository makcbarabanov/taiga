// Добавление расхода: БЕЛТЕРМО

const pool = require('../db');

async function addExpense() {
    try {
        console.log('📝 Добавляю расход: БЕЛТЕРМО...\n');

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

        // Находим единицу измерения "м²"
        const unitResult = await pool.query(
            `SELECT id FROM taiga.units WHERE short_name = 'м²' OR name LIKE '%метр%квадр%' LIMIT 1`
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица измерения "м²" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        console.log(`✅ Единица измерения найдена: ID ${unitId}`);

        // Находим магазин "Beltermo"
        const shopResult = await pool.query(
            `SELECT id FROM taiga.shops WHERE name = 'Beltermo' LIMIT 1`
        );
        
        if (shopResult.rows.length === 0) {
            throw new Error('Магазин "Beltermo" не найден');
        }
        const shopId = shopResult.rows[0].id;
        console.log(`✅ Магазин найден: ID ${shopId}`);

        // Сегодняшняя дата
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Данные расхода
        const expenseData = {
            project_id: projectId,
            date: dateStr,
            month: month,
            year: year,
            category_id: categoryId,
            subcategory: 'БЕЛТЕРМО, Топ, 200кг/м³, 2490×590×20мм Шип-паз 30 листов',
            unit_id: unitId,
            quantity: 44.07,
            price: 400,
            amount: 17640,
            shop_id: shopId,
            comment: 'Склад: Шушары, Московское шоссе 97/2'
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
        console.log(`   Количество: ${expenseData.quantity} м²`);
        console.log(`   Цена: ${expenseData.price}₽/м²`);
        console.log(`   Сумма: ${expenseData.amount}₽`);
        console.log(`   Магазин: Beltermo`);
        console.log(`   ID записи: ${result.rows[0].id}`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

addExpense();




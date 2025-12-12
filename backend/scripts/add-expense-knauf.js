// Добавление расходов: Кнауф Инсулейшн ПРОФ 037 (две позиции)

const pool = require('../db');

async function addExpenses() {
    try {
        console.log('📝 Добавляю расходы: Кнауф Инсулейшн ПРОФ 037...\n');

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

        // Находим единицу измерения "м³"
        const unitResult = await pool.query(
            `SELECT id FROM taiga.units WHERE short_name = 'м³' OR name LIKE '%метр%куб%' LIMIT 1`
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица измерения "м³" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        console.log(`✅ Единица измерения найдена: ID ${unitId}`);

        // Находим магазин "ГК МИР ТЕПЛОИЗОЛЯЦИИ"
        const shopResult = await pool.query(
            `SELECT id FROM taiga.shops WHERE name = 'ГК МИР ТЕПЛОИЗОЛЯЦИИ' LIMIT 1`
        );
        
        if (shopResult.rows.length === 0) {
            throw new Error('Магазин "ГК МИР ТЕПЛОИЗОЛЯЦИИ" не найден');
        }
        const shopId = shopResult.rows[0].id;
        console.log(`✅ Магазин найден: ID ${shopId}`);

        // Дата: 11.12.2025
        const dateStr = '2025-12-11';
        const month = 12;
        const year = 2025;

        // Позиция 1: Кнауф 100х610х1300, 22 упаковки
        const expense1 = {
            project_id: projectId,
            date: dateStr,
            month: month,
            year: year,
            category_id: categoryId,
            subcategory: 'Минплита Кнауф 100х610х1300, уп=0,634м3=6,34м2',
            unit_id: unitId,
            quantity: 13.948, // 22 упаковки × 0,634 м³/уп
            price: 2445, // округлено от 2 444,79₽
            amount: 34100,
            shop_id: shopId,
            comment: 'Кнауф Инсулейшн ПРОФ 037, 100х610х1300, 0,634 м3/уп 6,34 м2/уп, 22уп'
        };

        // Позиция 2: Кнауф 50х610х1300, 2 упаковки
        const expense2 = {
            project_id: projectId,
            date: dateStr,
            month: month,
            year: year,
            category_id: categoryId,
            subcategory: 'Минплита Кнауф 50х610х1300, уп=0,952м3=19,04м2',
            unit_id: unitId,
            quantity: 1.904, // 2 упаковки × 0,952 м³/уп
            price: 2416, // округлено от 2 415,97₽
            amount: 4600,
            shop_id: shopId,
            comment: 'Кнауф Инсулейшн ПРОФ 037, 50х610х1300, 0,952 м3/уп 19,04 м2/уп, 2уп'
        };

        // Добавляем первую позицию
        console.log('\n📦 Добавляю позицию 1: Кнауф 100х610х1300...');
        const result1 = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, 
              quantity, price, amount, shop_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                expense1.project_id,
                expense1.date,
                expense1.month,
                expense1.year,
                expense1.category_id,
                expense1.subcategory,
                expense1.unit_id,
                expense1.quantity,
                expense1.price,
                expense1.amount,
                expense1.shop_id,
                expense1.comment
            ]
        );
        console.log(`✅ Позиция 1 добавлена! ID: ${result1.rows[0].id}`);

        // Добавляем вторую позицию
        console.log('\n📦 Добавляю позицию 2: Кнауф 50х610х1300...');
        const result2 = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, 
              quantity, price, amount, shop_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                expense2.project_id,
                expense2.date,
                expense2.month,
                expense2.year,
                expense2.category_id,
                expense2.subcategory,
                expense2.unit_id,
                expense2.quantity,
                expense2.price,
                expense2.amount,
                expense2.shop_id,
                expense2.comment
            ]
        );
        console.log(`✅ Позиция 2 добавлена! ID: ${result2.rows[0].id}`);

        console.log('\n✅ Все расходы успешно добавлены!');
        console.log('\n📋 Итоги:');
        console.log(`   Позиция 1: ${expense1.quantity} м³ × ${expense1.price}₽ = ${expense1.amount}₽`);
        console.log(`   Позиция 2: ${expense2.quantity} м³ × ${expense2.price}₽ = ${expense2.amount}₽`);
        console.log(`   Всего: ${expense1.amount + expense2.amount}₽`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

addExpenses();




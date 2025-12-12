// Скрипт для добавления расхода на сваи винтовые
const pool = require('../db');

async function addSvaiExpense() {
    try {
        // Получаем ID категории "Мат" (материалы)
        const categoryResult = await pool.query(
            `SELECT id FROM taiga.expense_categories WHERE name = 'Мат' OR alias = 'Мат' LIMIT 1`
        );
        
        if (categoryResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена');
        }
        const categoryId = categoryResult.rows[0].id;
        
        // Получаем ID единицы "шт"
        const unitResult = await pool.query(
            `SELECT id FROM taiga.units WHERE short_name = 'шт' LIMIT 1`
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        
        // Используем project_id = 1 (Феруз Гостевой 5х8)
        const projectId = 1;
        
        // Текущая дата
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        
        // Параметры расхода
        const quantity = 15;
        const amount = 70000;
        const price = amount / quantity; // 70000 / 15 = 4666.67
        
        // Добавляем расход
        const result = await pool.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, 
              quantity, price, amount, section, wallet, shop_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING *`,
            [
                projectId,           // project_id
                date,                // date
                parseInt(month),     // month
                year,                // year
                categoryId,          // category_id
                'Сваи винтовые',     // subcategory
                unitId,              // unit_id
                quantity,            // quantity
                price,               // price
                amount,              // amount
                null,                // section
                null,                // wallet
                null,                // shop_id
                null                 // comment
            ]
        );
        
        console.log('✅ Расход успешно добавлен:');
        console.log(`   Название: Сваи винтовые`);
        console.log(`   Количество: ${quantity} шт`);
        console.log(`   Цена: ${price.toFixed(2)} ₽`);
        console.log(`   Стоимость: ${amount} ₽`);
        console.log(`   ID записи: ${result.rows[0].id}`);
        
    } catch (error) {
        console.error('❌ Ошибка при добавлении расхода:', error);
    } finally {
        await pool.end();
    }
}

addSvaiExpense();


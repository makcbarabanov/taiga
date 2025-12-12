// Скрипт для добавления тестового расхода
const pool = require('../db');

async function addTestExpense() {
    try {
        // Получаем ID категории "Накладные"
        const categoryResult = await pool.query(
            `SELECT id FROM taiga.expense_categories WHERE name = 'Накладные' LIMIT 1`
        );
        
        if (categoryResult.rows.length === 0) {
            throw new Error('Категория "Накладные" не найдена');
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
                'проверка связи',    // subcategory
                unitId,              // unit_id
                1,                   // quantity
                1,                   // price
                1,                   // amount
                null,                // section
                null,                // wallet
                null,                // shop_id
                null                 // comment
            ]
        );
        
        console.log('✅ Расход успешно добавлен:');
        console.log(result.rows[0]);
        
    } catch (error) {
        console.error('❌ Ошибка при добавлении расхода:', error);
    } finally {
        await pool.end();
    }
}

addTestExpense();


// Проверка расхода на связь
const pool = require('../db');

async function checkExpense() {
    try {
        // Проверяем расход на связь
        const result = await pool.query(`
            SELECT 
                e.id, 
                e.date, 
                c.alias as category,
                e.subcategory, 
                e.amount,
                s.name as shop
            FROM taiga.expenses e
            JOIN taiga.expense_categories c ON e.category_id = c.id
            LEFT JOIN taiga.shops s ON e.shop_id = s.id
            WHERE e.date = '2025-12-10' AND e.subcategory = 'связь'
        `);

        console.log('Расход на связь:');
        if (result.rows.length > 0) {
            result.rows.forEach(row => {
                console.log(`  ID: ${row.id} | ${row.category} | ${row.subcategory} | ${row.amount}₽ | Магазин: ${row.shop || 'нет'}`);
            });
        } else {
            console.log('  ❌ Расход не найден!');
        }

        // Проверяем все расходы за 10.12.2025
        const allExpenses = await pool.query(`
            SELECT 
                e.id, 
                e.date, 
                c.alias as category,
                e.subcategory, 
                e.amount
            FROM taiga.expenses e
            JOIN taiga.expense_categories c ON e.category_id = c.id
            WHERE e.date = '2025-12-10'
            ORDER BY e.id DESC
        `);

        console.log(`\nВсе расходы за 10.12.2025 (всего: ${allExpenses.rows.length}):`);
        allExpenses.rows.forEach((row, i) => {
            console.log(`${i+1}. ID: ${row.id} | ${row.category} | ${row.subcategory || 'пусто'} | ${row.amount}₽`);
        });

        // Проверяем кассу за сегодня
        const today = '2025-12-10';
        const cash = await pool.query(`
            SELECT id, date, calculated_amount, actual_amount, difference
            FROM taiga.cash
            WHERE date = $1
        `, [today]);

        console.log(`\nКасса за ${today}:`);
        if (cash.rows.length > 0) {
            cash.rows.forEach(row => {
                console.log(`  Calculated: ${row.calculated_amount}₽ | Actual: ${row.actual_amount}₽ | Difference: ${row.difference}₽`);
            });
        } else {
            console.log('  ❌ Запись кассы не найдена!');
        }

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkExpense();


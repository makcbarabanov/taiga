// Проверка добавленных расходов
const pool = require('../db');

async function checkExpenses() {
    try {
        // Проверяем все записи за 10.12.2025
        const result = await pool.query(`
            SELECT 
                e.id, 
                e.date, 
                c.alias as category,
                e.subcategory, 
                e.comment, 
                e.amount,
                s.name as shop
            FROM taiga.expenses e
            JOIN taiga.expense_categories c ON e.category_id = c.id
            LEFT JOIN taiga.shops s ON e.shop_id = s.id
            WHERE e.date = '2025-12-10'
            ORDER BY e.id
        `);

        console.log(`Проверка расходов за 10.12.2025 (всего: ${result.rows.length}):\n`);
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id} | ${row.category} | Подкат: ${row.subcategory || 'пусто'} | Коммент: ${row.comment || 'пусто'} | ${row.amount}₽ | Магазин: ${row.shop || 'нет'}`);
        });

        // Проверяем, есть ли дубликаты по сумме
        console.log('\n--- Проверка дубликатов ---');
        const duplicates = await pool.query(`
            SELECT amount, COUNT(*) as count
            FROM taiga.expenses
            WHERE date = '2025-12-10'
            GROUP BY amount
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `);
        
        if (duplicates.rows.length > 0) {
            console.log('Найдены дубликаты по сумме:');
            duplicates.rows.forEach(row => {
                console.log(`  ${row.amount}₽ - ${row.count} раз(а)`);
            });
        } else {
            console.log('Дубликатов не найдено');
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkExpenses();

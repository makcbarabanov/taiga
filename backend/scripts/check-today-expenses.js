// Проверка расходов за сегодня

const pool = require('../db');

async function checkExpenses() {
    try {
        const dateStr = '2025-12-11';
        
        const result = await pool.query(`
            SELECT 
                e.id,
                ec.name as category,
                e.subcategory,
                e.amount,
                p.name as project
            FROM taiga.expenses e
            JOIN taiga.expense_categories ec ON e.category_id = ec.id
            JOIN taiga.projects p ON e.project_id = p.id
            WHERE e.date = $1
            ORDER BY e.id
        `, [dateStr]);
        
        console.log(`📊 Расходы за ${dateStr}:\n`);
        
        let total = 0;
        result.rows.forEach((expense, index) => {
            console.log(`${index + 1}. ${expense.category} - ${expense.subcategory}: ${expense.amount}₽`);
            total += parseFloat(expense.amount);
        });
        
        console.log(`\n💰 Итого: ${total.toLocaleString('ru-RU')}₽`);
        
        pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        pool.end();
    }
}

checkExpenses();




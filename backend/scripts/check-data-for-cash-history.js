const pool = require('../db');

async function checkData() {
    try {
        // Проверяем доходы с 30.11.2025
        console.log('=== Доходы с 30.11.2025 ===');
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total, COUNT(*) as count
            FROM taiga.income 
            WHERE date >= '2025-11-30' 
            GROUP BY date 
            ORDER BY date
        `);
        console.log(JSON.stringify(incomeRes.rows, null, 2));
        
        // Проверяем расходы с 30.11.2025
        console.log('\n=== Расходы с 30.11.2025 ===');
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total, COUNT(*) as count
            FROM taiga.expenses 
            WHERE date >= '2025-11-30' 
            GROUP BY date 
            ORDER BY date
        `);
        console.log(JSON.stringify(expensesRes.rows, null, 2));
        
        // Проверяем текущие записи кассы
        console.log('\n=== Текущие записи кассы ===');
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, actual_amount, difference, daily_expenses
            FROM taiga.cash 
            ORDER BY date DESC
        `);
        console.log(JSON.stringify(cashRes.rows, null, 2));
        
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        process.exit(1);
    }
}

checkData();




const pool = require('../db');

async function checkToday() {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`Проверяю записи начиная с ${today}...\n`);
        
        const res = await pool.query(`
            SELECT date, calculated_amount, actual_amount, difference, daily_expenses 
            FROM taiga.cash 
            WHERE date >= $1 
            ORDER BY date DESC
        `, [today]);
        
        console.log('Записи:');
        console.log(JSON.stringify(res.rows, null, 2));
        
        // Если записи на сегодня нет, создаём её
        if (res.rows.length === 0 || res.rows[0].date.toISOString().split('T')[0] !== today) {
            console.log('\nСоздаю запись на сегодня...');
            await pool.query('SELECT taiga.update_today_cash_record()');
            console.log('✓ Запись создана');
        }
        
        await pool.end();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkToday();




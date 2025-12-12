require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function fixDates() {
    try {
        // Проверяем текущие даты
        const check = await pool.query(
            `SELECT id, date, subcategory, amount 
             FROM taiga.expenses 
             WHERE id BETWEEN 68 AND 79 
             ORDER BY id`
        );
        
        console.log('Текущие даты:');
        check.rows.forEach(e => {
            console.log(`  ID: ${e.id}, дата: ${e.date}, сумма: ${e.amount} ₽`);
        });
        
        // Обновляем на 08.12.2025 (явно указываем дату)
        const result = await pool.query(
            `UPDATE taiga.expenses 
             SET date = DATE '2025-12-08', month = 12, year = 2025 
             WHERE id BETWEEN 68 AND 79`
        );
        
        console.log(`\n✅ Обновлено расходов: ${result.rowCount}`);
        
        // Проверяем после обновления
        const after = await pool.query(
            `SELECT id, date, subcategory, amount 
             FROM taiga.expenses 
             WHERE id BETWEEN 68 AND 79 
             ORDER BY id`
        );
        
        console.log('\nДаты после обновления:');
        after.rows.forEach(e => {
            const dateStr = e.date.toISOString().split('T')[0];
            const day = e.date.getDate();
            const month = e.date.getMonth() + 1;
            const year = e.date.getFullYear();
            console.log(`  ID: ${e.id}, дата: ${dateStr} (${day}.${month}.${year})`);
        });
        
        // Проверяем через SQL напрямую
        const sqlCheck = await pool.query(
            `SELECT id, date::text, EXTRACT(DAY FROM date) as day, EXTRACT(MONTH FROM date) as month
             FROM taiga.expenses 
             WHERE id BETWEEN 68 AND 79 
             ORDER BY id 
             LIMIT 5`
        );
        console.log('\nПроверка через SQL (первые 5):');
        sqlCheck.rows.forEach(e => {
            console.log(`  ID: ${e.id}, дата SQL: ${e.date}, день: ${e.day}, месяц: ${e.month}`);
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

fixDates();


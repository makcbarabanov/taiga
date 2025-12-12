require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function updateDates() {
    try {
        const result = await pool.query(
            `UPDATE taiga.expenses 
             SET date = '2025-12-08', month = 12, year = 2025 
             WHERE id BETWEEN 68 AND 79`
        );
        
        console.log(`✅ Обновлено расходов: ${result.rowCount}`);
        
        const expenses = await pool.query(
            `SELECT id, date, subcategory, amount 
             FROM taiga.expenses 
             WHERE id BETWEEN 68 AND 79 
             ORDER BY id`
        );
        
        console.log('\nОбновлённые расходы:');
        expenses.rows.forEach(e => {
            console.log(`  ID: ${e.id}, дата: ${e.date}, ${e.subcategory}: ${e.amount} ₽`);
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

updateDates();


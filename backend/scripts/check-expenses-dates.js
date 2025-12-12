require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function checkDates() {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                date::text as date_text,
                EXTRACT(DAY FROM date) as day,
                EXTRACT(MONTH FROM date) as month,
                EXTRACT(YEAR FROM date) as year,
                subcategory,
                amount
            FROM taiga.expenses 
            WHERE id BETWEEN 68 AND 79 
            ORDER BY id
        `);
        
        console.log('Даты расходов ID 68-79 в БД:\n');
        result.rows.forEach(e => {
            console.log(`ID ${e.id}: дата = ${e.date_text} (${e.day}.${e.month}.${e.year}) | ${e.subcategory} | ${e.amount} ₽`);
        });
        
        // Проверяем все расходы за 07.12 и 08.12
        const checkBothDates = await pool.query(`
            SELECT 
                date::text,
                COUNT(*) as count
            FROM taiga.expenses 
            WHERE date IN ('2025-12-07', '2025-12-08')
            GROUP BY date
            ORDER BY date
        `);
        
        console.log('\nКоличество расходов по датам:');
        checkBothDates.rows.forEach(r => {
            console.log(`  ${r.date_text}: ${r.count} расходов`);
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkDates();


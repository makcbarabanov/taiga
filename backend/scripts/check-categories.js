require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function check() {
    try {
        const result = await pool.query('SELECT id, name, alias FROM taiga.expense_categories ORDER BY id');
        console.log('Все категории:');
        result.rows.forEach(c => {
            console.log(`  ID: ${c.id}, name: '${c.name}', alias: '${c.alias || 'NULL'}'`);
        });
        
        const marzha = await pool.query("SELECT id, name, alias FROM taiga.expense_categories WHERE alias = 'Маржа' OR name = 'Маржа' OR name = 'Прибыль'");
        console.log('\nКатегории Маржа/Прибыль:');
        marzha.rows.forEach(c => {
            console.log(`  ID: ${c.id}, name: '${c.name}', alias: '${c.alias || 'NULL'}'`);
        });
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

check();


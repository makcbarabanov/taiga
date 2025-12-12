require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function createCashFunctions() {
    try {
        const sqlPath = path.join(__dirname, '../../БД/23_create_cash_calculation_function.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Выполняю создание функций и триггеров для кассы...\n');
        await pool.query(sql);
        
        console.log('✅ Функции и триггеры для кассы созданы\n');
        
        // Проверяем текущую кассу
        const cashResult = await pool.query('SELECT taiga.calculate_current_cash() as cash');
        const cashAmount = cashResult.rows[0].cash || 0;
        console.log(`Текущая касса: ${cashAmount.toLocaleString('ru-RU')} ₽`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

createCashFunctions();


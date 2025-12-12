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

async function addFields() {
    try {
        const sqlPath = path.join(__dirname, '../../БД/21_add_employee_position_and_employment_type.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Выполняю SQL скрипт...\n');
        await pool.query(sql);
        
        console.log('✅ Поля добавлены успешно\n');
        
        // Проверяем структуру таблицы
        const columns = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'taiga' 
            AND table_name = 'employees' 
            ORDER BY ordinal_position
        `);
        
        console.log('Колонки таблицы employees:');
        columns.rows.forEach(c => {
            const defaultValue = c.column_default ? ` (по умолчанию: ${c.column_default})` : '';
            console.log(`  - ${c.column_name} (${c.data_type})${defaultValue}`);
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

addFields();


// ===========================================
// Подключение к PostgreSQL
// ===========================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

// Устанавливаем схему по умолчанию
pool.on('connect', async (client) => {
    await client.query(`SET search_path TO ${process.env.DB_SCHEMA || 'taiga'}, public`);
});

// Тест подключения
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Ошибка подключения к БД:', err);
    } else {
        console.log('✅ Подключение к БД успешно');
    }
});

module.exports = pool;


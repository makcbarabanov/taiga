// Тест подключения к БД
require('dotenv').config();
const { Pool } = require('pg');

console.log('Проверка переменных окружения:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'НЕ УСТАНОВЛЕН');
console.log('DB_SCHEMA:', process.env.DB_SCHEMA);
console.log('');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

console.log('Попытка подключения...');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Ошибка подключения:', err.message);
        console.error('Код ошибки:', err.code);
        process.exit(1);
    } else {
        console.log('✅ Подключение успешно!');
        console.log('Время сервера:', res.rows[0].now);
        pool.end();
        process.exit(0);
    }
});



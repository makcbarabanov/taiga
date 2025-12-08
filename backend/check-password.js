// Проверка пароля
require('dotenv').config();

const password = process.env.DB_PASSWORD || '2nix8#mN&Er5tR';

console.log('Длина пароля:', password.length);
console.log('Пароль начинается с:', password.substring(0, 5));
console.log('Пароль заканчивается на:', password.substring(password.length - 5));
console.log('Содержит #:', password.includes('#'));
console.log('Содержит &:', password.includes('&'));
console.log('Коды символов:', Array.from(password).map(c => c.charCodeAt(0)).join(', '));

// Попробуем разные варианты
console.log('\n--- Тест подключения с разными вариантами ---\n');

const { Pool } = require('pg');

const variants = [
    { name: 'Из .env', password: process.env.DB_PASSWORD },
    { name: 'Хардкод', password: '2nix8#mN&Er5tR' },
    { name: 'С кавычками', password: '"2nix8#mN&Er5tR"' }
];

async function testPassword(variant) {
    const pool = new Pool({
        host: '83.217.220.97',
        port: 5432,
        database: 'default_db',
        user: 'marabot',
        password: variant.password
    });
    
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`✅ ${variant.name}: УСПЕХ`);
        await pool.end();
        return true;
    } catch (err) {
        console.log(`❌ ${variant.name}: ${err.message}`);
        await pool.end();
        return false;
    }
}

(async () => {
    for (const variant of variants) {
        await testPassword(variant);
    }
})();



// ===========================================
// Выполнение миграции 32: Убираем обязательность last_name
// ===========================================

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Начинаю выполнение миграции 32...');
        
        // Читаем SQL файл
        const sqlPath = path.join(__dirname, '../../БД/32_make_last_name_optional.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Выполняем миграцию
        await client.query(sql);
        
        console.log('✅ Миграция 32 успешно выполнена!');
        console.log('   Поле last_name теперь необязательное');
        
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();


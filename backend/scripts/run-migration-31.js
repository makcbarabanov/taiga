// ===========================================
// Выполнение миграции 31: Добавление новых статусов сотрудников
// ===========================================

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Начинаю выполнение миграции 31...');
        
        // Читаем SQL файл
        const sqlPath = path.join(__dirname, '../../БД/31_add_employee_statuses.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Выполняем миграцию
        await client.query(sql);
        
        console.log('✅ Миграция 31 успешно выполнена!');
        console.log('   Добавлены новые статусы: Кандидат, Запас, Консультант, Подрядчик, Временный');
        
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


// Запуск миграции 34: создание таблицы learning_sessions
const fs = require('fs');
const path = require('path');
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        const migrationPath = path.join(__dirname, '../../БД/34_create_learning_sessions_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('✅ Подключение к БД успешно');
        console.log('📝 Выполнение миграции 34: создание таблицы learning_sessions...');
        
        await client.query(sql);
        
        console.log('✅ Миграция 34 выполнена успешно!');
        console.log('📊 Таблица taiga.learning_sessions создана');
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();


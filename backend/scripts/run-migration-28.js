// ===========================================
// Выполнение миграции 28: создание таблицы rules
// ===========================================

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '../../БД/28_create_rules_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await pool.query(sql);
        console.log('✅ Миграция 28 выполнена успешно');
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка выполнения миграции:', error.message);
        await pool.end();
        process.exit(1);
    }
}

runMigration();




// ===========================================
// Выполнение миграции 27_update_journal_structure.sql
// ===========================================

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('📝 Читаю файл миграции...');
        const sqlPath = path.join(__dirname, '..', '..', 'БД', '27_update_journal_structure.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('🚀 Выполняю миграцию...');
        await client.query(sql);
        
        console.log('✅ Миграция выполнена успешно!');
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();


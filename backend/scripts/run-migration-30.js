// Выполнение миграции 30_fix_work_progress_max_100.sql
const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
    const client = await pool.connect();
    
    try {
        const sqlPath = path.join(__dirname, '../../БД/30_fix_work_progress_max_100.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Выполняю миграцию 30_fix_work_progress_max_100.sql...');
        await client.query(sql);
        console.log('✅ Миграция выполнена успешно');
        
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграции:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();




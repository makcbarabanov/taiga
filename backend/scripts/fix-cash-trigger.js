const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function fixTrigger() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, '../../БД/25_fix_cash_trigger_ambiguous.sql'),
            'utf8'
        );
        
        await pool.query(sql);
        console.log('✅ Триггер кассы исправлен');
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

fixTrigger();




// Исправление записи с Толстовкой (Маржа)
const pool = require('../db');

async function fixTolstovka() {
    try {
        await pool.query(`
            UPDATE taiga.expenses 
            SET subcategory = 'Барабанов М.В.', comment = 'Толстовка' 
            WHERE id = 99
        `);
        console.log('✅ Исправлено: Толстовка → subcategory = "Барабанов М.В.", comment = "Толстовка"');
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

fixTolstovka();


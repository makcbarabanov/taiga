// ===========================================
// Исправление отчества Макса
// ===========================================

const pool = require('../db');

async function fixMaxMiddleName() {
    try {
        const result = await pool.query(`
            UPDATE taiga.employees 
            SET middle_name = 'Викторович' 
            WHERE last_name = 'Барабанов' AND first_name = 'Максим'
            RETURNING id, last_name, first_name, middle_name
        `);
        
        if (result.rows.length > 0) {
            console.log('✅ Отчество исправлено:');
            result.rows.forEach(row => {
                const name = [row.last_name, row.first_name, row.middle_name].filter(x => x).join(' ');
                console.log(`   ID: ${row.id}, Имя: ${name}`);
            });
        } else {
            console.log('⚠️  Сотрудник не найден');
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

fixMaxMiddleName();


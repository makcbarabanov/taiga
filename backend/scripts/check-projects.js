const pool = require('../db');

async function checkProjects() {
    try {
        const result = await pool.query('SELECT id, name FROM taiga.projects ORDER BY id');
        console.log('📋 Проекты в БД:');
        result.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Название: ${row.name}`);
        });
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
    }
}

checkProjects();




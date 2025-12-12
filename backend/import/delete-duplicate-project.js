// Удаление дубликата проекта
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

pool.on('connect', async (client) => {
    await client.query(`SET search_path TO taiga, public`);
});

async function deleteDuplicate() {
    try {
        console.log('Удаление дубликата проекта ID: 2...');
        
        // Перемещаем работы из проекта 2 в проект 1
        const updateResult = await pool.query(
            'UPDATE taiga.project_works SET project_id = 1 WHERE project_id = 2'
        );
        console.log(`Перемещено работ: ${updateResult.rowCount}`);
        
        // Удаляем проект 2
        const deleteResult = await pool.query('DELETE FROM taiga.projects WHERE id = 2');
        console.log('Проект ID: 2 удалён');
        
        // Проверяем результат
        const projects = await pool.query('SELECT id, name FROM taiga.projects ORDER BY id');
        console.log('\nОставшиеся проекты:');
        projects.rows.forEach(p => {
            console.log(`  ID: ${p.id}, Название: ${p.name}`);
        });
        
        const works = await pool.query('SELECT COUNT(*) as count FROM taiga.project_works WHERE project_id = 1');
        console.log(`\nРабот в проекте ID: 1: ${works.rows[0].count}`);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

deleteDuplicate();


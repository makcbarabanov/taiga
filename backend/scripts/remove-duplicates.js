require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function removeDuplicates() {
    try {
        const sqlPath = path.join(__dirname, '../../БД/22_remove_duplicate_project_and_client.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Выполняю удаление дубликатов...\n');
        await pool.query(sql);
        
        console.log('✅ Дубликаты удалены\n');
        
        // Проверяем результат
        const clients = await pool.query('SELECT id, name FROM taiga.clients ORDER BY id');
        console.log('Клиенты:');
        clients.rows.forEach(c => {
            console.log(`  ID: ${c.id}, название: "${c.name}"`);
        });

        const projects = await pool.query(`
            SELECT p.id, p.name, c.name as client_name
            FROM taiga.projects p
            LEFT JOIN taiga.clients c ON p.client_id = c.id
            ORDER BY p.id
        `);
        console.log('\nПроекты:');
        projects.rows.forEach(p => {
            console.log(`  ID: ${p.id}, название: "${p.name}", клиент: "${p.client_name}"`);
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

removeDuplicates();


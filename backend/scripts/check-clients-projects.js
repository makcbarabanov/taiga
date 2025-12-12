require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function check() {
    try {
        // Проверяем клиентов
        const clients = await pool.query('SELECT id, name FROM taiga.clients ORDER BY id');
        console.log('Клиенты:');
        clients.rows.forEach(c => {
            console.log(`  ID: ${c.id}, название: "${c.name}"`);
        });

        // Проверяем проекты
        const projects = await pool.query(`
            SELECT p.id, p.name, p.status, c.name as client_name, c.id as client_id
            FROM taiga.projects p
            LEFT JOIN taiga.clients c ON p.client_id = c.id
            ORDER BY p.id
        `);
        console.log('\nПроекты:');
        projects.rows.forEach(p => {
            console.log(`  ID: ${p.id}, название: "${p.name}", статус: "${p.status}", клиент: "${p.client_name}" (ID: ${p.client_id})`);
        });

        // Проверяем, какие расходы связаны с какими проектами
        const expensesByProject = await pool.query(`
            SELECT project_id, COUNT(*) as count, SUM(amount) as total
            FROM taiga.expenses
            GROUP BY project_id
            ORDER BY project_id
        `);
        console.log('\nРасходы по проектам:');
        expensesByProject.rows.forEach(e => {
            console.log(`  Проект ID ${e.project_id}: ${e.count} расходов, сумма: ${e.total || 0} ₽`);
        });

    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

check();


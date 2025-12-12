// Проверка импортированных работ
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

async function check() {
    try {
        console.log('Проверка проектов:');
        const projects = await pool.query('SELECT id, name, client_id FROM taiga.projects ORDER BY id');
        projects.rows.forEach(p => {
            console.log(`  ID: ${p.id}, Название: ${p.name}, client_id: ${p.client_id}`);
        });
        
        console.log('\nПроверка работ (первые 5):');
        const works = await pool.query(`
            SELECT pw.id, pw.project_id, pw.section_id, pw.work_type_id, pw.work_name,
                   ws.name as stage_name, wsec.name as section_name, wt.name as work_type_name
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = 2
            LIMIT 5
        `);
        works.rows.forEach(w => {
            console.log(`  ID: ${w.id}, section_id: ${w.section_id}, work_type_id: ${w.work_type_id}`);
            console.log(`    section_name: ${w.section_name}, work_type_name: ${w.work_type_name}`);
            console.log(`    work_name (old): ${w.work_name}`);
        });
        
        console.log('\nПроверка представления (первые 5):');
        const view = await pool.query('SELECT * FROM taiga.v_project_works_full WHERE project_id = 2 LIMIT 5');
        view.rows.forEach(v => {
            console.log(`  ID: ${v.id}, work_name: ${v.work_name || 'NULL'}`);
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

check();


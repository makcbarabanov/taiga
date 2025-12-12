// Проверка представления
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

async function test() {
    try {
        const result = await pool.query(`
            SELECT 
                pw.id,
                pw.section_id,
                pw.work_type_id,
                ws.name as stage_name,
                wsec.name as section_name,
                wsec.alias as section_alias,
                wt.name as work_type_name,
                wsec.name || ' - ' || wt.name AS work_name_manual,
                v.work_name as work_name_from_view
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            LEFT JOIN taiga.v_project_works_full v ON pw.id = v.id
            WHERE pw.project_id = 1
            LIMIT 5
        `);
        
        console.log('Результаты:');
        result.rows.forEach(r => {
            console.log(`ID: ${r.id}`);
            console.log(`  section_name: ${r.section_name || 'NULL'}`);
            console.log(`  work_type_name: ${r.work_type_name || 'NULL'}`);
            console.log(`  work_name_manual: ${r.work_name_manual || 'NULL'}`);
            console.log(`  work_name_from_view: ${r.work_name_from_view || 'NULL'}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

test();


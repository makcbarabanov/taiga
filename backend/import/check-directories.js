// Проверка справочников
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
        console.log('Проверка справочников:\n');
        
        // 1. Проверка work_stages (этапы)
        console.log('1. СПРАВОЧНИК ЭТАПОВ (work_stages):');
        const stagesCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'taiga' 
                AND table_name = 'work_stages'
            )
        `);
        console.log('   Таблица существует:', stagesCheck.rows[0].exists);
        
        if (stagesCheck.rows[0].exists) {
            const stages = await pool.query('SELECT * FROM taiga.work_stages ORDER BY sort_order');
            console.log('   Записей:', stages.rows.length);
            stages.rows.forEach(s => {
                console.log(`     ID: ${s.id}, Название: "${s.name}"`);
            });
        }
        
        // 2. Проверка work_sections (разделы)
        console.log('\n2. СПРАВОЧНИК РАЗДЕЛОВ (work_sections):');
        const sectionsCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'taiga' 
                AND table_name = 'work_sections'
            )
        `);
        console.log('   Таблица существует:', sectionsCheck.rows[0].exists);
        
        if (sectionsCheck.rows[0].exists) {
            const sections = await pool.query('SELECT * FROM taiga.work_sections ORDER BY sort_order');
            console.log('   Записей:', sections.rows.length);
            sections.rows.forEach(s => {
                console.log(`     ID: ${s.id}, Название: "${s.name}", Алиас: "${s.alias}"`);
            });
        }
        
        // 3. Проверка work_types (виды работ)
        console.log('\n3. СПРАВОЧНИК ВИДОВ РАБОТ (work_types):');
        const typesCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'taiga' 
                AND table_name = 'work_types'
            )
        `);
        console.log('   Таблица существует:', typesCheck.rows[0].exists);
        
        if (typesCheck.rows[0].exists) {
            const types = await pool.query('SELECT COUNT(*) as count FROM taiga.work_types');
            console.log('   Записей:', types.rows[0].count);
            const sampleTypes = await pool.query('SELECT * FROM taiga.work_types ORDER BY id LIMIT 10');
            console.log('   Примеры (первые 10):');
            sampleTypes.rows.forEach(t => {
                console.log(`     ID: ${t.id}, Название: "${t.name}"`);
            });
        }
        
        // 4. Проверка project_works
        console.log('\n4. ПРОВЕРКА project_works:');
        const worksCheck = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT stage_id) as unique_stages,
                COUNT(DISTINCT section_id) as unique_sections,
                COUNT(DISTINCT work_type_id) as unique_work_types
            FROM taiga.project_works
            WHERE project_id = 1
        `);
        console.log('   Всего работ:', worksCheck.rows[0].total);
        console.log('   Уникальных этапов:', worksCheck.rows[0].unique_stages);
        console.log('   Уникальных разделов:', worksCheck.rows[0].unique_sections);
        console.log('   Уникальных видов работ:', worksCheck.rows[0].unique_work_types);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

check();


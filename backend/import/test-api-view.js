// Тест: что возвращает запрос к представлению
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function test() {
    try {
        // Устанавливаем схему
        await pool.query('SET search_path TO taiga, public');
        
        // Проверяем, существует ли представление
        const viewCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM pg_views 
                WHERE schemaname = 'taiga' 
                AND viewname = 'v_project_works_full'
            )
        `);
        console.log('Представление существует:', viewCheck.rows[0].exists);
        
        // Проверяем структуру представления
        const columns = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'taiga' 
            AND table_name = 'v_project_works_full'
            ORDER BY ordinal_position
        `);
        console.log('\nКолонки в представлении:');
        columns.rows.forEach(c => console.log('  -', c.column_name));
        
        // Делаем запрос как в роуте
        const result = await pool.query(`
            SELECT * FROM taiga.v_project_works_full 
            WHERE project_id = 1 
            ORDER BY sort_order, id 
            LIMIT 3
        `);
        
        console.log('\nРезультаты запроса (первые 3):');
        result.rows.forEach((row, i) => {
            console.log(`\nРабота ${i + 1}:`);
            console.log('  id:', row.id);
            console.log('  work_name:', row.work_name);
            console.log('  section_name:', row.section_name);
            console.log('  work_type_name:', row.work_type_name);
            console.log('  section_alias:', row.section_alias);
            console.log('  unit_short_name:', row.unit_short_name);
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

test();


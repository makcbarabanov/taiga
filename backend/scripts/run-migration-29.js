const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'taiga',
    password: 'postgres',
    port: 5432,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        const sqlPath = path.join(__dirname, '../../БД/29_create_materials_directory.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        console.log('✅ Миграция 29 выполнена успешно');
        
        // Проверяем результат
        const result = await client.query('SELECT name, material_type, primary_unit_complex, secondary_unit_complex FROM taiga.materials_directory WHERE name = $1', ['Пиломатериал']);
        if (result.rows.length > 0) {
            console.log('✅ Пиломатериал добавлен в справочник:');
            console.log(JSON.stringify(result.rows[0], null, 2));
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка миграции:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error);




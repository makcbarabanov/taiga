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

async function runMigrations() {
    const client = await pool.connect();
    try {
        console.log('✅ Подключение к БД установлено\n');
        
        // Миграция 29 - создание таблицы и первые материалы
        console.log('📦 Выполняю миграцию 29 (создание таблицы и первые материалы)...');
        const sql29 = fs.readFileSync(path.join(__dirname, '../../БД/29_create_materials_directory.sql'), 'utf8');
        await client.query('BEGIN');
        await client.query(sql29);
        await client.query('COMMIT');
        console.log('✅ Миграция 29 выполнена\n');
        
        // Миграция 29_add - добавление всех остальных материалов
        console.log('📦 Выполняю миграцию 29_add (добавление всех материалов)...');
        const sql29Add = fs.readFileSync(path.join(__dirname, '../../БД/29_add_all_materials.sql'), 'utf8');
        await client.query('BEGIN');
        await client.query(sql29Add);
        await client.query('COMMIT');
        console.log('✅ Миграция 29_add выполнена\n');
        
        // Проверяем результат
        console.log('📊 Проверяю результат...');
        const result = await client.query('SELECT name, material_type, primary_unit, primary_unit_complex, secondary_unit_complex FROM taiga.materials_directory ORDER BY name');
        console.log(`\n✅ Всего материалов в справочнике: ${result.rows.length}\n`);
        console.log('Список материалов:');
        result.rows.forEach((row, index) => {
            const unit = row.material_type === 'complex' 
                ? `${row.primary_unit_complex} + ${row.secondary_unit_complex}`
                : row.primary_unit;
            console.log(`  ${index + 1}. ${row.name} (${row.material_type}) - ${unit}`);
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка миграции:', error.message);
        console.error(error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations().catch(console.error);




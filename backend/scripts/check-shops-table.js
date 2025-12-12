// Проверка существования таблицы shops в базе данных

const pool = require('../db');

async function checkShopsTable() {
    try {
        console.log('🔍 Проверяю таблицу shops...\n');

        // Проверяем существование таблицы
        const tableCheck = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'taiga' 
                AND table_name = 'shops'
            )`
        );

        if (!tableCheck.rows[0].exists) {
            console.log('❌ Таблица shops НЕ существует в базе данных!');
            console.log('   Нужно выполнить миграцию: 02_create_directories.sql');
            return;
        }

        console.log('✅ Таблица shops существует\n');

        // Проверяем структуру таблицы
        const columns = await pool.query(
            `SELECT column_name, data_type, is_nullable
             FROM information_schema.columns
             WHERE table_schema = 'taiga' 
             AND table_name = 'shops'
             ORDER BY ordinal_position`
        );

        console.log('📋 Структура таблицы:');
        columns.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // Проверяем количество записей
        const count = await pool.query('SELECT COUNT(*) as count FROM taiga.shops');
        console.log(`\n📊 Количество записей: ${count.rows[0].count}`);

        // Показываем все магазины, если они есть
        if (parseInt(count.rows[0].count) > 0) {
            const shops = await pool.query('SELECT id, name FROM taiga.shops ORDER BY name');
            console.log('\n🏪 Список магазинов:');
            shops.rows.forEach(shop => {
                console.log(`   ${shop.id}. ${shop.name}`);
            });
        } else {
            console.log('\n⚠️  Таблица пустая - нет записей');
        }

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkShopsTable();




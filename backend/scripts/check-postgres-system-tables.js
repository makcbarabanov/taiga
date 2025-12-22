// Проверка системных таблиц PostgreSQL на наличие информации об удалённых записях
const pool = require('../db');

async function checkSystemTables() {
    try {
        console.log('🔍 Проверяю системные таблицы PostgreSQL...\n');
        
        // 1. Проверяем, включён ли модуль pg_stat_statements
        try {
            const pgStatCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
                ) as exists
            `);
            console.log(`📊 pg_stat_statements: ${pgStatCheck.rows[0].exists ? '✅ включён' : '❌ не включён'}`);
        } catch (e) {
            console.log('📊 pg_stat_statements: ❌ недоступен');
        }
        
        // 2. Проверяем последние запросы (если доступно)
        try {
            const recentQueries = await pool.query(`
                SELECT query, calls, total_exec_time
                FROM pg_stat_statements
                WHERE query LIKE '%DELETE%expenses%'
                ORDER BY total_exec_time DESC
                LIMIT 10
            `);
            if (recentQueries.rows.length > 0) {
                console.log('\n📋 Последние DELETE запросы:');
                recentQueries.rows.forEach(row => {
                    console.log(`   ${row.query.substring(0, 100)}...`);
                });
            }
        } catch (e) {
            console.log('📊 pg_stat_statements: недоступен для запросов');
        }
        
        // 3. Проверяем, есть ли таблица для аудита или логирования
        try {
            const auditTables = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'taiga' 
                AND (table_name LIKE '%audit%' OR table_name LIKE '%log%' OR table_name LIKE '%history%')
            `);
            if (auditTables.rows.length > 0) {
                console.log('\n📋 Найдены таблицы аудита:');
                auditTables.rows.forEach(row => {
                    console.log(`   ${row.table_name}`);
                });
            } else {
                console.log('\n📋 Таблицы аудита не найдены');
            }
        } catch (e) {
            console.log('❌ Ошибка при проверке таблиц аудита');
        }
        
        // 4. Проверяем, есть ли триггеры на таблице expenses
        try {
            const triggers = await pool.query(`
                SELECT trigger_name, event_manipulation, action_statement
                FROM information_schema.triggers
                WHERE event_object_table = 'expenses'
                AND event_object_schema = 'taiga'
            `);
            if (triggers.rows.length > 0) {
                console.log('\n📋 Триггеры на таблице expenses:');
                triggers.rows.forEach(row => {
                    console.log(`   ${row.trigger_name}: ${row.event_manipulation}`);
                });
            } else {
                console.log('\n📋 Триггеры на таблице expenses не найдены');
            }
        } catch (e) {
            console.log('❌ Ошибка при проверке триггеров');
        }
        
        // 5. Проверяем настройки логирования
        const logSettings = await pool.query(`
            SELECT name, setting, unit
            FROM pg_settings
            WHERE name IN (
                'log_statement',
                'log_min_duration_statement',
                'logging_collector',
                'log_directory',
                'log_filename',
                'log_line_prefix'
            )
        `);
        
        console.log('\n📝 Настройки логирования:');
        logSettings.rows.forEach(row => {
            console.log(`   ${row.name}: ${row.setting} ${row.unit || ''}`);
        });
        
        // 6. Попробуем найти информацию о последних транзакциях через xmin/xmax
        try {
            const xminInfo = await pool.query(`
                SELECT 
                    xmin,
                    xmax,
                    ctid,
                    id,
                    date,
                    amount
                FROM taiga.expenses
                WHERE xmax != 0
                ORDER BY xmax DESC
                LIMIT 20
            `);
            if (xminInfo.rows.length > 0) {
                console.log('\n⚠️  Найдены записи с xmax != 0 (возможно, удалённые в текущей транзакции):');
                xminInfo.rows.forEach(row => {
                    console.log(`   ID ${row.id}: ${row.date}, ${row.amount}`);
                });
            }
        } catch (e) {
            console.log('\n📊 Информация о транзакциях недоступна');
        }
        
        console.log('\n💡 Рекомендации:');
        console.log('   1. Проверьте логи PostgreSQL на сервере БД (83.217.220.97)');
        console.log('   2. Логи обычно в: /var/log/postgresql/ или в data/pg_log');
        console.log('   3. Если логирование включено (log_statement = all), там должны быть DELETE запросы');
        console.log('   4. Попробуйте найти резервную копию БД');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkSystemTables();














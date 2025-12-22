// Прямое чтение логов PostgreSQL через SQL функции (если есть права)
const pool = require('../db');

async function readLogsDirect() {
    try {
        console.log('🔍 Попытка прочитать логи PostgreSQL напрямую...\n');
        
        // 1. Пытаемся получить путь к данным
        let dataDir = null;
        try {
            const result = await pool.query("SHOW data_directory");
            dataDir = result.rows[0].data_directory;
            console.log(`📁 Директория данных: ${dataDir}`);
        } catch (e) {
            console.log('❌ Не удалось получить путь к данным через SHOW');
        }
        
        // 2. Пытаемся прочитать логи через pg_read_file (если есть права)
        if (dataDir) {
            const logPath = `${dataDir}/pg_log`;
            console.log(`\n📋 Попытка прочитать логи из: ${logPath}`);
            
            try {
                // Пытаемся получить список файлов логов
                const logFiles = await pool.query(`
                    SELECT pg_ls_dir('${logPath.replace(/'/g, "''")}') as filename
                    WHERE pg_ls_dir('${logPath.replace(/'/g, "''")}') LIKE '%.log'
                    ORDER BY pg_ls_dir('${logPath.replace(/'/g, "''")}') DESC
                    LIMIT 5
                `);
                
                if (logFiles.rows.length > 0) {
                    console.log('✅ Найдены лог-файлы:');
                    logFiles.rows.forEach(row => {
                        console.log(`   - ${row.filename}`);
                    });
                }
            } catch (e) {
                console.log('❌ Не удалось прочитать список файлов (нет прав или неправильный путь)');
            }
        }
        
        // 3. Пытаемся использовать pg_stat_statements для поиска DELETE запросов
        try {
            const deleteQueries = await pool.query(`
                SELECT 
                    query,
                    calls,
                    total_exec_time,
                    mean_exec_time
                FROM pg_stat_statements
                WHERE query LIKE '%DELETE%expenses%'
                ORDER BY total_exec_time DESC
                LIMIT 10
            `);
            
            if (deleteQueries.rows.length > 0) {
                console.log('\n📋 Найдены DELETE запросы в pg_stat_statements:');
                deleteQueries.rows.forEach(row => {
                    console.log(`\n   Запрос: ${row.query.substring(0, 200)}...`);
                    console.log(`   Вызовов: ${row.calls}, Время: ${row.total_exec_time}ms`);
                });
            } else {
                console.log('\n📋 pg_stat_statements не содержит DELETE запросов (модуль не включён или данные очищены)');
            }
        } catch (e) {
            console.log('\n❌ pg_stat_statements недоступен:', e.message);
        }
        
        // 4. Альтернативный способ - проверяем через системные функции
        console.log('\n💡 Попытка альтернативных методов...');
        
        // Проверяем, может быть есть таблица для аудита
        try {
            const auditCheck = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'taiga' 
                AND (table_name LIKE '%audit%' OR table_name LIKE '%log%' OR table_name LIKE '%history%')
            `);
            
            if (auditCheck.rows.length > 0) {
                console.log('✅ Найдены таблицы аудита:');
                auditCheck.rows.forEach(row => {
                    console.log(`   - ${row.table_name}`);
                });
            }
        } catch (e) {
            console.log('❌ Ошибка при проверке таблиц аудита');
        }
        
        console.log('\n⚠️  ВЫВОД:');
        console.log('   Прямое чтение логов через SQL ограничено правами доступа.');
        console.log('   Логи находятся на файловой системе сервера БД.');
        console.log('   Для чтения логов нужен SSH доступ к серверу 83.217.220.97');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

readLogsDirect();


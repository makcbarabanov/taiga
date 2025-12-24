// Экстренное восстановление - проверка всех возможных источников данных
const pool = require('../db');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function emergencyRecovery() {
    try {
        console.log('🚨 ЭКСТРЕННОЕ ВОССТАНОВЛЕНИЕ ДАННЫХ\n');
        console.log('Проверяю все возможные источники...\n');
        
        // 1. Проверяем настройки логирования
        const logSettings = await pool.query(`
            SELECT name, setting
            FROM pg_settings
            WHERE name IN ('log_directory', 'log_filename', 'log_statement', 'logging_collector')
        `);
        
        console.log('📝 Настройки логирования PostgreSQL:');
        logSettings.rows.forEach(row => {
            console.log(`   ${row.name}: ${row.setting}`);
        });
        
        // 2. Пытаемся найти путь к логам через show data_directory
        try {
            const dataDir = await pool.query("SHOW data_directory");
            console.log(`\n📁 Директория данных PostgreSQL: ${dataDir.rows[0].data_directory}`);
            console.log(`   Логи должны быть в: ${dataDir.rows[0].data_directory}/pg_log`);
        } catch (e) {
            console.log('\n❌ Не удалось получить путь к данным');
        }
        
        // 3. Пытаемся подключиться к серверу через psql и проверить логи
        console.log('\n🔍 Попытка получить доступ к логам через psql...');
        console.log('   Сервер: 83.217.220.97');
        console.log('   База: default_db');
        console.log('   Пользователь: marabot');
        
        // 4. Проверяем, может быть есть резервные копии в проекте
        console.log('\n📦 Проверяю наличие резервных копий...');
        const fs = require('fs');
        const path = require('path');
        
        const possibleBackupDirs = [
            path.join(__dirname, '..', '..', 'БД'),
            path.join(__dirname, '..', 'backups'),
            path.join(__dirname, '..', '..', 'backups'),
            path.join(__dirname, '..', '..', '..', 'backups')
        ];
        
        for (const dir of possibleBackupDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                const backups = files.filter(f => 
                    f.endsWith('.sql') || 
                    f.endsWith('.backup') || 
                    f.endsWith('.dump') ||
                    f.includes('backup') ||
                    f.includes('dump')
                );
                if (backups.length > 0) {
                    console.log(`   ✅ Найдены резервные копии в ${dir}:`);
                    backups.forEach(f => console.log(`      - ${f}`));
                }
            }
        }
        
        // 5. Инструкции для ручного восстановления
        console.log('\n📋 ИНСТРУКЦИИ ДЛЯ ВОССТАНОВЛЕНИЯ:');
        console.log('\n1. Подключитесь к серверу БД (83.217.220.97) через SSH');
        console.log('2. Найдите логи PostgreSQL:');
        console.log('   cd /var/lib/postgresql/*/data/pg_log');
        console.log('   или');
        console.log('   cd /var/log/postgresql/');
        console.log('3. Ищите последние логи:');
        console.log('   ls -lt | head -5');
        console.log('4. Ищите DELETE запросы:');
        console.log('   grep -i "DELETE FROM taiga.expenses" *.log | tail -100');
        console.log('5. В логах должны быть данные удалённых записей');
        
        console.log('\n💡 АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ:');
        console.log('1. Проверьте, есть ли автоматические резервные копии на сервере');
        console.log('2. Проверьте, может быть есть экспорты данных в других местах');
        console.log('3. Если помните хотя бы примерные даты/суммы, можно попробовать восстановить вручную');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

emergencyRecovery();
















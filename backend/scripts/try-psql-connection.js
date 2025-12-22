// Попытка подключиться к PostgreSQL через psql и проверить логи
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function tryPsqlConnection() {
    try {
        console.log('🔍 Попытка подключиться к PostgreSQL через psql...\n');
        
        // Проверяем, установлен ли psql
        try {
            await execPromise('psql --version');
            console.log('✅ psql установлен\n');
        } catch (e) {
            console.log('❌ psql не установлен или не в PATH');
            console.log('   Установите PostgreSQL client tools\n');
            return;
        }
        
        // Пытаемся подключиться и проверить логи
        const connectionString = 'postgresql://marabot:2nix8#mN&Er5tR@83.217.220.97:5432/default_db';
        
        console.log('📋 Попытка получить информацию о логах...');
        console.log('   Сервер: 83.217.220.97');
        console.log('   База: default_db\n');
        
        // Пытаемся получить путь к данным
        try {
            const result = await execPromise(`psql "${connectionString}" -c "SHOW data_directory;"`);
            console.log('Результат:', result.stdout);
        } catch (e) {
            console.log('❌ Не удалось подключиться через psql');
            console.log('   Ошибка:', e.message);
            console.log('\n💡 Попробуйте подключиться вручную:');
            console.log(`   psql -h 83.217.220.97 -U marabot -d default_db`);
        }
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

tryPsqlConnection();














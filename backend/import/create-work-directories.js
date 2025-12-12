// ===========================================
// Скрипт для создания справочников работ
// ===========================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
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

async function createDirectories() {
    try {
        console.log('🚀 Создание справочников для работ...\n');

        // Читаем SQL скрипт
        const sqlFile1 = path.join(__dirname, '../../БД/05_create_work_directories.sql');
        const sqlFile2 = path.join(__dirname, '../../БД/06_update_project_works_structure.sql');

        console.log('📄 Выполняю 05_create_work_directories.sql...');
        const sql1 = fs.readFileSync(sqlFile1, 'utf-8');
        await pool.query(sql1);
        console.log('✅ Справочники созданы\n');

        console.log('📄 Выполняю 06_update_project_works_structure.sql...');
        const sql2 = fs.readFileSync(sqlFile2, 'utf-8');
        await pool.query(sql2);
        
        // Делаем work_name nullable отдельным запросом
        try {
            await pool.query('ALTER TABLE taiga.project_works ALTER COLUMN work_name DROP NOT NULL');
            console.log('✅ work_name сделана nullable\n');
        } catch (err) {
            if (!err.message.includes('does not exist')) {
                console.log('⚠️  Предупреждение при изменении work_name:', err.message);
            }
        }
        
        console.log('✅ Структура project_works обновлена\n');

        console.log('✅ Все справочники успешно созданы!');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    createDirectories().catch(console.error);
}

module.exports = { createDirectories };


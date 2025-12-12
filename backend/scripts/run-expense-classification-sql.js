// ===========================================
// Скрипт для выполнения SQL миграций
// для системы классификации расходов
// ===========================================

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function executeSQLFile(filePath) {
    try {
        console.log(`\n📄 Выполняю: ${path.basename(filePath)}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`✅ Успешно: ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Ошибка в ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

async function main() {
    try {
        console.log('🚀 Начинаю выполнение SQL миграций для классификации расходов...\n');

        const sqlFiles = [
            path.join(__dirname, '../../БД/18_create_expense_categories_with_aliases.sql'),
            path.join(__dirname, '../../БД/19_create_employees_table.sql'),
            path.join(__dirname, '../../БД/20_create_expense_classification_rules.sql')
        ];

        for (const filePath of sqlFiles) {
            const success = await executeSQLFile(filePath);
            if (!success) {
                console.error('\n❌ Миграция прервана из-за ошибки!');
                process.exit(1);
            }
        }

        console.log('\n✅ Все миграции выполнены успешно!');
        
        // Проверяем результаты
        console.log('\n📊 Проверка результатов:');
        
        const categories = await pool.query(
            'SELECT id, name, alias FROM taiga.expense_categories ORDER BY id'
        );
        console.log(`\nКатегории расходов (${categories.rows.length}):`);
        categories.rows.forEach(cat => {
            console.log(`  ${cat.id}. ${cat.alias || 'нет'} - ${cat.name}`);
        });

        const employees = await pool.query(
            'SELECT id, last_name, first_name, status FROM taiga.employees ORDER BY id'
        );
        console.log(`\nСотрудники (${employees.rows.length}):`);
        employees.rows.forEach(emp => {
            const name = `${emp.last_name || ''} ${emp.first_name || ''}`.trim() || 'Без имени';
            console.log(`  ${emp.id}. ${name} (${emp.status})`);
        });

        const rules = await pool.query(
            `SELECT COUNT(*) as count FROM taiga.expense_classification_rules`
        );
        console.log(`\nПравил классификации: ${rules.rows[0].count}`);

    } catch (error) {
        console.error('Критическая ошибка:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();


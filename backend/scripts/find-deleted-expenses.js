// Поиск информации об удалённых расходах в логах PostgreSQL
// ВНИМАНИЕ: Логи могут быть на сервере БД, а не локально

const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function findDeletedExpenses() {
    try {
        console.log('🔍 Ищу информацию об удалённых расходах...\n');
        
        // Проверяем пропуски в ID более детально
        const gapsResult = await pool.query(`
            WITH numbered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
                FROM taiga.expenses
            ),
            gaps AS (
                SELECT 
                    n1.id as current_id,
                    n2.id as next_id,
                    n2.id - n1.id as gap
                FROM numbered n1
                JOIN numbered n2 ON n2.rn = n1.rn + 1
                WHERE n2.id - n1.id > 1
            )
            SELECT * FROM gaps ORDER BY gap DESC
        `);
        
        console.log('📊 Пропуски в ID (отсортированы по размеру):');
        let totalDeleted = 0;
        gapsResult.rows.forEach(row => {
            const deletedCount = row.gap - 1;
            totalDeleted += deletedCount;
            console.log(`   Пропуск между ID ${row.current_id} и ${row.next_id}: удалено ~${deletedCount} записей`);
        });
        
        console.log(`\n⚠️  Примерно удалено записей: ${totalDeleted}`);
        
        // Показываем диапазоны удалённых ID
        console.log('\n📋 Диапазоны удалённых ID:');
        gapsResult.rows.forEach(row => {
            const startId = row.current_id + 1;
            const endId = row.next_id - 1;
            if (startId <= endId) {
                console.log(`   ID ${startId} - ${endId} (${endId - startId + 1} записей)`);
            }
        });
        
        console.log('\n💡 Для восстановления:');
        console.log('   1. Проверьте логи PostgreSQL на сервере БД (83.217.220.97)');
        console.log('   2. Логи обычно находятся в: /var/log/postgresql/ или в pg_log');
        console.log('   3. Ищите строки с "DELETE FROM taiga.expenses"');
        console.log('   4. Если найдёте данные в логах, используйте restore-expense.js для восстановления');
        
        // Проверяем, есть ли локальные логи
        const possibleLogPaths = [
            'C:\\Program Files\\PostgreSQL\\*\\data\\log',
            'C:\\Program Files (x86)\\PostgreSQL\\*\\data\\log',
            '/var/log/postgresql',
            '/var/lib/postgresql/*/data/pg_log'
        ];
        
        console.log('\n📁 Проверьте логи PostgreSQL на сервере БД:');
        console.log('   Сервер: 83.217.220.97');
        console.log('   Подключитесь к серверу и проверьте логи в директории pg_log');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

findDeletedExpenses();














// Срочная проверка возможности восстановления данных
const pool = require('../db');

async function checkRecoveryOptions() {
    try {
        console.log('🔍 Проверяю возможности восстановления...\n');
        
        // 1. Проверяем текущее состояние таблицы expenses
        const countResult = await pool.query('SELECT COUNT(*) as count FROM taiga.expenses');
        console.log(`📊 Текущее количество расходов в БД: ${countResult.rows[0].count}`);
        
        // 2. Проверяем максимальный ID
        const maxIdResult = await pool.query('SELECT MAX(id) as max_id FROM taiga.expenses');
        const maxId = maxIdResult.rows[0].max_id;
        console.log(`🔢 Максимальный ID: ${maxId || 'нет данных'}`);
        
        // 3. Проверяем последние 10 расходов
        const recentResult = await pool.query(`
            SELECT id, date, amount, category_id, subcategory, comment, project_id
            FROM taiga.expenses
            ORDER BY id DESC
            LIMIT 10
        `);
        
        console.log('\n📋 Последние 10 расходов:');
        recentResult.rows.forEach(row => {
            console.log(`   ID ${row.id}: ${row.date} | ${row.amount} | Категория ${row.category_id} | ${row.comment || '-'}`);
        });
        
        // 4. Проверяем пропуски в ID (возможно, удалённые записи)
        const gapsResult = await pool.query(`
            WITH numbered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
                FROM taiga.expenses
            )
            SELECT 
                n1.id as current_id,
                n2.id as next_id,
                n2.id - n1.id as gap
            FROM numbered n1
            JOIN numbered n2 ON n2.rn = n1.rn + 1
            WHERE n2.id - n1.id > 1
            ORDER BY n1.id
            LIMIT 20
        `);
        
        if (gapsResult.rows.length > 0) {
            console.log('\n⚠️  Обнаружены пропуски в ID (возможно, удалённые записи):');
            gapsResult.rows.forEach(row => {
                console.log(`   Пропуск: между ID ${row.current_id} и ${row.next_id} (пропущено ${row.gap - 1} ID)`);
            });
        } else {
            console.log('\n✅ Пропусков в ID не обнаружено');
        }
        
        // 5. Проверяем, включено ли логирование в PostgreSQL
        const logCheckResult = await pool.query(`
            SELECT name, setting 
            FROM pg_settings 
            WHERE name IN ('log_statement', 'log_min_duration_statement', 'logging_collector')
        `);
        
        console.log('\n📝 Настройки логирования PostgreSQL:');
        logCheckResult.rows.forEach(row => {
            console.log(`   ${row.name}: ${row.setting}`);
        });
        
        console.log('\n💡 Рекомендации:');
        console.log('   1. Если вы помните данные удалённых расходов, используйте скрипт restore-expense.js');
        console.log('   2. Проверьте, есть ли резервная копия БД (файлы .sql или .backup)');
        console.log('   3. Если логирование включено, проверьте логи PostgreSQL');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkRecoveryOptions();
















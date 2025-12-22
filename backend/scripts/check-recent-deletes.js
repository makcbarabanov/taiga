// Скрипт для проверки недавно удалённых расходов
// ВНИМАНИЕ: PostgreSQL не ведёт автоматически логи DELETE операций
// Этот скрипт проверяет текущее состояние таблицы expenses

const pool = require('../db');

async function checkExpenses() {
    try {
        // Получаем все расходы
        const result = await pool.query(`
            SELECT id, date, amount, category_id, subcategory, comment, project_id
            FROM taiga.expenses
            ORDER BY id DESC
            LIMIT 50
        `);
        
        console.log(`\n📊 Всего расходов в базе: ${result.rows.length}`);
        console.log('\nПоследние 50 расходов:');
        console.log('ID | Дата | Сумма | Категория | Подкатегория | Комментарий');
        console.log('---|------|-------|-----------|--------------|-------------');
        
        result.rows.forEach(row => {
            console.log(`${row.id} | ${row.date} | ${row.amount} | ${row.category_id} | ${row.subcategory || '-'} | ${row.comment || '-'}`);
        });
        
        // Проверяем максимальный ID
        const maxIdResult = await pool.query('SELECT MAX(id) as max_id FROM taiga.expenses');
        console.log(`\n🔢 Максимальный ID в таблице: ${maxIdResult.rows[0].max_id}`);
        
        // Проверяем, есть ли пропуски в ID (возможно, удалённые записи)
        const gapsResult = await pool.query(`
            SELECT 
                id,
                LAG(id) OVER (ORDER BY id) as prev_id,
                id - LAG(id) OVER (ORDER BY id) as gap
            FROM taiga.expenses
            WHERE id - LAG(id) OVER (ORDER BY id) > 1
            ORDER BY id
            LIMIT 20
        `);
        
        if (gapsResult.rows.length > 0) {
            console.log('\n⚠️  Обнаружены пропуски в ID (возможно, удалённые записи):');
            gapsResult.rows.forEach(row => {
                console.log(`   Пропуск между ID ${row.prev_id} и ${row.id}`);
            });
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();














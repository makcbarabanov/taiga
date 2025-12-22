// Скрипт для восстановления удалённого расхода
// Использование: node scripts/restore-expense.js <id> <date> <amount> <category_id> [project_id] [subcategory] [comment]

const pool = require('../db');

async function restoreExpense(id, date, amount, categoryId, projectId = null, subcategory = null, comment = null) {
    try {
        // Проверяем, не существует ли уже запись с таким ID
        const checkResult = await pool.query('SELECT id FROM taiga.expenses WHERE id = $1', [id]);
        
        if (checkResult.rows.length > 0) {
            console.log(`⚠️  Запись с ID ${id} уже существует!`);
            return;
        }
        
        // Извлекаем месяц и год из даты
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        
        // Восстанавливаем запись
        const result = await pool.query(
            `INSERT INTO taiga.expenses 
             (id, date, month, year, category_id, subcategory, amount, project_id, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [id, date, month, year, categoryId, subcategory, amount, projectId, comment]
        );
        
        console.log(`✅ Расход восстановлен:`);
        console.log(`   ID: ${result.rows[0].id}`);
        console.log(`   Дата: ${result.rows[0].date}`);
        console.log(`   Сумма: ${result.rows[0].amount}`);
        console.log(`   Категория: ${result.rows[0].category_id}`);
        
    } catch (error) {
        console.error('❌ Ошибка при восстановлении:', error.message);
    } finally {
        await pool.end();
    }
}

// Получаем аргументы из командной строки
const args = process.argv.slice(2);

if (args.length < 4) {
    console.log('Использование: node scripts/restore-expense.js <id> <date> <amount> <category_id> [project_id] [subcategory] [comment]');
    console.log('Пример: node scripts/restore-expense.js 123 "2025-12-10" 1000 1 1 "Подкатегория" "Комментарий"');
    process.exit(1);
}

const [id, date, amount, categoryId, projectId, subcategory, comment] = args;

restoreExpense(
    parseInt(id),
    date,
    parseFloat(amount),
    parseInt(categoryId),
    projectId ? parseInt(projectId) : null,
    subcategory || null,
    comment || null
);














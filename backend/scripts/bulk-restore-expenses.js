// Массовое восстановление расходов из JSON файла
// Формат файла restore-data.json:
// [
//   { "id": 32, "date": "2025-12-01", "amount": 1000, "category_id": 1, "project_id": 1, "subcategory": "Подкатегория", "comment": "Комментарий" },
//   ...
// ]

const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function bulkRestore(filePath) {
    try {
        // Читаем файл с данными
        if (!fs.existsSync(filePath)) {
            console.log(`❌ Файл ${filePath} не найден!`);
            console.log('\nСоздайте файл restore-data.json со следующей структурой:');
            console.log(JSON.stringify([
                {
                    id: 32,
                    date: "2025-12-01",
                    amount: 1000,
                    category_id: 1,
                    project_id: 1,
                    subcategory: "Подкатегория",
                    comment: "Комментарий"
                }
            ], null, 2));
            return;
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📋 Найдено ${data.length} записей для восстановления\n`);
        
        let restored = 0;
        let skipped = 0;
        let errors = 0;
        
        for (const expense of data) {
            try {
                // Проверяем, не существует ли уже запись
                const checkResult = await pool.query('SELECT id FROM taiga.expenses WHERE id = $1', [expense.id]);
                
                if (checkResult.rows.length > 0) {
                    console.log(`⚠️  ID ${expense.id}: уже существует, пропускаю`);
                    skipped++;
                    continue;
                }
                
                // Извлекаем месяц и год из даты
                const dateObj = new Date(expense.date);
                const month = dateObj.getMonth() + 1;
                const year = dateObj.getFullYear();
                
                // Восстанавливаем запись
                const result = await pool.query(
                    `INSERT INTO taiga.expenses 
                     (id, date, month, year, category_id, subcategory, amount, project_id, comment, unit_id, quantity, price, section, wallet, shop_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                     RETURNING *`,
                    [
                        expense.id,
                        expense.date,
                        month,
                        year,
                        expense.category_id,
                        expense.subcategory || null,
                        expense.amount,
                        expense.project_id || null,
                        expense.comment || null,
                        expense.unit_id || null,
                        expense.quantity || null,
                        expense.price || null,
                        expense.section || null,
                        expense.wallet || null,
                        expense.shop_id || null
                    ]
                );
                
                console.log(`✅ ID ${expense.id}: восстановлен (${expense.date}, ${expense.amount})`);
                restored++;
                
            } catch (error) {
                console.error(`❌ ID ${expense.id}: ошибка - ${error.message}`);
                errors++;
            }
        }
        
        console.log(`\n📊 Результат:`);
        console.log(`   ✅ Восстановлено: ${restored}`);
        console.log(`   ⚠️  Пропущено: ${skipped}`);
        console.log(`   ❌ Ошибок: ${errors}`);
        
    } catch (error) {
        console.error('❌ Критическая ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

const filePath = process.argv[2] || 'restore-data.json';
bulkRestore(filePath);
















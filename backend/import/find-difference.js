// ===========================================
// Скрипт для поиска разницы между CSV и БД
// ===========================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

const CSV_DIR = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)';

async function findDifference() {
    try {
        console.log('🔍 Поиск разницы между CSV и БД...\n');

        // Загружаем расходы из CSV
        const csvFile = path.join(CSV_DIR, 'Тайга 2023 - Рас.csv');
        const fileContent = fs.readFileSync(csvFile, 'utf-8');
        
        const records = parse(fileContent, {
            skip_empty_lines: true,
            relax_column_count: true,
            from_line: 3
        });

        const csvExpenses = [];
        let csvTotal = 0;

        for (const record of records) {
            const date = record[2];
            const category = record[5];
            const subcategory = record[6];
            const quantity = record[8];
            const price = record[9];
            const amount = record[10];
            const client = record[11];
            const object = record[12];

            if (!client || client.trim() !== 'Феруз' || !object || object.trim() !== 'Гостевой 5х8') {
                continue;
            }

            if (!date || !category) {
                continue;
            }

            // Парсим сумму
            let amt = amount ? parseFloat(amount.toString().replace(/\s/g, '').replace(',', '.')) : null;
            const qty = quantity ? parseFloat(quantity.toString().replace(/\s/g, '').replace(',', '.')) : null;
            const prc = price ? parseFloat(price.toString().replace(/\s/g, '').replace(',', '.')) : null;

            // Если суммы нет, но есть количество и цена - вычисляем
            if (!amt && qty && prc) {
                amt = qty * prc;
            }

            // Если суммы нет вообще - пропускаем
            if (!amt || isNaN(amt)) {
                continue;
            }

            csvTotal += amt;
            csvExpenses.push({
                date: date,
                category: category.trim(),
                subcategory: (subcategory || '').trim(),
                amount: amt,
                quantity: qty,
                price: prc
            });
        }

        console.log(`📊 В CSV: сумма = ${csvTotal}, количество = ${csvExpenses.length}`);

        // Загружаем расходы из БД
        const dbResult = await pool.query(`
            SELECT e.date, ec.name as category, e.subcategory, e.amount
            FROM taiga.expenses e
            JOIN taiga.expense_categories ec ON e.category_id = ec.id
            WHERE e.project_id = 1
            ORDER BY e.date, e.amount
        `);

        let dbTotal = 0;
        dbResult.rows.forEach(row => {
            dbTotal += parseFloat(row.amount);
        });

        console.log(`📊 В БД: сумма = ${dbTotal}, количество = ${dbResult.rows.length}`);
        console.log(`📊 Ожидается: 616413`);
        console.log(`📊 Разница CSV vs БД: ${csvTotal - dbTotal}`);
        console.log(`📊 Разница Ожидаемое vs БД: ${616413 - dbTotal}\n`);

        // Сравниваем по датам и суммам
        console.log('🔍 Детальное сравнение:\n');
        
        // Группируем CSV по дате и сумме
        const csvByDateAmount = {};
        csvExpenses.forEach(exp => {
            const key = `${exp.date}|${exp.amount}`;
            if (!csvByDateAmount[key]) {
                csvByDateAmount[key] = [];
            }
            csvByDateAmount[key].push(exp);
        });

        // Группируем БД по дате и сумме
        const dbByDateAmount = {};
        dbResult.rows.forEach(row => {
            const dateStr = row.date.split('T')[0];
            const dateParts = dateStr.split('-');
            const csvDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
            const key = `${csvDate}|${row.amount}`;
            if (!dbByDateAmount[key]) {
                dbByDateAmount[key] = [];
            }
            dbByDateAmount[key].push(row);
        });

        // Ищем расходы, которые есть в CSV, но нет в БД
        const missing = [];
        Object.keys(csvByDateAmount).forEach(key => {
            const csvItems = csvByDateAmount[key];
            const dbItems = dbByDateAmount[key] || [];
            
            if (csvItems.length > dbItems.length) {
                const diff = csvItems.length - dbItems.length;
                for (let i = 0; i < diff; i++) {
                    missing.push(csvItems[i]);
                }
            }
        });

        if (missing.length > 0) {
            console.log(`❌ Найдено ${missing.length} недостающих расходов:\n`);
            missing.forEach((exp, idx) => {
                console.log(`${idx + 1}. ${exp.date} | ${exp.category} | ${exp.subcategory} | ${exp.amount} руб`);
            });
        } else {
            console.log('✅ Все расходы из CSV есть в БД');
        }

        // Проверяем, может быть проблема в датах
        console.log('\n🔍 Проверка дат:\n');
        const dateIssues = [];
        csvExpenses.forEach(csvExp => {
            const [day, month, year] = csvExp.date.split('.');
            const expectedDate = `${year}-${month}-${day}`;
            const dbExp = dbResult.rows.find(db => {
                const dbDate = db.date.split('T')[0];
                return dbDate === expectedDate && 
                       Math.abs(parseFloat(db.amount) - csvExp.amount) < 0.01 &&
                       db.category === csvExp.category;
            });
            if (!dbExp) {
                dateIssues.push(csvExp);
            }
        });

        if (dateIssues.length > 0) {
            console.log(`⚠️  Найдено ${dateIssues.length} расходов с проблемами дат/сумм`);
        }

    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await pool.end();
    }
}

findDifference();



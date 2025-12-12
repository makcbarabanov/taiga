// ===========================================
// Скрипт для поиска недостающих расходов
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

async function checkMissing() {
    try {
        console.log('🔍 Поиск недостающих расходов...\n');

        // Загружаем расходы из CSV
        const csvFile = path.join(CSV_DIR, 'Тайга 2023 - Рас.csv');
        const fileContent = fs.readFileSync(csvFile, 'utf-8');
        
        const records = parse(fileContent, {
            skip_empty_lines: true,
            relax_column_count: true,
            from_line: 3
        });

        // Загружаем расходы из БД
        const dbResult = await pool.query(
            'SELECT date, category_id, subcategory, amount FROM taiga.expenses WHERE project_id = 1'
        );

        // Создаём набор для сравнения (дата + категория + подкатегория + сумма)
        const dbExpenses = new Set();
        dbResult.rows.forEach(exp => {
            const key = `${exp.date}|${exp.category_id}|${exp.subcategory || ''}|${exp.amount}`;
            dbExpenses.add(key);
        });

        let csvTotal = 0;
        let csvCount = 0;
        const missing = [];

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

            if (!amt || isNaN(amt)) {
                continue;
            }

            csvTotal += amt;
            csvCount++;

            // Парсим дату для сравнения
            const [day, month, year] = date.split('.');
            const dateObj = new Date(`${year}-${month}-${day}`);
            const dateStr = dateObj.toISOString().split('T')[0];

            // Находим category_id
            const catResult = await pool.query(
                'SELECT id FROM taiga.expense_categories WHERE name = $1',
                [category.trim()]
            );

            if (catResult.rows.length === 0) {
                continue;
            }

            const categoryId = catResult.rows[0].id;
            const key = `${dateStr}|${categoryId}|${subcategory ? subcategory.trim() : ''}|${amt}`;

            if (!dbExpenses.has(key)) {
                missing.push({
                    date: date,
                    category: category,
                    subcategory: subcategory || '',
                    amount: amt,
                    quantity: qty,
                    price: prc
                });
            }
        }

        console.log('📊 Статистика:');
        console.log(`   В CSV: сумма = ${csvTotal}, количество = ${csvCount}`);
        console.log(`   В БД: количество = ${dbResult.rows.length}`);
        console.log(`   Недостающих: ${missing.length}\n`);

        if (missing.length > 0) {
            console.log('❌ Недостающие расходы:');
            missing.forEach((exp, idx) => {
                console.log(`${idx + 1}. ${exp.date} | ${exp.category} | ${exp.subcategory} | ${exp.amount} руб`);
            });
        } else {
            console.log('✅ Все расходы импортированы!');
        }

    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkMissing();



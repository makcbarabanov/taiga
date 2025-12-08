// ===========================================
// Скрипт импорта данных для клиента "Феруз"
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

// Путь к CSV файлам
const CSV_DIR = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)';

async function importFeruz() {
    try {
        console.log('🚀 Начало импорта данных для "Феруз"...\n');

        // 1. Создать или найти клиента
        const clientName = 'Феруз';
        let clientId = await findOrCreateClient(clientName);
        console.log(`✅ Клиент "${clientName}" (ID: ${clientId})`);

        // 2. Создать или найти объект
        const projectName = 'Гостевой 5х8';
        let projectId = await findOrCreateProject(clientId, projectName);
        console.log(`✅ Объект "${projectName}" (ID: ${projectId})`);

        // 3. Импортировать расходы
        await importExpenses(projectId, clientId);

        // 4. Импортировать доходы
        await importIncome(projectId, clientId);

        console.log('\n✅ Импорт завершён успешно!');
    } catch (error) {
        console.error('❌ Ошибка импорта:', error);
    } finally {
        await pool.end();
    }
}

async function findOrCreateClient(name) {
    const result = await pool.query(
        'SELECT id FROM taiga.clients WHERE name = $1',
        [name]
    );

    if (result.rows.length > 0) {
        return result.rows[0].id;
    }

    const insertResult = await pool.query(
        'INSERT INTO taiga.clients (name) VALUES ($1) RETURNING id',
        [name]
    );

    return insertResult.rows[0].id;
}

async function findOrCreateProject(clientId, name) {
    const result = await pool.query(
        'SELECT id FROM taiga.projects WHERE client_id = $1 AND name = $2',
        [clientId, name]
    );

    if (result.rows.length > 0) {
        return result.rows[0].id;
    }

    const insertResult = await pool.query(
        `INSERT INTO taiga.projects (client_id, name, status) 
         VALUES ($1, $2, 'В работе') RETURNING id`,
        [clientId, name]
    );

    return insertResult.rows[0].id;
}

async function findOrCreateShop(name) {
    if (!name || name.trim() === '') return null;

    const result = await pool.query(
        'SELECT id FROM taiga.shops WHERE name = $1',
        [name.trim()]
    );

    if (result.rows.length > 0) {
        return result.rows[0].id;
    }

    const insertResult = await pool.query(
        'INSERT INTO taiga.shops (name) VALUES ($1) RETURNING id',
        [name.trim()]
    );

    return insertResult.rows[0].id;
}

async function findCategoryId(categoryName) {
    const result = await pool.query(
        'SELECT id FROM taiga.expense_categories WHERE name = $1',
        [categoryName]
    );

    if (result.rows.length > 0) {
        return result.rows[0].id;
    }

    // Если категории нет, создаём её
    const insertResult = await pool.query(
        'INSERT INTO taiga.expense_categories (name) VALUES ($1) RETURNING id',
        [categoryName]
    );

    return insertResult.rows[0].id;
}

async function findUnitId(unitName) {
    if (!unitName || unitName.trim() === '') return null;

    // Ищем по короткому названию или полному
    const result = await pool.query(
        `SELECT id FROM taiga.units 
         WHERE short_name = $1 OR name = $1 OR name LIKE $2`,
        [unitName.trim(), `%${unitName.trim()}%`]
    );

    if (result.rows.length > 0) {
        return result.rows[0].id;
    }

    // Если единицы нет, создаём её
    const insertResult = await pool.query(
        'INSERT INTO taiga.units (name, short_name) VALUES ($1, $1) RETURNING id',
        [unitName.trim()]
    );

    return insertResult.rows[0].id;
}

async function importExpenses(projectId, clientId) {
    const csvFile = path.join(CSV_DIR, 'Тайга 2023 - Рас.csv');
    
    if (!fs.existsSync(csvFile)) {
        console.log('⚠️  Файл расходов не найден');
        return;
    }

    console.log('\n📦 Импорт расходов...');

    const fileContent = fs.readFileSync(csvFile, 'utf-8');
    
    // Парсим CSV (пропускаем первые 2 строки - заголовки)
    const records = parse(fileContent, {
        skip_empty_lines: true,
        relax_column_count: true,
        from_line: 3
    });

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
        // Структура: [пусто, пусто, Дата, Мес, Год, Категория, Подкатегория, Ед.изм, Кол-во, Цена, Ст-сть, Клиент, Объект, ...]
        const date = record[2];
        const category = record[5];
        const subcategory = record[6];
        const unit = record[7];
        const quantity = record[8];
        const price = record[9];
        const amount = record[10];
        const client = record[11];
        const object = record[12];
        const shop = record[14];

        // Пропускаем строки, которые не относятся к Ферузу
        if (!client || client.trim() !== 'Феруз' || !object || object.trim() !== 'Гостевой 5х8') {
            continue;
        }

        // Пропускаем пустые строки (но разрешаем расходы без количества/цены, если есть сумма)
        if (!date || !category) {
            skipped++;
            continue;
        }
        
        // Если нет суммы, но есть количество и цена - вычисляем сумму
        // Если нет суммы и нет количества/цены - пропускаем
        if (!amount && (!quantity || !price)) {
            skipped++;
            continue;
        }

        try {
            // Парсим дату
            const [day, month, year] = date.split('.');
            const dateObj = new Date(`${year}-${month}-${day}`);

            // Находим или создаём категорию
            const categoryId = await findCategoryId(category.trim());

            // Находим или создаём единицу измерения
            const unitId = unit ? await findUnitId(unit.trim()) : null;

            // Находим или создаём магазин
            const shopId = shop ? await findOrCreateShop(shop.trim()) : null;

            // Парсим числа
            const qty = quantity ? parseFloat(quantity.toString().replace(/\s/g, '').replace(',', '.')) : null;
            const prc = price ? parseFloat(price.toString().replace(/\s/g, '').replace(',', '.')) : null;
            let amt = amount ? parseFloat(amount.toString().replace(/\s/g, '').replace(',', '.')) : null;
            
            // Если суммы нет, но есть количество и цена - вычисляем
            if (!amt && qty && prc) {
                amt = qty * prc;
            }
            
            // Если суммы нет вообще - пропускаем
            if (!amt || isNaN(amt)) {
                skipped++;
                continue;
            }

            // Вставляем расход
            await pool.query(
                `INSERT INTO taiga.expenses 
                 (project_id, date, month, year, category_id, subcategory, unit_id, 
                  quantity, price, amount, shop_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    projectId,
                    dateObj.toISOString().split('T')[0],
                    parseInt(month),
                    parseInt(year),
                    categoryId,
                    subcategory ? subcategory.trim() : null,
                    unitId,
                    qty,
                    prc,
                    amt,
                    shopId
                ]
            );

            imported++;
        } catch (error) {
            console.error(`   Ошибка импорта строки: ${error.message}`);
            skipped++;
        }
    }

    console.log(`   ✅ Импортировано: ${imported} расходов`);
    if (skipped > 0) {
        console.log(`   ⚠️  Пропущено: ${skipped} строк`);
    }
}

async function importIncome(projectId, clientId) {
    const csvFile = path.join(CSV_DIR, 'Тайга 2023 - Дох.csv');
    
    if (!fs.existsSync(csvFile)) {
        console.log('⚠️  Файл доходов не найден');
        return;
    }

    console.log('\n💰 Импорт доходов...');

    const fileContent = fs.readFileSync(csvFile, 'utf-8');
    
    // Парсим CSV (пропускаем первые 2 строки - заголовки)
    const records = parse(fileContent, {
        skip_empty_lines: true,
        relax_column_count: true,
        from_line: 3
    });

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
        // Структура: [пусто, Дата, Мес, Год, Клиент, Объект, Сумма, Кошелёк, Комментарий]
        const date = record[1];
        const month = record[2];
        const year = record[3];
        const client = record[4];
        const object = record[5];
        const amount = record[6];
        const wallet = record[7];
        const comment = record[8];

        // Пропускаем строки, которые не относятся к Ферузу
        if (!client || client.trim() !== 'Феруз' || !object || object.trim() !== 'Гостевой 5х8') {
            continue;
        }

        // Пропускаем пустые строки
        if (!date || !amount) {
            skipped++;
            continue;
        }

        try {
            // Парсим дату
            const [day, mon, yr] = date.split('.');
            const dateObj = new Date(`${yr}-${mon}-${day}`);

            // Парсим сумму
            const amt = parseFloat(amount.toString().replace(/\s/g, '').replace(',', '.'));

            // Вставляем доход
            await pool.query(
                `INSERT INTO taiga.income 
                 (project_id, date, month, year, amount, wallet, comment)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    projectId,
                    dateObj.toISOString().split('T')[0],
                    parseInt(month) || dateObj.getMonth() + 1,
                    parseInt(year) || dateObj.getFullYear(),
                    amt,
                    wallet ? wallet.trim() : null,
                    comment ? comment.trim() : null
                ]
            );

            imported++;
        } catch (error) {
            console.error(`   Ошибка импорта строки: ${error.message}`);
            skipped++;
        }
    }

    console.log(`   ✅ Импортировано: ${imported} доходов`);
    if (skipped > 0) {
        console.log(`   ⚠️  Пропущено: ${skipped} строк`);
    }
}

// Запуск импорта
importFeruz();

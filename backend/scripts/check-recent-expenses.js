// Проверка недавних расходов для поиска лишних
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);



require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);



require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);



require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);



require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);



require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);



require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkRecentExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем все расходы, отсортированные по дате создания
        const expenses = await client.query(
            `SELECT id, date, subcategory, amount, category_id, 
                    (SELECT name FROM taiga.cat_expense WHERE id = category_id) as category_name,
                    created_at
             FROM taiga.expenses 
             ORDER BY created_at DESC, id DESC
             LIMIT 50`
        );
        
        console.log('=== Последние 50 расходов (по дате создания) ===\n');
        
        let total = 0;
        expenses.rows.forEach((exp, index) => {
            const amount = parseFloat(exp.amount || 0);
            total += amount;
            console.log(`${index + 1}. ID ${exp.id} | ${exp.date} | ${exp.category_name} | "${exp.subcategory}" | ${amount.toLocaleString('ru-RU')} руб`);
        });
        
        console.log(`\nИтого последних 50: ${total.toLocaleString('ru-RU')} руб`);
        
        // Проверяем расходы за последние дни
        console.log('\n=== Расходы по датам (последние 7 дней) ===\n');
        
        const recentByDate = await client.query(
            `SELECT date, 
                    COUNT(*) as count,
                    SUM(amount) as total
             FROM taiga.expenses 
             WHERE date >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY date
             ORDER BY date DESC`
        );
        
        recentByDate.rows.forEach(row => {
            console.log(`${row.date}: ${row.count} расходов, сумма: ${parseFloat(row.total || 0).toLocaleString('ru-RU')} руб`);
        });
        
        // Проверяем возможные дубликаты по сумме и названию
        console.log('\n=== Поиск возможных дубликатов по сумме и названию ===\n');
        
        const possibleDuplicates = await client.query(
            `SELECT subcategory, amount, COUNT(*) as count, 
                    STRING_AGG(id::text, ', ' ORDER BY id) as ids,
                    STRING_AGG(date::text, ', ' ORDER BY id) as dates
             FROM taiga.expenses
             GROUP BY subcategory, amount
             HAVING COUNT(*) > 1
             ORDER BY count DESC, amount DESC`
        );
        
        if (possibleDuplicates.rows.length > 0) {
            possibleDuplicates.rows.forEach(row => {
                console.log(`⚠️  "${row.subcategory}" - ${row.amount} руб (${row.count} раз)`);
                console.log(`   ID: ${row.ids}, Даты: ${row.dates}\n`);
            });
        } else {
            console.log('✅ Дубликатов по сумме и названию не найдено');
        }
        
        // Итоговая касса
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('\n=== Текущее состояние ===');
        console.log(`Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`Касса: ${calculatedCash.toLocaleString('ru-RU')} руб`);
        console.log(`Ожидается: 45 205 руб`);
        console.log(`Разница: ${(calculatedCash - 45205).toLocaleString('ru-RU')} руб`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentExpenses().catch(console.error);
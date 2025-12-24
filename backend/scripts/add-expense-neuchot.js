// Добавление расхода: Накладные | Неучёл (8051 руб)
// Компенсация потерянных расходов из Тинькофф
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('=== ДОБАВЛЕНИЕ РАСХОДА: Накладные | Неучёл ===\n');
        
        const amount = 8051;
        const today = new Date().toISOString().split('T')[0];
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        
        // Получаем проект "Гостевой 5х8"
        const projectResult = await client.query(
            "SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1"
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        
        // Получаем категорию "Накладные"
        const catResult = await client.query(
            "SELECT id FROM taiga.cat_expense WHERE name = 'Накладные' LIMIT 1"
        );
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Накладные" не найдена');
        }
        const categoryId = catResult.rows[0].id;
        
        // Получаем единицу "шт"
        const unitResult = await client.query(
            "SELECT id FROM taiga.cat_units WHERE short_name = 'шт' LIMIT 1"
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        
        // Добавляем расход
        const result = await client.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, quantity, price, amount, section, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, amount, date`,
            [
                projectId,
                today,
                month,
                year,
                categoryId,
                'Неучёл',
                unitId,
                1,
                amount,
                amount,
                'Феруз',
                'Компенсация потерянных расходов из Тинькофф (8 051,25 руб). Расходы восстановить невозможно.'
            ]
        );
        
        const expense = result.rows[0];
        
        console.log(`✅ Добавлен расход:`);
        console.log(`   ID: ${expense.id}`);
        console.log(`   Дата: ${expense.date}`);
        console.log(`   Категория: Накладные`);
        console.log(`   Подкатегория: Неучёл`);
        console.log(`   Сумма: ${amount.toLocaleString('ru-RU')} ₽`);
        console.log(`   Проект: Гостевой 5х8\n`);
        
        // Проверяем итоговую кассу
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('Текущее состояние кассы:');
        console.log(`  Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Касса: ${calculatedCash.toLocaleString('ru-RU')} руб\n`);
        
        await client.query('COMMIT');
        console.log('✅ Расход успешно добавлен!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка при добавлении расхода:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();

// Компенсация потерянных расходов из Тинькофф
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('=== ДОБАВЛЕНИЕ РАСХОДА: Накладные | Неучёл ===\n');
        
        const amount = 8051;
        const today = new Date().toISOString().split('T')[0];
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        
        // Получаем проект "Гостевой 5х8"
        const projectResult = await client.query(
            "SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1"
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        
        // Получаем категорию "Накладные"
        const catResult = await client.query(
            "SELECT id FROM taiga.cat_expense WHERE name = 'Накладные' LIMIT 1"
        );
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Накладные" не найдена');
        }
        const categoryId = catResult.rows[0].id;
        
        // Получаем единицу "шт"
        const unitResult = await client.query(
            "SELECT id FROM taiga.cat_units WHERE short_name = 'шт' LIMIT 1"
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        
        // Добавляем расход
        const result = await client.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, quantity, price, amount, section, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, amount, date`,
            [
                projectId,
                today,
                month,
                year,
                categoryId,
                'Неучёл',
                unitId,
                1,
                amount,
                amount,
                'Феруз',
                'Компенсация потерянных расходов из Тинькофф (8 051,25 руб). Расходы восстановить невозможно.'
            ]
        );
        
        const expense = result.rows[0];
        
        console.log(`✅ Добавлен расход:`);
        console.log(`   ID: ${expense.id}`);
        console.log(`   Дата: ${expense.date}`);
        console.log(`   Категория: Накладные`);
        console.log(`   Подкатегория: Неучёл`);
        console.log(`   Сумма: ${amount.toLocaleString('ru-RU')} ₽`);
        console.log(`   Проект: Гостевой 5х8\n`);
        
        // Проверяем итоговую кассу
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('Текущее состояние кассы:');
        console.log(`  Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Касса: ${calculatedCash.toLocaleString('ru-RU')} руб\n`);
        
        await client.query('COMMIT');
        console.log('✅ Расход успешно добавлен!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка при добавлении расхода:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();

// Компенсация потерянных расходов из Тинькофф
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('=== ДОБАВЛЕНИЕ РАСХОДА: Накладные | Неучёл ===\n');
        
        const amount = 8051;
        const today = new Date().toISOString().split('T')[0];
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        
        // Получаем проект "Гостевой 5х8"
        const projectResult = await client.query(
            "SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1"
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        
        // Получаем категорию "Накладные"
        const catResult = await client.query(
            "SELECT id FROM taiga.cat_expense WHERE name = 'Накладные' LIMIT 1"
        );
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Накладные" не найдена');
        }
        const categoryId = catResult.rows[0].id;
        
        // Получаем единицу "шт"
        const unitResult = await client.query(
            "SELECT id FROM taiga.cat_units WHERE short_name = 'шт' LIMIT 1"
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        
        // Добавляем расход
        const result = await client.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, quantity, price, amount, section, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, amount, date`,
            [
                projectId,
                today,
                month,
                year,
                categoryId,
                'Неучёл',
                unitId,
                1,
                amount,
                amount,
                'Феруз',
                'Компенсация потерянных расходов из Тинькофф (8 051,25 руб). Расходы восстановить невозможно.'
            ]
        );
        
        const expense = result.rows[0];
        
        console.log(`✅ Добавлен расход:`);
        console.log(`   ID: ${expense.id}`);
        console.log(`   Дата: ${expense.date}`);
        console.log(`   Категория: Накладные`);
        console.log(`   Подкатегория: Неучёл`);
        console.log(`   Сумма: ${amount.toLocaleString('ru-RU')} ₽`);
        console.log(`   Проект: Гостевой 5х8\n`);
        
        // Проверяем итоговую кассу
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('Текущее состояние кассы:');
        console.log(`  Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Касса: ${calculatedCash.toLocaleString('ru-RU')} руб\n`);
        
        await client.query('COMMIT');
        console.log('✅ Расход успешно добавлен!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка при добавлении расхода:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();

// Компенсация потерянных расходов из Тинькофф
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('=== ДОБАВЛЕНИЕ РАСХОДА: Накладные | Неучёл ===\n');
        
        const amount = 8051;
        const today = new Date().toISOString().split('T')[0];
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        
        // Получаем проект "Гостевой 5х8"
        const projectResult = await client.query(
            "SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1"
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        
        // Получаем категорию "Накладные"
        const catResult = await client.query(
            "SELECT id FROM taiga.cat_expense WHERE name = 'Накладные' LIMIT 1"
        );
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Накладные" не найдена');
        }
        const categoryId = catResult.rows[0].id;
        
        // Получаем единицу "шт"
        const unitResult = await client.query(
            "SELECT id FROM taiga.cat_units WHERE short_name = 'шт' LIMIT 1"
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        
        // Добавляем расход
        const result = await client.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, quantity, price, amount, section, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, amount, date`,
            [
                projectId,
                today,
                month,
                year,
                categoryId,
                'Неучёл',
                unitId,
                1,
                amount,
                amount,
                'Феруз',
                'Компенсация потерянных расходов из Тинькофф (8 051,25 руб). Расходы восстановить невозможно.'
            ]
        );
        
        const expense = result.rows[0];
        
        console.log(`✅ Добавлен расход:`);
        console.log(`   ID: ${expense.id}`);
        console.log(`   Дата: ${expense.date}`);
        console.log(`   Категория: Накладные`);
        console.log(`   Подкатегория: Неучёл`);
        console.log(`   Сумма: ${amount.toLocaleString('ru-RU')} ₽`);
        console.log(`   Проект: Гостевой 5х8\n`);
        
        // Проверяем итоговую кассу
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('Текущее состояние кассы:');
        console.log(`  Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Касса: ${calculatedCash.toLocaleString('ru-RU')} руб\n`);
        
        await client.query('COMMIT');
        console.log('✅ Расход успешно добавлен!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка при добавлении расхода:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();

// Компенсация потерянных расходов из Тинькофф
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('=== ДОБАВЛЕНИЕ РАСХОДА: Накладные | Неучёл ===\n');
        
        const amount = 8051;
        const today = new Date().toISOString().split('T')[0];
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        
        // Получаем проект "Гостевой 5х8"
        const projectResult = await client.query(
            "SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1"
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        
        // Получаем категорию "Накладные"
        const catResult = await client.query(
            "SELECT id FROM taiga.cat_expense WHERE name = 'Накладные' LIMIT 1"
        );
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Накладные" не найдена');
        }
        const categoryId = catResult.rows[0].id;
        
        // Получаем единицу "шт"
        const unitResult = await client.query(
            "SELECT id FROM taiga.cat_units WHERE short_name = 'шт' LIMIT 1"
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        
        // Добавляем расход
        const result = await client.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, quantity, price, amount, section, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, amount, date`,
            [
                projectId,
                today,
                month,
                year,
                categoryId,
                'Неучёл',
                unitId,
                1,
                amount,
                amount,
                'Феруз',
                'Компенсация потерянных расходов из Тинькофф (8 051,25 руб). Расходы восстановить невозможно.'
            ]
        );
        
        const expense = result.rows[0];
        
        console.log(`✅ Добавлен расход:`);
        console.log(`   ID: ${expense.id}`);
        console.log(`   Дата: ${expense.date}`);
        console.log(`   Категория: Накладные`);
        console.log(`   Подкатегория: Неучёл`);
        console.log(`   Сумма: ${amount.toLocaleString('ru-RU')} ₽`);
        console.log(`   Проект: Гостевой 5х8\n`);
        
        // Проверяем итоговую кассу
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('Текущее состояние кассы:');
        console.log(`  Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Касса: ${calculatedCash.toLocaleString('ru-RU')} руб\n`);
        
        await client.query('COMMIT');
        console.log('✅ Расход успешно добавлен!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка при добавлении расхода:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();

// Компенсация потерянных расходов из Тинькофф
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('=== ДОБАВЛЕНИЕ РАСХОДА: Накладные | Неучёл ===\n');
        
        const amount = 8051;
        const today = new Date().toISOString().split('T')[0];
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        
        // Получаем проект "Гостевой 5х8"
        const projectResult = await client.query(
            "SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8' LIMIT 1"
        );
        
        if (projectResult.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" не найден');
        }
        const projectId = projectResult.rows[0].id;
        
        // Получаем категорию "Накладные"
        const catResult = await client.query(
            "SELECT id FROM taiga.cat_expense WHERE name = 'Накладные' LIMIT 1"
        );
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Накладные" не найдена');
        }
        const categoryId = catResult.rows[0].id;
        
        // Получаем единицу "шт"
        const unitResult = await client.query(
            "SELECT id FROM taiga.cat_units WHERE short_name = 'шт' LIMIT 1"
        );
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица "шт" не найдена');
        }
        const unitId = unitResult.rows[0].id;
        
        // Добавляем расход
        const result = await client.query(
            `INSERT INTO taiga.expenses 
             (project_id, date, month, year, category_id, subcategory, unit_id, quantity, price, amount, section, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, amount, date`,
            [
                projectId,
                today,
                month,
                year,
                categoryId,
                'Неучёл',
                unitId,
                1,
                amount,
                amount,
                'Феруз',
                'Компенсация потерянных расходов из Тинькофф (8 051,25 руб). Расходы восстановить невозможно.'
            ]
        );
        
        const expense = result.rows[0];
        
        console.log(`✅ Добавлен расход:`);
        console.log(`   ID: ${expense.id}`);
        console.log(`   Дата: ${expense.date}`);
        console.log(`   Категория: Накладные`);
        console.log(`   Подкатегория: Неучёл`);
        console.log(`   Сумма: ${amount.toLocaleString('ru-RU')} ₽`);
        console.log(`   Проект: Гостевой 5х8\n`);
        
        // Проверяем итоговую кассу
        const totalExpenses = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.expenses'
        );
        const totalIncome = await client.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM taiga.income'
        );
        
        const expensesTotal = parseFloat(totalExpenses.rows[0].total || 0);
        const incomeTotal = parseFloat(totalIncome.rows[0].total || 0);
        const calculatedCash = incomeTotal - expensesTotal;
        
        console.log('Текущее состояние кассы:');
        console.log(`  Доходы: ${incomeTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Расходы: ${expensesTotal.toLocaleString('ru-RU')} руб`);
        console.log(`  Касса: ${calculatedCash.toLocaleString('ru-RU')} руб\n`);
        
        await client.query('COMMIT');
        console.log('✅ Расход успешно добавлен!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка при добавлении расхода:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();


















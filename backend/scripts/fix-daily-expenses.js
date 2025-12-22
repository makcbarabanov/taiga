const pool = require('../db');

async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();




async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();

async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();




async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();

async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();




async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();

async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();




async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();

async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();




async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();

async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();




async function fixDailyExpenses() {
    try {
        console.log('Исправляю daily_expenses для всех записей кассы...\n');
        
        // Получаем все записи кассы
        const cashRes = await pool.query(`
            SELECT date, calculated_amount, daily_expenses
            FROM taiga.cash 
            ORDER BY date
        `);
        
        // Для каждой записи пересчитываем daily_expenses
        for (const record of cashRes.rows) {
            // Используем дату напрямую из БД (уже в формате DATE)
            const dateValue = record.date instanceof Date ? record.date : new Date(record.date);
            
            // Получаем сумму расходов за этот день
            const expensesRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM taiga.expenses 
                WHERE date = $1
            `, [dateValue]);
            
            const dailyExpenses = parseFloat(expensesRes.rows[0].total) || 0;
            
            // Обновляем daily_expenses
            await pool.query(`
                UPDATE taiga.cash
                SET daily_expenses = $1
                WHERE date = $2
            `, [dailyExpenses, dateValue]);
            
            const dateStr = dateValue instanceof Date ? dateValue.toISOString().split('T')[0] : dateValue;
            console.log(`✓ ${dateStr}: daily_expenses = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
        }
        
        console.log('\n✅ daily_expenses исправлены!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixDailyExpenses();

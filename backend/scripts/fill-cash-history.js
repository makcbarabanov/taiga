const pool = require('../db');

async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();




async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();

async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();




async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();

async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();




async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();

async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();




async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();

async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();




async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();

async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();




async function fillCashHistory() {
    try {
        console.log('Начинаю заполнение истории кассы...\n');
        
        // Получаем все доходы с датами
        const incomeRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.income 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Получаем все расходы с датами
        const expensesRes = await pool.query(`
            SELECT date, SUM(amount) as total
            FROM taiga.expenses 
            GROUP BY date 
            ORDER BY date
        `);
        
        // Создаём мапу доходов и расходов по датам
        // В БД даты хранятся как DATE, поэтому используем их напрямую
        const incomeByDate = {};
        incomeRes.rows.forEach(row => {
            // date уже в формате YYYY-MM-DD из PostgreSQL
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            incomeByDate[date] = parseFloat(row.total);
        });
        
        const expensesByDate = {};
        expensesRes.rows.forEach(row => {
            const date = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            expensesByDate[date] = parseFloat(row.total);
        });
        
        // Находим первую и последнюю дату
        const allDates = new Set();
        Object.keys(incomeByDate).forEach(d => allDates.add(d));
        Object.keys(expensesByDate).forEach(d => allDates.add(d));
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            console.log('Нет данных для заполнения истории');
            await pool.end();
            return;
        }
        
        // Начальная дата - 30.11.2025 (в БД это 2025-11-29 из-за часового пояса)
        const startDate = '2025-11-29'; // 30.11.2025 по московскому времени
        const endDate = sortedDates[sortedDates.length - 1];
        
        console.log(`Период: с ${startDate} по ${endDate}\n`);
        
        // Начальный баланс на 30.11.2025 = 0
        let currentCash = 0;
        
        // Создаём записи для каждого дня
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Получаем доходы и расходы за этот день
            const dailyIncome = incomeByDate[dateStr] || 0;
            const dailyExpenses = expensesByDate[dateStr] || 0;
            
            // Сначала добавляем доходы за этот день
            if (dailyIncome > 0) {
                currentCash += dailyIncome;
            }
            
            // Затем вычитаем расходы за этот день
            if (dailyExpenses > 0) {
                currentCash -= dailyExpenses;
            }
            
            // Проверяем, существует ли уже запись
            const existing = await pool.query(
                'SELECT id FROM taiga.cash WHERE date = $1',
                [dateStr]
            );
            
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                await pool.query(`
                    UPDATE taiga.cash
                    SET calculated_amount = $1,
                        actual_amount = $1,
                        difference = 0,
                        daily_expenses = $2,
                        updated_at = NOW()
                    WHERE date = $3
                `, [currentCash, dailyExpenses, dateStr]);
                console.log(`✓ Обновлена запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            } else {
                // Создаём новую запись
                await pool.query(`
                    INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference, daily_expenses)
                    VALUES ($1, $2, $2, 0, $3)
                `, [dateStr, currentCash, dailyExpenses]);
                console.log(`✓ Создана запись за ${dateStr}: Касса = ${currentCash.toLocaleString('ru-RU')}₽, Доход = ${dailyIncome.toLocaleString('ru-RU')}₽, Расход = ${dailyExpenses.toLocaleString('ru-RU')}₽`);
            }
        }
        
        console.log('\n✅ История кассы заполнена!');
        await pool.end();
    } catch (error) {
        console.error('Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fillCashHistory();

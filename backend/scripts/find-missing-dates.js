// Скрипт для поиска дат с расходами, но без записей в кассе
// Помогает найти потенциально удалённые расходы

const pool = require('../db');

async function findMissingDates() {
    try {
        console.log('🔍 Ищу даты с расходами, но без записей в кассе...\n');

        // Получаем все уникальные даты из расходов
        const expenseDates = await pool.query(`
            SELECT DISTINCT date, SUM(amount) as total
            FROM taiga.expenses
            GROUP BY date
            ORDER BY date DESC
        `);

        // Получаем все даты из кассы с daily_expenses
        const cashDates = await pool.query(`
            SELECT DISTINCT date, daily_expenses
            FROM taiga.cash
            WHERE daily_expenses IS NOT NULL
            ORDER BY date DESC
        `);

        const cashDatesSet = new Set(cashDates.rows.map(r => r.date.toISOString().split('T')[0]));

        console.log(`📊 Найдено ${expenseDates.rows.length} дат с расходами`);
        console.log(`📊 Найдено ${cashDates.rows.length} дат с записями в кассе\n`);

        const missingDates = [];
        const datesWithExpenses = [];

        for (const expDate of expenseDates.rows) {
            const dateStr = expDate.date.toISOString().split('T')[0];
            const total = parseFloat(expDate.total) || 0;

            if (!cashDatesSet.has(dateStr)) {
                missingDates.push({
                    date: dateStr,
                    total: total
                });
            } else {
                datesWithExpenses.push({
                    date: dateStr,
                    total: total
                });
            }
        }

        if (missingDates.length > 0) {
            console.log(`⚠️  Найдено ${missingDates.length} дат с расходами, но БЕЗ записей в кассе:\n`);
            console.log('='.repeat(80));
            console.log('Дата'.padEnd(12) + ' | ' + 'Сумма расходов');
            console.log('='.repeat(80));

            for (const missing of missingDates) {
                console.log(missing.date.padEnd(12) + ' | ' + 
                    missing.total.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}));

                // Показываем расходы за эту дату
                const expensesRes = await pool.query(`
                    SELECT id, amount, category_id, subcategory, comment
                    FROM taiga.expenses 
                    WHERE date = $1
                    ORDER BY id
                `, [missing.date]);

                if (expensesRes.rows.length > 0) {
                    console.log(`   Расходы за эту дату (${expensesRes.rows.length} записей):`);
                    expensesRes.rows.forEach(exp => {
                        console.log(`      ID ${exp.id}: ${exp.amount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})} - ${exp.subcategory || exp.comment || 'без описания'}`);
                    });
                }
                console.log('');
            }
        } else {
            console.log('✅ Все даты с расходами имеют записи в кассе');
        }

        // Проверяем даты в кассе, которых нет в расходах
        const expenseDatesSet = new Set(expenseDates.rows.map(r => r.date.toISOString().split('T')[0]));
        const cashWithoutExpenses = [];

        for (const cashDate of cashDates.rows) {
            const dateStr = cashDate.date.toISOString().split('T')[0];
            if (!expenseDatesSet.has(dateStr) && cashDate.daily_expenses > 0) {
                cashWithoutExpenses.push({
                    date: dateStr,
                    daily_expenses: cashDate.daily_expenses
                });
            }
        }

        if (cashWithoutExpenses.length > 0) {
            console.log(`\n⚠️  Найдено ${cashWithoutExpenses.length} дат в кассе с daily_expenses > 0, но БЕЗ расходов:\n`);
            console.log('='.repeat(80));
            console.log('Дата'.padEnd(12) + ' | ' + 'daily_expenses (возможно, расходы были удалены)');
            console.log('='.repeat(80));

            for (const cash of cashWithoutExpenses) {
                console.log(cash.date.padEnd(12) + ' | ' + 
                    cash.daily_expenses.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
            }
            console.log('\n💡 ЭТИ ДАТЫ - КЛЮЧЕВЫЕ! Здесь были расходы, которые были зафиксированы в кассе, но потом удалены.');
            console.log('   daily_expenses показывает, сколько было потрачено в этот день до удаления.');
        } else {
            console.log('\n✅ Все даты в кассе с daily_expenses имеют соответствующие расходы');
        }

        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

findMissingDates();


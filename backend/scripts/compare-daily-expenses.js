// Скрипт для сравнения daily_expenses из кассы с расчётными расходами за день
// Помогает найти расхождения и потенциально удалённые расходы

const pool = require('../db');

async function compareDailyExpenses() {
    try {
        console.log('🔍 Сравниваю daily_expenses из кассы с расчётными расходами за день...\n');

        // Получаем все записи кассы с daily_expenses
        const cashRecords = await pool.query(`
            SELECT 
                date, 
                daily_expenses,
                calculated_amount,
                actual_amount
            FROM taiga.cash 
            WHERE daily_expenses IS NOT NULL AND daily_expenses > 0
            ORDER BY date DESC
        `);

        if (cashRecords.rows.length === 0) {
            console.log('⚠️  Нет записей кассы с daily_expenses');
            await pool.end();
            return;
        }

        console.log(`📊 Найдено ${cashRecords.rows.length} записей кассы с daily_expenses\n`);
        console.log('='.repeat(120));
        console.log('Дата'.padEnd(12) + ' | ' + 
                    'daily_expenses (касса)'.padEnd(22) + ' | ' + 
                    'Расчётный расход'.padEnd(20) + ' | ' + 
                    'Разница'.padEnd(15) + ' | ' + 
                    'Статус');
        console.log('='.repeat(120));

        let totalDiscrepancies = 0;
        let totalMatches = 0;
        const discrepancies = [];

        for (const record of cashRecords.rows) {
            const date = record.date instanceof Date ? record.date : new Date(record.date);
            const dateStr = date.toISOString().split('T')[0];
            const fixedExpenses = parseFloat(record.daily_expenses) || 0;

            // Рассчитываем расходы за этот день из таблицы expenses
            const calculatedRes = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as total,
                       COUNT(*) as count
                FROM taiga.expenses 
                WHERE date = $1
            `, [date]);

            const calculatedExpenses = parseFloat(calculatedRes.rows[0].total) || 0;
            const expenseCount = parseInt(calculatedRes.rows[0].count) || 0;
            const difference = fixedExpenses - calculatedExpenses;

            // Определяем статус
            let status = '';
            let statusIcon = '';
            if (Math.abs(difference) < 0.01) {
                status = '✅ Совпадает';
                statusIcon = '✅';
                totalMatches++;
            } else if (difference > 0) {
                status = `⚠️  В кассе больше на ${difference.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                statusIcon = '⚠️';
                totalDiscrepancies++;
                discrepancies.push({
                    date: dateStr,
                    fixed: fixedExpenses,
                    calculated: calculatedExpenses,
                    difference: difference,
                    expenseCount: expenseCount
                });
            } else {
                status = `❌ В кассе меньше на ${Math.abs(difference).toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                statusIcon = '❌';
                totalDiscrepancies++;
                discrepancies.push({
                    date: dateStr,
                    fixed: fixedExpenses,
                    calculated: calculatedExpenses,
                    difference: difference,
                    expenseCount: expenseCount
                });
            }

            console.log(
                dateStr.padEnd(12) + ' | ' +
                fixedExpenses.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}).padEnd(22) + ' | ' +
                calculatedExpenses.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}).padEnd(20) + ' | ' +
                difference.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}).padEnd(15) + ' | ' +
                status
            );
        }

        console.log('='.repeat(120));
        console.log(`\n📊 Итого:`);
        console.log(`   ✅ Совпадений: ${totalMatches}`);
        console.log(`   ⚠️  Расхождений: ${totalDiscrepancies}`);

        if (discrepancies.length > 0) {
            console.log(`\n⚠️  НАЙДЕНЫ РАСХОЖДЕНИЯ:\n`);
            
            // Группируем по типу расхождения
            const missingExpenses = discrepancies.filter(d => d.difference > 0);
            const extraExpenses = discrepancies.filter(d => d.difference < 0);

            if (missingExpenses.length > 0) {
                console.log(`📉 В кассе больше, чем в расходах (возможно, расходы были удалены):`);
                missingExpenses.forEach(d => {
                    console.log(`   ${d.date}: ${d.difference.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (было: ${d.fixed.toLocaleString('ru-RU')}, сейчас: ${d.calculated.toLocaleString('ru-RU')}, записей: ${d.expenseCount})`);
                });
            }

            if (extraExpenses.length > 0) {
                console.log(`\n📈 В кассе меньше, чем в расходах (возможно, расходы были добавлены позже):`);
                extraExpenses.forEach(d => {
                    console.log(`   ${d.date}: ${Math.abs(d.difference).toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (было: ${d.fixed.toLocaleString('ru-RU')}, сейчас: ${d.calculated.toLocaleString('ru-RU')}, записей: ${d.expenseCount})`);
                });
            }

            // Показываем детали по датам с расхождениями
            console.log(`\n📋 Детали по датам с расхождениями:\n`);
            for (const disc of discrepancies) {
                console.log(`\n📅 ${disc.date}:`);
                console.log(`   Зафиксировано в кассе: ${disc.fixed.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                console.log(`   Расчётный расход: ${disc.calculated.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                console.log(`   Разница: ${disc.difference.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                console.log(`   Количество записей расходов сейчас: ${disc.expenseCount}`);

                // Показываем расходы за эту дату
                const expensesRes = await pool.query(`
                    SELECT id, amount, category_id, subcategory, comment
                    FROM taiga.expenses 
                    WHERE date = $1
                    ORDER BY id
                `, [disc.date]);

                if (expensesRes.rows.length > 0) {
                    console.log(`   Текущие расходы за эту дату:`);
                    expensesRes.rows.forEach(exp => {
                        console.log(`      ID ${exp.id}: ${exp.amount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})} - ${exp.subcategory || exp.comment || 'без описания'}`);
                    });
                } else {
                    console.log(`   ⚠️  Нет расходов за эту дату в таблице expenses!`);
                }
            }
        }

        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

compareDailyExpenses();













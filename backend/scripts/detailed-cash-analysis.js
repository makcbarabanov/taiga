// Детальный анализ кассы и расходов
// Показывает все даты в кассе и сравнивает с расходами

const pool = require('../db');

async function detailedAnalysis() {
    try {
        console.log('🔍 Детальный анализ кассы и расходов...\n');

        // Все записи кассы
        const allCash = await pool.query(`
            SELECT date, daily_expenses, calculated_amount, actual_amount
            FROM taiga.cash
            ORDER BY date DESC
        `);

        // Все уникальные даты из расходов с суммой
        const allExpenses = await pool.query(`
            SELECT date, SUM(amount) as total, COUNT(*) as count
            FROM taiga.expenses
            GROUP BY date
            ORDER BY date DESC
        `);

        console.log(`📊 Всего записей в кассе: ${allCash.rows.length}`);
        console.log(`📊 Всего дат с расходами: ${allExpenses.rows.length}\n`);

        // Создаём мапу расходов по датам
        const expensesMap = new Map();
        allExpenses.rows.forEach(exp => {
            const dateStr = exp.date.toISOString().split('T')[0];
            expensesMap.set(dateStr, {
                total: parseFloat(exp.total) || 0,
                count: parseInt(exp.count) || 0
            });
        });

        console.log('='.repeat(120));
        console.log('Дата'.padEnd(12) + ' | ' + 
                    'daily_expenses'.padEnd(18) + ' | ' + 
                    'Расходы (сумма)'.padEnd(18) + ' | ' + 
                    'Кол-во расходов'.padEnd(16) + ' | ' + 
                    'Разница'.padEnd(15) + ' | ' + 
                    'Статус');
        console.log('='.repeat(120));

        let withExpenses = 0;
        let withoutExpenses = 0;
        let discrepancies = [];

        for (const cash of allCash.rows) {
            const dateStr = cash.date.toISOString().split('T')[0];
            const dailyExp = parseFloat(cash.daily_expenses) || 0;
            const expData = expensesMap.get(dateStr);

            let status = '';
            let difference = 0;

            if (!expData) {
                // Нет расходов за эту дату
                status = '❌ НЕТ РАСХОДОВ';
                difference = dailyExp;
                withoutExpenses++;
                discrepancies.push({
                    date: dateStr,
                    daily_expenses: dailyExp,
                    calculated: 0,
                    difference: dailyExp,
                    count: 0
                });
            } else {
                // Есть расходы
                difference = dailyExp - expData.total;
                if (Math.abs(difference) < 0.01) {
                    status = '✅ Совпадает';
                    withExpenses++;
                } else {
                    status = `⚠️  Расхождение: ${difference.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    withExpenses++;
                    discrepancies.push({
                        date: dateStr,
                        daily_expenses: dailyExp,
                        calculated: expData.total,
                        difference: difference,
                        count: expData.count
                    });
                }
            }

            console.log(
                dateStr.padEnd(12) + ' | ' +
                (dailyExp > 0 ? dailyExp.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-').padEnd(18) + ' | ' +
                (expData ? expData.total.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-').padEnd(18) + ' | ' +
                (expData ? expData.count.toString() : '0').padEnd(16) + ' | ' +
                difference.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}).padEnd(15) + ' | ' +
                status
            );
        }

        console.log('='.repeat(120));
        console.log(`\n📊 Итого:`);
        console.log(`   ✅ Дат с расходами: ${withExpenses}`);
        console.log(`   ❌ Дат БЕЗ расходов (но с daily_expenses): ${withoutExpenses}`);
        console.log(`   ⚠️  Расхождений: ${discrepancies.length}`);

        if (discrepancies.length > 0) {
            console.log(`\n⚠️  ДЕТАЛИ РАСХОЖДЕНИЙ:\n`);

            for (const disc of discrepancies) {
                console.log(`\n📅 ${disc.date}:`);
                console.log(`   daily_expenses (зафиксировано в кассе): ${disc.daily_expenses.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                console.log(`   Расчётный расход (из таблицы expenses): ${disc.calculated.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                console.log(`   Разница: ${disc.difference.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                console.log(`   Количество записей расходов: ${disc.count}`);

                if (disc.difference > 0 && disc.count === 0) {
                    console.log(`   ⚠️  ВНИМАНИЕ: В кассе зафиксирован расход ${disc.daily_expenses.toLocaleString('ru-RU')}, но в таблице expenses НЕТ записей за эту дату!`);
                    console.log(`   💡 Это означает, что расходы были удалены ПОСЛЕ того, как были зафиксированы в кассе.`);
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

detailedAnalysis();













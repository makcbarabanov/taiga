// Детальный анализ удалённых расходов
// Помогает понять, какие расходы были удалены и когда

const pool = require('../db');

async function analyzeDeletedExpenses() {
    try {
        console.log('🔍 Детальный анализ удалённых расходов...\n');

        // 1. Находим пропуски в ID
        const gapsResult = await pool.query(`
            WITH numbered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
                FROM taiga.expenses
            ),
            gaps AS (
                SELECT 
                    n1.id as current_id,
                    n2.id as next_id,
                    n2.id - n1.id as gap
                FROM numbered n1
                JOIN numbered n2 ON n2.rn = n1.rn + 1
                WHERE n2.id - n1.id > 1
            )
            SELECT * FROM gaps ORDER BY gap DESC
        `);

        console.log('📊 Пропуски в ID (отсортированы по размеру):');
        let totalDeleted = 0;
        const gapRanges = [];

        gapsResult.rows.forEach(row => {
            const deletedCount = row.gap - 1;
            totalDeleted += deletedCount;
            const startId = row.current_id + 1;
            const endId = row.next_id - 1;
            gapRanges.push({ start: startId, end: endId, count: deletedCount });
            console.log(`   Пропуск между ID ${row.current_id} и ${row.next_id}: удалено ~${deletedCount} записей (ID ${startId}-${endId})`);
        });

        console.log(`\n⚠️  Примерно удалено записей: ${totalDeleted}`);

        // 2. Анализируем даты существующих расходов вокруг пропусков
        console.log('\n📅 Анализ дат расходов вокруг пропусков:\n');

        for (const gap of gapRanges) {
            // Находим расходы до и после пропуска
            const beforeGap = await pool.query(`
                SELECT id, date, amount, category_id, subcategory, comment
                FROM taiga.expenses
                WHERE id = $1
            `, [gap.start - 1]);

            const afterGap = await pool.query(`
                SELECT id, date, amount, category_id, subcategory, comment
                FROM taiga.expenses
                WHERE id = $1
            `, [gap.end + 1]);

            console.log(`Пропуск ID ${gap.start}-${gap.end} (${gap.count} записей):`);
            if (beforeGap.rows.length > 0) {
                const before = beforeGap.rows[0];
                console.log(`   До пропуска: ID ${before.id}, дата ${before.date}, сумма ${before.amount.toLocaleString('ru-RU')}, ${before.subcategory || before.comment || 'без описания'}`);
            }
            if (afterGap.rows.length > 0) {
                const after = afterGap.rows[0];
                console.log(`   После пропуска: ID ${after.id}, дата ${after.date}, сумма ${after.amount.toLocaleString('ru-RU')}, ${after.subcategory || after.comment || 'без описания'}`);
            }

            // Пытаемся определить диапазон дат для удалённых расходов
            if (beforeGap.rows.length > 0 && afterGap.rows.length > 0) {
                const beforeDate = new Date(beforeGap.rows[0].date);
                const afterDate = new Date(afterGap.rows[0].date);
                console.log(`   💡 Удалённые расходы, вероятно, были между ${beforeDate.toISOString().split('T')[0]} и ${afterDate.toISOString().split('T')[0]}`);
            }
            console.log('');
        }

        // 3. Проверяем, есть ли записи в кассе за даты вокруг пропусков
        console.log('📊 Проверка записей в кассе за даты вокруг пропусков:\n');

        for (const gap of gapRanges.slice(0, 5)) { // Проверяем только первые 5 пропусков
            const beforeGap = await pool.query(`
                SELECT id, date FROM taiga.expenses WHERE id = $1
            `, [gap.start - 1]);

            const afterGap = await pool.query(`
                SELECT id, date FROM taiga.expenses WHERE id = $1
            `, [gap.end + 1]);

            if (beforeGap.rows.length > 0 && afterGap.rows.length > 0) {
                const beforeDate = beforeGap.rows[0].date;
                const afterDate = afterGap.rows[0].date;

                // Проверяем кассу за эти даты
                const cashBefore = await pool.query(`
                    SELECT date, daily_expenses FROM taiga.cash WHERE date = $1
                `, [beforeDate]);

                const cashAfter = await pool.query(`
                    SELECT date, daily_expenses FROM taiga.cash WHERE date = $1
                `, [afterDate]);

                console.log(`Пропуск ID ${gap.start}-${gap.end}:`);
                if (cashBefore.rows.length > 0) {
                    console.log(`   Касса за ${beforeDate}: daily_expenses = ${cashBefore.rows[0].daily_expenses || 0}`);
                } else {
                    console.log(`   Касса за ${beforeDate}: нет записи`);
                }
                if (cashAfter.rows.length > 0) {
                    console.log(`   Касса за ${afterDate}: daily_expenses = ${cashAfter.rows[0].daily_expenses || 0}`);
                } else {
                    console.log(`   Касса за ${afterDate}: нет записи`);
                }
                console.log('');
            }
        }

        // 4. Показываем статистику по категориям и датам существующих расходов
        console.log('📊 Статистика по существующим расходам:\n');
        
        // Проверяем правильное название таблицы категорий
        let categoryStats;
        try {
            categoryStats = await pool.query(`
                SELECT 
                    ec.name as category_name,
                    COUNT(*) as count,
                    SUM(e.amount) as total
                FROM taiga.expenses e
                JOIN taiga.expense_categories ec ON e.category_id = ec.id
                GROUP BY ec.name
                ORDER BY total DESC
            `);
        } catch (e) {
            // Если таблица expense_categories не существует, пробуем без JOIN
            categoryStats = await pool.query(`
                SELECT 
                    category_id,
                    COUNT(*) as count,
                    SUM(amount) as total
                FROM taiga.expenses
                GROUP BY category_id
                ORDER BY total DESC
            `);
        }

        console.log('По категориям:');
        categoryStats.rows.forEach(row => {
            console.log(`   ${row.category_name}: ${row.count} записей, ${parseFloat(row.total).toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        });

        const dateStats = await pool.query(`
            SELECT 
                date,
                COUNT(*) as count,
                SUM(amount) as total
            FROM taiga.expenses
            GROUP BY date
            ORDER BY date DESC
            LIMIT 10
        `);

        console.log('\nПо датам (последние 10):');
        dateStats.rows.forEach(row => {
            console.log(`   ${row.date}: ${row.count} записей, ${parseFloat(row.total).toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        });

        console.log('\n💡 Рекомендации:');
        console.log('   1. Используйте скрипт restore-expenses-interactive.js для восстановления расходов по памяти');
        console.log('   2. Дождитесь ответа от техподдержки Timeweb по логам PostgreSQL');
        console.log('   3. Проверьте, может быть есть экспорты или резервные копии в других местах');

        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

analyzeDeletedExpenses();


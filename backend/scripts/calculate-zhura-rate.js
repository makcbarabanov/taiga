// ===========================================
// Расчёт стоимости смены Журы
// ===========================================

const pool = require('../db');

async function calculateZhuraRate() {
    try {
        const projectId = 1; // Гостевой 5х8
        
        // 1. Находим все расходы ФОТ для Журы
        const expensesRes = await pool.query(`
            SELECT e.id, e.date, e.subcategory, e.amount, ec.name as category_name
            FROM taiga.expenses e
            INNER JOIN taiga.expense_categories ec ON e.category_id = ec.id
            WHERE e.project_id = $1
            AND ec.name = 'ФОТ'
            AND e.subcategory ILIKE '%Жура%'
            ORDER BY e.date
        `, [projectId]);
        
        console.log('Расходы ФОТ для Журы:');
        expensesRes.rows.forEach(exp => {
            console.log(`  ${exp.date.toISOString().split('T')[0]}: ${exp.subcategory} - ${exp.amount} ₽`);
        });
        
        const totalFotAmount = expensesRes.rows.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        console.log(`\nИтого расходов ФОТ: ${totalFotAmount} ₽`);
        
        // 2. Находим количество смен Журы (уникальные даты из журнала)
        const journalRes = await pool.query(`
            SELECT DISTINCT pj.date
            FROM taiga.project_journal pj
            INNER JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
            INNER JOIN taiga.employees e ON pjw.employee_id = e.id
            WHERE pj.project_id = $1
            AND (e.first_name ILIKE '%Жура%' OR e.last_name ILIKE '%Жура%')
            ORDER BY pj.date
        `, [projectId]);
        
        console.log('\nДаты работы Журы (смены):');
        journalRes.rows.forEach(row => {
            console.log(`  ${row.date.toISOString().split('T')[0]}`);
        });
        
        const shiftsCount = journalRes.rows.length;
        console.log(`\nКоличество смен: ${shiftsCount}`);
        
        // 3. Рассчитываем среднюю ставку
        const avgRate = shiftsCount > 0 ? totalFotAmount / shiftsCount : 0;
        console.log(`\nСредняя ставка за смену: ${Math.round(avgRate)} ₽`);
        console.log(`Точное значение: ${avgRate.toFixed(2)} ₽`);
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

calculateZhuraRate();


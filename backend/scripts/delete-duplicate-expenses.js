// Удаление дубликатов расходов (записи 6-10)
// Удаляем записи с ID: 114, 115, 116, 117, 118 (или найдём по критериям)

const pool = require('../db');

async function deleteDuplicates() {
    try {
        console.log('🗑️  Удаляю дубликаты расходов...\n');

        // Находим записи, которые относятся к "Общие расходы" (Компания Тайга)
        // или имеют категорию "Прибыль" вместо "Маржа"
        const duplicates = await pool.query(
            `SELECT e.id, e.date, e.amount, e.subcategory, e.comment,
                    c.name as client_name, p.name as project_name,
                    ec.name as category_name
             FROM taiga.expenses e
             JOIN taiga.projects p ON e.project_id = p.id
             JOIN taiga.clients c ON p.client_id = c.id
             JOIN taiga.expense_categories ec ON e.category_id = ec.id
             WHERE (c.name = 'Компания Тайга' AND p.name = 'Общие расходы')
                OR (ec.name = 'Прибыль' AND e.amount = 0)
             ORDER BY e.id`
        );

        if (duplicates.rows.length === 0) {
            console.log('✅ Дубликаты не найдены');
            return;
        }

        console.log(`Найдено ${duplicates.rows.length} записей для удаления:\n`);
        duplicates.rows.forEach(row => {
            console.log(`  ID: ${row.id} | ${row.date} | ${row.category_name} | ${row.subcategory} | ${row.amount}₽ | ${row.client_name} | ${row.project_name}`);
        });

        // Удаляем все найденные записи
        const ids = duplicates.rows.map(r => r.id);
        const result = await pool.query(
            `DELETE FROM taiga.expenses WHERE id = ANY($1::int[]) RETURNING id`,
            [ids]
        );

        console.log(`\n✅ Удалено ${result.rows.length} записей:`);
        result.rows.forEach(row => {
            console.log(`   - ID: ${row.id}`);
        });

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

deleteDuplicates();




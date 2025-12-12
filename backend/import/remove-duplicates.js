// ===========================================
// Скрипт для удаления дубликатов расходов
// ===========================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function removeDuplicates() {
    try {
        console.log('🔍 Поиск дубликатов...\n');

        // Находим дубликаты
        const duplicatesResult = await pool.query(`
            SELECT id, date, category_id, subcategory, amount, 
                   ROW_NUMBER() OVER (
                       PARTITION BY project_id, date, category_id, 
                                   COALESCE(subcategory, ''), amount 
                       ORDER BY id
                   ) as rn
            FROM taiga.expenses 
            WHERE project_id = 1
        `);

        const duplicates = duplicatesResult.rows.filter(row => row.rn > 1);
        console.log(`Найдено дубликатов: ${duplicates.length}`);

        if (duplicates.length === 0) {
            console.log('✅ Дубликатов не найдено!');
            await pool.end();
            return;
        }

        // Удаляем дубликаты (оставляем только первые записи)
        const idsToDelete = duplicates.map(row => row.id);
        
        const deleteResult = await pool.query(
            `DELETE FROM taiga.expenses WHERE id = ANY($1::int[])`,
            [idsToDelete]
        );

        console.log(`✅ Удалено дубликатов: ${deleteResult.rowCount}\n`);

        // Проверяем результат
        const checkResult = await pool.query(
            'SELECT SUM(amount) as total, COUNT(*) as count FROM taiga.expenses WHERE project_id = 1'
        );

        const total = parseFloat(checkResult.rows[0].total);
        const count = checkResult.rows[0].count;
        const expected = 616413;
        const diff = expected - total;

        console.log('📊 Результат:');
        console.log(`   В БД: сумма = ${total}, количество = ${count}`);
        console.log(`   Ожидается: ${expected}`);
        console.log(`   Разница: ${diff}`);

        if (Math.abs(diff) < 1) {
            console.log('\n✅ Сумма совпадает!');
        } else {
            console.log('\n⚠️  Сумма не совпадает. Нужно проверить недостающие расходы.');
        }

    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await pool.end();
    }
}

removeDuplicates();



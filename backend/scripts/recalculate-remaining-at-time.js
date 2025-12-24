const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

// Устанавливаем схему по умолчанию
pool.on('connect', async (client) => {
    await client.query(`SET search_path TO ${process.env.DB_SCHEMA || 'taiga'}, public`);
});

// Вспомогательная функция для вычисления remaining_at_time
async function calculateRemainingAtTime(client, workId, date, timeStart, excludeJournalId = null) {
    if (!workId) return null;
    
    // Получаем плановое количество работы
    let plannedQuantity = 0;
    
    try {
        const workResult = await client.query(
            'SELECT quantity FROM taiga.project_works WHERE id = $1',
            [workId]
        );
        
        if (workResult.rows.length > 0 && workResult.rows[0].quantity) {
            plannedQuantity = parseFloat(workResult.rows[0].quantity) || 0;
        } else {
            try {
                const feruzResult = await client.query(
                    'SELECT quantity FROM taiga.p_feruz WHERE id = $1',
                    [workId]
                );
                if (feruzResult.rows.length > 0 && feruzResult.rows[0].quantity) {
                    plannedQuantity = parseFloat(feruzResult.rows[0].quantity) || 0;
                }
            } catch (e2) {
                return null;
            }
        }
    } catch (e) {
        try {
            const feruzResult = await client.query(
                'SELECT quantity FROM taiga.p_feruz WHERE id = $1',
                [workId]
            );
            if (feruzResult.rows.length > 0 && feruzResult.rows[0].quantity) {
                plannedQuantity = parseFloat(feruzResult.rows[0].quantity) || 0;
            }
        } catch (e2) {
            return null;
        }
    }
    
    if (plannedQuantity === 0) {
        return null;
    }
    
    // Находим все записи журнала для этой работы, которые были сделаны ДО текущей записи
    let query = `
        SELECT COALESCE(SUM(quantity_completed), 0) as total_completed
        FROM taiga.project_journal
        WHERE work_id = $1
        AND (
            date < $2
            OR (date = $2 AND (time_start < $3 OR (time_start IS NULL AND $3 IS NOT NULL)))
        )
    `;
    const params = [workId, date, timeStart || null];
    
    if (excludeJournalId) {
        query += ' AND id != $4';
        params.push(excludeJournalId);
    }
    
    const completedResult = await client.query(query, params);
    const totalCompleted = parseFloat(completedResult.rows[0].total_completed) || 0;
    
    const remaining = plannedQuantity - totalCompleted;
    
    return Math.max(0, remaining);
}

async function main() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('🔄 Пересчёт remaining_at_time для всех записей журнала...\n');
        
        // Получаем все записи журнала, отсортированные по дате и времени
        const entries = await client.query(`
            SELECT id, work_id, date, time_start, quantity_completed, remaining_at_time
            FROM taiga.project_journal
            WHERE work_id IS NOT NULL
            ORDER BY date ASC, COALESCE(time_start, '00:00:00') ASC
        `);
        
        console.log(`Найдено записей: ${entries.rows.length}\n`);
        
        let updated = 0;
        let errors = 0;
        
        for (const entry of entries.rows) {
            try {
                const newRemaining = await calculateRemainingAtTime(
                    client,
                    entry.work_id,
                    entry.date,
                    entry.time_start,
                    null
                );
                
                // Обновляем только если значение изменилось
                if (newRemaining !== null && parseFloat(entry.remaining_at_time || 0) !== newRemaining) {
                    await client.query(
                        'UPDATE taiga.project_journal SET remaining_at_time = $1 WHERE id = $2',
                        [newRemaining, entry.id]
                    );
                    updated++;
                    
                    if (updated <= 10) {
                        console.log(`✅ ID ${entry.id}: ${entry.date} ${entry.time_start || ''} | Было: ${entry.remaining_at_time || 'NULL'} → Стало: ${newRemaining}`);
                    }
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка для записи ID ${entry.id}:`, error.message);
            }
        }
        
        await client.query('COMMIT');
        
        console.log(`\n📊 Итого:`);
        console.log(`   Обновлено записей: ${updated}`);
        console.log(`   Ошибок: ${errors}`);
        console.log(`   Всего обработано: ${entries.rows.length}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();


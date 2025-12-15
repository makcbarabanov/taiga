// Удаление дубликатов правил
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        // Находим дубликаты
        const duplicates = await client.query(`
            SELECT id, section, title, 
                   ROW_NUMBER() OVER (PARTITION BY section, title ORDER BY id) as rn
            FROM taiga.rules
            WHERE section IN ('intro', 'statistics')
        `);
        
        const toDelete = duplicates.rows.filter(r => r.rn > 1);
        
        if (toDelete.length === 0) {
            console.log('✅ Дубликатов не найдено');
            return;
        }
        
        console.log(`📋 Найдено ${toDelete.length} дубликатов для удаления:`);
        toDelete.forEach(d => {
            console.log(`  - ID ${d.id}: ${d.section} - ${d.title}`);
        });
        
        // Удаляем дубликаты
        for (const dup of toDelete) {
            await client.query('DELETE FROM taiga.rules WHERE id = $1', [dup.id]);
            console.log(`✅ Удалён дубликат ID ${dup.id}`);
        }
        
        console.log('\n✅ Все дубликаты удалены');
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();


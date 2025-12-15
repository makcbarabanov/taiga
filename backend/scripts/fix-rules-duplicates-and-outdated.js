// Исправление дубликатов и устаревшей информации в правилах
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        // 1. Удаляем старый "intro" с title "Введение" (оставляем тот, что с полным названием)
        const oldIntro = await client.query(`
            SELECT id FROM taiga.rules 
            WHERE section = 'intro' AND title = 'Введение'
            ORDER BY id LIMIT 1
        `);
        
        if (oldIntro.rows.length > 0) {
            await client.query('DELETE FROM taiga.rules WHERE id = $1', [oldIntro.rows[0].id]);
            console.log(`✅ Удалён старый "intro" ID ${oldIntro.rows[0].id}`);
        }
        
        // 2. Обновляем устаревшую информацию в правилах
        // Находим правило с устаревшей информацией о транспорте
        const outdatedRules = await client.query(`
            SELECT id, content FROM taiga.rules 
            WHERE content LIKE '%Накладные - Транспорт: "Яндекс Драйв"%'
               OR content LIKE '%Накладные - Каршеринг: "Делимобиль"%'
               OR content LIKE '%Транспорт Яндекс Драйв%'
        `);
        
        for (const rule of outdatedRules.rows) {
            let updatedContent = rule.content;
            
            // Заменяем устаревшие формулировки
            updatedContent = updatedContent.replace(
                /Накладные - Транспорт: "Яндекс Драйв" \(для личных поездок, не для доставки материалов\)/g,
                'Накладные - Транспорт: "Транспорт" (для Делимобиль и Яндекс Драйв при личных поездках, не для доставки материалов)'
            );
            
            updatedContent = updatedContent.replace(
                /Накладные - Каршеринг: "Делимобиль" \(только для личных поездок, не для доставки\)/g,
                'Накладные - Ремонт Авто: "Ремонт Авто" (для автоуслуг)'
            );
            
            updatedContent = updatedContent.replace(
                /Подкатегория: Транспорт Яндекс Драйв/g,
                'Подкатегория: Транспорт'
            );
            
            updatedContent = updatedContent.replace(
                /Делимобиль для личных поездок → Накладные - Каршеринг/g,
                'Делимобиль для личных поездок → Накладные - Транспорт'
            );
            
            updatedContent = updatedContent.replace(
                /Яндекс Драйв → Накладные - Транспорт \(личные поездки\)/g,
                'Яндекс Драйв → Накладные - Транспорт (личные поездки и штрафы)'
            );
            
            if (updatedContent !== rule.content) {
                await client.query(
                    'UPDATE taiga.rules SET content = $1 WHERE id = $2',
                    [updatedContent, rule.id]
                );
                console.log(`✅ Обновлено правило ID ${rule.id}`);
            }
        }
        
        console.log('\n✅ Дубликаты удалены, устаревшая информация обновлена');
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
})();


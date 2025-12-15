// Скрипт для объединения двух записей материала "20х120х6000"
const pool = require('../db');

async function mergeMaterials() {
    try {
        // Находим все записи с material_name = "20х120х6000"
        const result = await pool.query(`
            SELECT id, project_id, material_name, planned_quantity, planned_price, planned_cost
            FROM taiga.project_materials_estimate
            WHERE material_name = '20х120х6000'
            ORDER BY id
        `);
        
        console.log('Найдено записей:', result.rows.length);
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}, Проект: ${row.project_id}, Кол-во: ${row.planned_quantity}, Цена: ${row.planned_price}, Стоимость: ${row.planned_cost}`);
        });
        
        if (result.rows.length < 2) {
            console.log('❌ Не найдено двух записей для объединения');
            return;
        }
        
        // Берем первую запись для обновления, остальные удалим
        const firstRecord = result.rows[0];
        const otherRecords = result.rows.slice(1);
        
        // Суммируем planned_quantity
        const totalQuantity = result.rows.reduce((sum, r) => sum + (parseFloat(r.planned_quantity) || 0), 0);
        const price = parseFloat(firstRecord.planned_price) || 0;
        const totalCost = totalQuantity * price;
        
        console.log(`\nОбъединяем записи:`);
        console.log(`- Общее количество: ${totalQuantity}`);
        console.log(`- Цена: ${price}`);
        console.log(`- Общая стоимость: ${totalCost}`);
        
        // Обновляем первую запись
        await pool.query(`
            UPDATE taiga.project_materials_estimate
            SET planned_quantity = $1,
                planned_cost = $2
            WHERE id = $3
        `, [totalQuantity, totalCost, firstRecord.id]);
        
        console.log(`\n✅ Обновлена запись ID ${firstRecord.id}`);
        
        // Удаляем остальные записи
        for (const record of otherRecords) {
            await pool.query(`
                DELETE FROM taiga.project_materials_estimate
                WHERE id = $1
            `, [record.id]);
            console.log(`✅ Удалена запись ID ${record.id}`);
        }
        
        console.log('\n✅ Объединение завершено!');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await pool.end();
    }
}

mergeMaterials();



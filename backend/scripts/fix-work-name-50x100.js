// Исправление названия работы: 50х100хх6000 -> 50х100х6000
const pool = require('../db');

async function fixWorkName() {
    try {
        console.log('🔧 Исправляю название работы: 50х100хх6000 -> 50х100х6000\n');

        // 1. Находим вид работы с неправильным названием
        const workTypeResult = await pool.query(`
            SELECT id, name FROM taiga.work_types 
            WHERE name LIKE '%50х100хх6000%'
        `);

        if (workTypeResult.rows.length === 0) {
            console.log('⚠️  Вид работы с названием "50х100хх6000" не найден');
            console.log('Проверяю все виды работ с "50х100"...\n');
            
            const allWorkTypes = await pool.query(`
                SELECT id, name FROM taiga.work_types 
                WHERE name LIKE '%50х100%'
                ORDER BY name
            `);
            
            console.log('Найденные виды работ:');
            allWorkTypes.rows.forEach(wt => {
                console.log(`   ID ${wt.id}: ${wt.name}`);
            });
            
            await pool.end();
            return;
        }

        console.log(`Найдено видов работ с "50х100хх6000": ${workTypeResult.rows.length}`);
        
        for (const workType of workTypeResult.rows) {
            const oldName = workType.name;
            const newName = oldName.replace(/50х100хх6000/g, '50х100х6000');
            
            console.log(`\n📝 Обновляю вид работы ID ${workType.id}:`);
            console.log(`   Было: ${oldName}`);
            console.log(`   Стало: ${newName}`);

            // Обновляем название
            const updateResult = await pool.query(`
                UPDATE taiga.work_types 
                SET name = $1 
                WHERE id = $2
                RETURNING *
            `, [newName, workType.id]);

            console.log(`   ✅ Обновлено: ${updateResult.rows[0].name}`);
        }

        console.log('\n✅ Названия работ исправлены!');

        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

fixWorkName();















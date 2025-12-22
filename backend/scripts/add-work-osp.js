// Скрипт для добавления работы "ОСП внутри м2" в раздел "Стены"
// Использование: node scripts/add-work-osp.js

const pool = require('../db');

async function addWorkOSP() {
    try {
        const projectId = 1;
        console.log('🔨 Добавляю работу "ОСП внутри м2" в раздел "Стены" для проекта ID = 1...\n');

        // 1. Находим раздел "Стены"
        const sectionResult = await pool.query(`
            SELECT id FROM taiga.work_sections 
            WHERE name ILIKE '%Стены%' OR alias ILIKE '%Стены%'
            LIMIT 1
        `);
        
        if (sectionResult.rows.length === 0) {
            throw new Error('Раздел "Стены" не найден в базе данных');
        }
        const sectionId = sectionResult.rows[0].id;
        console.log(`✅ Найден раздел "Стены" (ID: ${sectionId})`);

        // 2. Находим или создаём вид работы "ОСП внутри м2"
        let workTypeResult = await pool.query(`
            SELECT id FROM taiga.work_types 
            WHERE name ILIKE '%ОСП внутри%' OR name ILIKE '%ОСП внутри м2%'
            LIMIT 1
        `);
        
        let workTypeId;
        if (workTypeResult.rows.length === 0) {
            // Создаём новый вид работы
            const createResult = await pool.query(`
                INSERT INTO taiga.work_types (name)
                VALUES ('ОСП внутри м2')
                RETURNING id
            `);
            workTypeId = createResult.rows[0].id;
            console.log(`✅ Создан вид работы "ОСП внутри м2" (ID: ${workTypeId})`);
        } else {
            workTypeId = workTypeResult.rows[0].id;
            console.log(`✅ Найден вид работы "ОСП внутри м2" (ID: ${workTypeId})`);
        }

        // 3. Находим единицу измерения "м²"
        const unitResult = await pool.query(`
            SELECT id FROM taiga.cat_units 
            WHERE name ILIKE '%м²%' OR name ILIKE '%м2%' OR short_name ILIKE '%м²%' OR short_name ILIKE '%м2%'
            LIMIT 1
        `);
        
        if (unitResult.rows.length === 0) {
            throw new Error('Единица измерения "м²" не найдена в базе данных');
        }
        const unitId = unitResult.rows[0].id;
        console.log(`✅ Найдена единица измерения "м²" (ID: ${unitId})`);

        // 4. Находим максимальный sort_order для работ в этом разделе
        // Используем представление или проверяем существование таблицы
        let maxSortResult;
        try {
            maxSortResult = await pool.query(`
                SELECT COALESCE(MAX(sort_order), 0) as max_sort
                FROM taiga.p_feruz
                WHERE project_id = $1 AND section_id = $2
            `, [projectId, sectionId]);
        } catch (e) {
            // Если таблицы нет, пробуем project_works
            maxSortResult = await pool.query(`
                SELECT COALESCE(MAX(sort_order), 0) as max_sort
                FROM taiga.project_works
                WHERE project_id = $1 AND section_id = $2
            `, [projectId, sectionId]);
        }
        const nextSortOrder = (parseFloat(maxSortResult.rows[0].max_sort) || 0) + 1;

        // 5. Проверяем, не существует ли уже такая работа
        let existingWork;
        try {
            existingWork = await pool.query(`
                SELECT id FROM taiga.p_feruz
                WHERE project_id = $1 AND section_id = $2 AND work_type_id = $3
            `, [projectId, sectionId, workTypeId]);
        } catch (e) {
            existingWork = await pool.query(`
                SELECT id FROM taiga.project_works
                WHERE project_id = $1 AND section_id = $2 AND work_type_id = $3
            `, [projectId, sectionId, workTypeId]);
        }

        if (existingWork.rows.length > 0) {
            console.log(`\n⚠️  Работа "ОСП внутри м2" уже существует (ID: ${existingWork.rows[0].id})`);
            console.log('   Пропускаю добавление.');
            return;
        }

        // 6. Добавляем работу
        let insertResult;
        try {
            insertResult = await pool.query(`
                INSERT INTO taiga.p_feruz 
                (project_id, section_id, work_type_id, unit_id, quantity, sort_order, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'В процессе')
                RETURNING *
            `, [projectId, sectionId, workTypeId, unitId, 12.5, nextSortOrder]);
        } catch (e) {
            // Если таблицы нет, пробуем project_works
            insertResult = await pool.query(`
                INSERT INTO taiga.project_works 
                (project_id, section_id, work_type_id, unit_id, quantity, sort_order, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'В процессе')
                RETURNING *
            `, [projectId, sectionId, workTypeId, unitId, 12.5, nextSortOrder]);
        }

        console.log(`\n✅ Работа успешно добавлена!`);
        console.log(`   ID: ${insertResult.rows[0].id}`);
        console.log(`   Раздел: Стены`);
        console.log(`   Наименование: ОСП внутри м2`);
        console.log(`   Количество: 12.5 м²`);
        console.log(`   Sort order: ${nextSortOrder}`);

    } catch (error) {
        console.error('❌ Ошибка при добавлении работы:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

addWorkOSP();

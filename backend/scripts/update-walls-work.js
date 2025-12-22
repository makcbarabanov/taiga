const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();




(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();




(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();




(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();




(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();




(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();




(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Находим работу через представление, чтобы увидеть work_name
        const oldWorkView = await client.query(`
            SELECT id, work_name, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order, work_type_name
            FROM taiga.v_project_works_full 
            WHERE work_name LIKE '%50х100хх6000%' OR work_type_name LIKE '%50х100%'
            LIMIT 1
        `);
        
        if (oldWorkView.rows.length === 0) {
            console.log('❌ Работа не найдена');
            await client.query('ROLLBACK');
            return;
        }
        
        const workView = oldWorkView.rows[0];
        console.log('Найдена работа:', workView);
        
        // Получаем полную информацию о работе из таблицы
        const work = await client.query(`
            SELECT id, quantity, unit_id, section_id, work_type_id, project_id, stage_id, sort_order
            FROM taiga.project_works 
            WHERE id = $1
        `, [workView.id]);
        
        if (work.rows.length === 0) {
            console.log('❌ Работа не найдена в таблице');
            await client.query('ROLLBACK');
            return;
        }
        
        const workData = work.rows[0];
        
        // 2. Находим записи в журнале за 08.12 и 09.12
        const journalEntries = await client.query(`
            SELECT id, work_id, date, quantity_completed
            FROM taiga.project_journal 
            WHERE work_id = $1 
            AND date::date IN ('2025-12-08', '2025-12-09')
            ORDER BY date DESC
        `, [workData.id]);
        
        console.log('\nЗаписи в журнале:', journalEntries.rows);
        
        // 3. Находим текущий work_type
        const currentWorkType = await client.query(`
            SELECT id, name FROM taiga.work_types WHERE id = $1
        `, [workData.work_type_id]);
        
        if (currentWorkType.rows.length === 0) {
            console.log('❌ Тип работы не найден');
            await client.query('ROLLBACK');
            return;
        }
        
        const workTypeName = currentWorkType.rows[0].name;
        console.log('Текущий тип работы:', workTypeName);
        
        // 4. Создаём два новых типа работ
        const newWorkType1 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 изготовление']);
        
        console.log('\nСоздан тип работы 1 (изготовление):', newWorkType1.rows[0]);
        
        const newWorkType2 = await client.query(`
            INSERT INTO taiga.work_types (name)
            VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['50х100хх6000 монтаж']);
        
        console.log('Создан тип работы 2 (монтаж):', newWorkType2.rows[0]);
        
        // 5. Создаём две новые работы
        const newWork1 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType1.rows[0].id, 7, workData.unit_id, workData.sort_order]);
        
        console.log('\nСоздана работа 1 (изготовление), ID:', newWork1.rows[0].id);
        
        const newWork2 = await client.query(`
            INSERT INTO taiga.project_works 
            (project_id, stage_id, section_id, work_type_id, quantity, unit_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [workData.project_id, workData.stage_id, workData.section_id, newWorkType2.rows[0].id, 7, workData.unit_id, workData.sort_order + 1]);
        
        console.log('Создана работа 2 (монтаж), ID:', newWork2.rows[0].id);
        
        // 6. Обновляем записи в журнале - привязываем к новой работе "изготовление"
        for (const entry of journalEntries.rows) {
            await client.query(`
                UPDATE taiga.project_journal 
                SET work_id = $1
                WHERE id = $2
            `, [newWork1.rows[0].id, entry.id]);
            console.log(`Обновлена запись в журнале ID ${entry.id} (дата: ${entry.date})`);
        }
        
        // 7. Проверяем, есть ли другие ссылки на старую работу
        const otherRefs = await client.query(`
            SELECT COUNT(*) as count FROM taiga.project_journal WHERE work_id = $1
        `, [workData.id]);
        
        if (parseInt(otherRefs.rows[0].count) === 0) {
            // Удаляем старую работу, если на неё нет ссылок
            await client.query('DELETE FROM taiga.project_works WHERE id = $1', [workData.id]);
            console.log(`\n✅ Удалена старая работа ID ${workData.id}`);
        } else {
            console.log(`\n⚠️ Старая работа ID ${workData.id} оставлена (есть другие ссылки: ${otherRefs.rows[0].count})`);
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все изменения применены успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
})();

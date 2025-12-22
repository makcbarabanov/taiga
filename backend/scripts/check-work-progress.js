const pool = require('../db');

async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();



async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();
async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();



async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();
async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();



async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();
async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();



async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();
async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();



async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();
async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();



async function checkWorkProgress() {
    const client = await pool.connect();
    
    try {
        // Проверяем работу с ID 117
        const workQuery = `
            SELECT 
                id,
                quantity,
                completed_quantity,
                progress_percent,
                (completed_quantity / NULLIF(quantity, 0) * 100) as calculated_progress
            FROM taiga.project_works
            WHERE id = 117;
        `;
        
        const workResult = await client.query(workQuery);
        console.log('Работа ID 117:');
        console.log(workResult.rows[0]);
        
        // Проверяем записи в журнале для этой работы
        const journalQuery = `
            SELECT 
                id,
                date,
                work_id,
                quantity_completed,
                time_start,
                time_end,
                hours
            FROM taiga.project_journal
            WHERE work_id = 117
            ORDER BY date, id;
        `;
        
        const journalResult = await client.query(journalQuery);
        console.log('\nЗаписи в журнале для работы ID 117:');
        console.log('Всего записей:', journalResult.rows.length);
        journalResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}, Время: ${row.time_start} - ${row.time_end}, Часов: ${row.hours}`);
        });
        
        // Проверяем, есть ли записи с количеством 13
        const check13Query = `
            SELECT 
                id,
                date,
                quantity_completed
            FROM taiga.project_journal
            WHERE work_id = 117 AND quantity_completed = 13;
        `;
        
        const check13Result = await client.query(check13Query);
        if (check13Result.rows.length > 0) {
            console.log('\n⚠️ Найдены записи с количеством 13:');
            check13Result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}, Дата: ${row.date}, Выполнено: ${row.quantity_completed}`);
            });
        } else {
            console.log('\n✅ Записей с количеством 13 не найдено');
        }
        
        // Суммируем выполненные работы
        const sumQuery = `
            SELECT 
                SUM(quantity_completed) as total_completed
            FROM taiga.project_journal
            WHERE work_id = 117;
        `;
        
        const sumResult = await client.query(sumQuery);
        console.log('\nСумма выполненных работ из журнала:', sumResult.rows[0].total_completed);
        console.log('Запланированное количество:', workResult.rows[0].quantity);
        console.log('Вычисленный прогресс:', workResult.rows[0].calculated_progress);
        console.log('Текущий прогресс в БД:', workResult.rows[0].progress_percent);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkWorkProgress();
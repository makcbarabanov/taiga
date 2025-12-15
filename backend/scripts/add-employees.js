// ===========================================
// Добавление сотрудников в справочник
// ===========================================

const pool = require('../db');

async function addEmployees() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Проверяем, есть ли уже Макс (Барабанов М.В.)
        const checkMax = await client.query(`
            SELECT id FROM taiga.employees 
            WHERE last_name ILIKE '%Барабанов%' 
               OR (last_name ILIKE '%Макс%' OR first_name ILIKE '%Макс%')
            LIMIT 1
        `);
        
        if (checkMax.rows.length === 0) {
            // Добавляем Макса (Барабанов М.В.)
            await client.query(`
                INSERT INTO taiga.employees (last_name, first_name, middle_name, hire_date, status)
                VALUES ('Барабанов', 'Максим', 'Владимирович', CURRENT_DATE, 'Работает')
                RETURNING id
            `);
            console.log('✅ Добавлен сотрудник: Барабанов Максим Владимирович (Макс)');
        } else {
            console.log('ℹ️  Сотрудник Макс уже существует (ID: ' + checkMax.rows[0].id + ')');
        }
        
        // Проверяем, есть ли уже Жура
        const checkZhura = await client.query(`
            SELECT id FROM taiga.employees 
            WHERE last_name ILIKE '%Жура%' OR first_name ILIKE '%Жура%'
            LIMIT 1
        `);
        
        if (checkZhura.rows.length === 0) {
            // Добавляем Журу
            await client.query(`
                INSERT INTO taiga.employees (last_name, first_name, middle_name, hire_date, status)
                VALUES ('Жура', '', '', CURRENT_DATE, 'Работает')
                RETURNING id
            `);
            console.log('✅ Добавлен сотрудник: Жура');
        } else {
            console.log('ℹ️  Сотрудник Жура уже существует (ID: ' + checkZhura.rows[0].id + ')');
        }
        
        // Проверяем других сотрудников из журнала
        const otherEmployees = [
            { last_name: 'Даня', first_name: '', middle_name: '' },
            { last_name: 'Дил', first_name: '', middle_name: '' },
            { last_name: 'Фаррух', first_name: '', middle_name: '' },
            { last_name: 'Сергей', first_name: '', middle_name: '' }
        ];
        
        for (const emp of otherEmployees) {
            const check = await client.query(`
                SELECT id FROM taiga.employees 
                WHERE last_name ILIKE $1
                LIMIT 1
            `, [emp.last_name]);
            
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO taiga.employees (last_name, first_name, middle_name, hire_date, status)
                    VALUES ($1, $2, $3, CURRENT_DATE, 'Работает')
                    RETURNING id
                `, [emp.last_name, emp.first_name, emp.middle_name]);
                console.log(`✅ Добавлен сотрудник: ${emp.last_name}`);
            } else {
                console.log(`ℹ️  Сотрудник ${emp.last_name} уже существует (ID: ${check.rows[0].id})`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все сотрудники проверены/добавлены!');
        
        // Показываем итоговый список
        const allEmployees = await client.query(`
            SELECT id, last_name, first_name, middle_name, status 
            FROM taiga.employees 
            ORDER BY last_name, first_name
        `);
        
        console.log('\n📋 Список всех сотрудников:');
        allEmployees.rows.forEach(r => {
            const name = [r.last_name, r.first_name, r.middle_name].filter(x => x).join(' ') || '(пусто)';
            console.log(`   ID: ${r.id}, Имя: ${name}, Статус: ${r.status}`);
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addEmployees();




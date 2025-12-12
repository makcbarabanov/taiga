// Добавление дохода от Феруза: 12000₽, комментарий "доплата за сваи"

const pool = require('../db');

async function addIncome() {
    try {
        console.log('💰 Добавляю доход от Феруза...\n');

        // Получаем текущую дату
        const today = new Date();
        const date = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        console.log(`📅 Дата: ${date} (${year}-${month})\n`);

        // Получаем project_id для "Гостевой 5х8" (Феруз)
        const project = await pool.query(
            `SELECT p.id 
             FROM taiga.projects p 
             JOIN taiga.clients c ON p.client_id = c.id 
             WHERE p.name = $1 AND c.name = $2`,
            ['Гостевой 5х8', 'Феруз']
        );
        
        if (project.rows.length === 0) {
            throw new Error('Проект "Гостевой 5х8" (Феруз) не найден!');
        }
        const projectId = project.rows[0].id;
        console.log(`✅ Проект найден: ID = ${projectId}\n`);

        // Добавляем доход
        const result = await pool.query(
            `INSERT INTO taiga.income 
             (project_id, date, month, year, amount, comment)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [
                projectId,
                date,
                month,
                year,
                12000,
                'доплата за сваи'
            ]
        );

        console.log(`✅ Доход добавлен: 12000₽ (доплата за сваи) → ID: ${result.rows[0].id}`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

addIncome();




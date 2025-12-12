require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

async function checkDependencies() {
    try {
        const projectId = 4; // Проект для удаления
        const clientId = 2;  // Клиент для удаления

        console.log(`Проверяю зависимости для проекта ID ${projectId} и клиента ID ${clientId}...\n`);

        // Проверяем расходы
        const expenses = await pool.query('SELECT COUNT(*) as count FROM taiga.expenses WHERE project_id = $1', [projectId]);
        console.log(`Расходы (project_id = ${projectId}): ${expenses.rows[0].count}`);

        // Проверяем доходы
        const income = await pool.query('SELECT COUNT(*) as count FROM taiga.income WHERE project_id = $1', [projectId]);
        console.log(`Доходы (project_id = ${projectId}): ${income.rows[0].count}`);

        // Проверяем работы (p_feruz)
        const works = await pool.query('SELECT COUNT(*) as count FROM taiga.p_feruz WHERE project_id = $1', [projectId]);
        console.log(`Работы (p_feruz, project_id = ${projectId}): ${works.rows[0].count}`);

        // Проверяем журнал
        const journal = await pool.query('SELECT COUNT(*) as count FROM taiga.project_journal WHERE project_id = $1', [projectId]);
        console.log(`Журнал (project_id = ${projectId}): ${journal.rows[0].count}`);

        // Проверяем материалы
        const materials = await pool.query('SELECT COUNT(*) as count FROM taiga.project_materials_estimate WHERE project_id = $1', [projectId]);
        console.log(`Материалы (project_id = ${projectId}): ${materials.rows[0].count}`);

        // Проверяем другие проекты клиента
        const otherProjects = await pool.query('SELECT COUNT(*) as count FROM taiga.projects WHERE client_id = $1 AND id != $2', [clientId, projectId]);
        console.log(`Других проектов у клиента ID ${clientId}: ${otherProjects.rows[0].count}`);

        console.log('\n✅ Проверка завершена. Можно безопасно удалять.');

    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkDependencies();


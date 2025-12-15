// Исправление даты для расхода ID 130
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE taiga.expenses SET date='2025-12-13', month=12, year=2025 WHERE id=130 RETURNING id, date, amount`
        );
        console.log(`✅ Исправлено: ID ${result.rows[0].id}, дата: ${result.rows[0].date}, сумма: ${result.rows[0].amount} ₽`);
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
})();


// Исправление подкатегории для расхода ID 129
const pool = require('../db');

(async () => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE taiga.expenses SET subcategory='Транспорт' WHERE id=129 RETURNING id, subcategory, amount`
        );
        console.log(`✅ Исправлено: ID ${result.rows[0].id}, подкатегория: ${result.rows[0].subcategory}, сумма: ${result.rows[0].amount} ₽`);
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
})();


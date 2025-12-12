// Исправление названий товаров в расходах за 10.12.2025
const pool = require('../db');

// Маппинг: ID записи -> название товара
const expenseNames = {
    80: 'Толстовка',
    81: 'Саморезы по дереву 3,5×51 мм (1 кг)',
    82: 'Кабель ВВГ-Пнг(А)-LS 2×1.5 мм² (100 м)',
    83: 'Толстовка', // дубликат, удалим
    84: 'Ботинки рабочие (размер 41)',
    85: 'Ботинки рабочие (размер 42)',
    86: 'Светодиодная лента IP22',
    87: 'Светодиодная лента IP65',
    88: 'Круг абразивный P80',
    89: 'Круг абразивный P36',
    90: 'Круг абразивный P120',
    91: 'Мешки для мусора',
    92: 'Лезвия для канцелярских ножей',
    93: 'Саморезы по дереву 3,5×51 мм (1 кг)',
    94: 'Нож канцелярский',
    95: 'Диск пильный по дереву',
    96: 'Кабель ВВГ-Пнг(А)-LS 2×1.5 мм² (100 м)',
    97: 'Прожектор светодиодный уличный 100 Вт',
    98: 'Фонарь налобный аккумуляторный'
};

async function fixExpenses() {
    try {
        console.log('🚀 Начинаю исправление названий товаров...\n');

        // Удаляем дубликаты (ID 80-83)
        console.log('Удаляю дубликаты (ID 80-83)...');
        await pool.query('DELETE FROM taiga.expenses WHERE id IN (80, 81, 82, 83)');
        console.log('✅ Дубликаты удалены\n');

        // Обновляем названия товаров в поле subcategory
        let updated = 0;
        for (const [id, name] of Object.entries(expenseNames)) {
            if (id >= 84) { // Обновляем только новые записи
                const result = await pool.query(
                    'UPDATE taiga.expenses SET subcategory = $1 WHERE id = $2',
                    [name, parseInt(id)]
                );
                if (result.rowCount > 0) {
                    console.log(`✅ ID ${id}: "${name}"`);
                    updated++;
                }
            }
        }

        console.log(`\n📊 Обновлено записей: ${updated}`);
        console.log('✅ Готово!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

fixExpenses();


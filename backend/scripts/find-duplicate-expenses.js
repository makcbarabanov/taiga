// Поиск дубликатов расходов
// Сравнивает записи по дате, категории, наименованию, сумме, клиенту и объекту

const pool = require('../db');

async function findDuplicates() {
    try {
        console.log('🔍 Ищу дубликаты расходов...\n');

        // Получаем все расходы с полной информацией
        const expenses = await pool.query(`
            SELECT 
                e.id,
                e.date,
                e.amount,
                ec.name as category_name,
                e.subcategory,
                e.comment,
                p.name as project_name,
                c.name as client_name,
                s.name as shop_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_expense ec ON e.category_id = ec.id
            LEFT JOIN taiga.projects p ON e.project_id = p.id
            LEFT JOIN taiga.clients c ON p.client_id = c.id
            LEFT JOIN taiga.shops s ON e.shop_id = s.id
            ORDER BY e.date DESC, e.id DESC
        `);

        console.log(`📊 Всего расходов: ${expenses.rows.length}\n`);

        // Группируем по ключевым полям для поиска дубликатов
        const groups = new Map();
        
        expenses.rows.forEach((expense, index) => {
            // Создаём ключ для сравнения: дата + категория + наименование + сумма + клиент + объект
            const key = `${expense.date}|${expense.category_name}|${expense.subcategory || ''}|${expense.amount}|${expense.client_name || ''}|${expense.project_name || ''}`;
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push({
                position: index + 1, // Порядковый номер в таблице (начиная с 1)
                id: expense.id,
                date: expense.date,
                category: expense.category_name,
                subcategory: expense.subcategory,
                amount: expense.amount,
                comment: expense.comment,
                shop: expense.shop_name
            });
        });

        // Находим группы с дубликатами (больше 1 записи)
        const duplicates = [];
        groups.forEach((items, key) => {
            if (items.length > 1) {
                duplicates.push(items);
            }
        });

        if (duplicates.length === 0) {
            console.log('✅ Дубликатов не найдено');
            await pool.end();
            return;
        }

        console.log(`⚠️  Найдено ${duplicates.length} групп дубликатов:\n`);
        console.log('Дубликаты:');

        duplicates.forEach((group, groupIndex) => {
            const positions = group.map(item => item.position).sort((a, b) => a - b);
            console.log(positions.join(' '));
            
            // Дополнительная информация для отладки
            if (groupIndex < 5) { // Показываем детали только для первых 5 групп
                console.log(`   Детали (позиции ${positions.join(', ')}):`);
                group.forEach(item => {
                    console.log(`      ${item.position}: ${item.date} | ${item.category} | ${item.subcategory || 'без названия'} | ${item.amount} | ${item.comment || 'без комментария'}`);
                });
            }
        });

        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error);
        await pool.end();
        process.exit(1);
    }
}

findDuplicates();


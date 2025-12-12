// ===========================================
// Скрипт для поиска недостающих расходов из предоставленных данных
// ===========================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

// Данные, предоставленные пользователем
const providedExpenses = [
    { date: '01.12.2025', category: 'ФОТ', subcategory: 'Жура', qty: 1, price: 4000, amount: 4000 },
    { date: '01.12.2025', category: 'ФОТ', subcategory: 'Даня', qty: 1, price: 150000, amount: 150000 },
    { date: '02.12.2025', category: 'Накладные', subcategory: 'Продукты', qty: 1, price: 690, amount: 690 },
    { date: '03.12.2025', category: 'Накладные', subcategory: 'Такси', qty: 1, price: 2900, amount: 2900 },
    { date: '03.12.2025', category: 'Накладные', subcategory: 'Продукты', qty: 1, price: 1175, amount: 1175 },
    { date: '03.12.2025', category: 'Накладные', subcategory: 'Эвакуация машины', qty: 1, price: 6200, amount: 6200 },
    { date: '03.12.2025', category: 'ФОТ', subcategory: 'Барабанов М.В.', qty: 1, price: 130000, amount: 130000 },
    { date: '03.12.2025', category: 'Мат', subcategory: 'Окна', qty: 1, price: 42000, amount: 42000 },
    { date: '04.12.2025', category: 'ФОТ', subcategory: 'Барабанов М. В. ', qty: 1, price: 400, amount: 400 },
    { date: '04.12.2025', category: 'ФОТ', subcategory: 'Барабанов М. В. ', qty: 1, price: 2635, amount: 2635 },
    { date: '06.12.2025', category: 'Мат', subcategory: '50х200х6000', qty: 27, price: 1410, amount: 38070 },
    { date: '06.12.2025', category: 'Мат', subcategory: '25х150х6000', qty: 51, price: 530, amount: 27030 },
    { date: '06.12.2025', category: 'Мат', subcategory: '45х195х6000', qty: 3, price: 1560, amount: 4680 },
    { date: '06.12.2025', category: 'Мат', subcategory: '28х140х6000', qty: 16, price: 990, amount: 15840 },
    { date: '06.12.2025', category: 'Мат', subcategory: '50х100х6000', qty: 48, price: 711, amount: 34128 },
    { date: '06.12.2025', category: 'Мат', subcategory: '50х150х6000', qty: 19, price: 1060, amount: 20140 },
    { date: '06.12.2025', category: 'Мат', subcategory: '20х50х3000', qty: 230, price: 80, amount: 18400 },
    { date: '06.12.2025', category: 'Мат', subcategory: '25х100х6000', qty: 34, price: 320, amount: 10880 },
    { date: '06.12.2025', category: 'Мат', subcategory: '45х145х6000', qty: 14, price: 1170, amount: 16380 },
    { date: '06.12.2025', category: 'Мат', subcategory: '20х120х6000', qty: 43, price: 555, amount: 23865 },
    { date: '06.12.2025', category: 'Мат', subcategory: '20х120х6000', qty: null, price: 555, amount: null }, // Пустое количество и сумма
    { date: '06.12.2025', category: 'Мат', subcategory: '100х100х6000', qty: 2, price: 1230, amount: 2460 },
    { date: '06.12.2025', category: '', subcategory: 'Сетка сварная от грызунов 15м2 6х6х0,6', qty: 2, price: 2500, amount: 5000 },
    { date: '06.12.2025', category: 'ТЗР', subcategory: 'Доставка Стройсервис Велигонты ', qty: 1, price: 14000, amount: 14000 },
    { date: '06.12.2025', category: 'ТЗР', subcategory: 'Доставка инструмента с Разбегаево', qty: 1, price: 6000, amount: 6000 },
    { date: '06.12.2025', category: 'ТЗР', subcategory: 'Разгрузка материала', qty: 1, price: 3000, amount: 3000 },
    { date: '06.12.2025', category: 'ФОТ', subcategory: 'Барабанов М.В.', qty: 1, price: 21322, amount: 21322 },
    { date: '06.12.2025', category: 'Накладные', subcategory: 'продукты', qty: 1, price: 4900, amount: 4900 },
    { date: '06.12.2025', category: 'ФОТ', subcategory: 'Барабанов М.В.', qty: 1, price: 4000, amount: 4000 },
    { date: '06.12.2025', category: 'Инструм', subcategory: 'Лопата штыковая', qty: 1, price: 800, amount: 800 },
    { date: '06.12.2025', category: 'Инструм', subcategory: 'Лопата совковая', qty: 1, price: 800, amount: 800 },
    { date: '06.12.2025', category: 'Инструм', subcategory: 'Лопата снеговая', qty: 1, price: 500, amount: 500 },
    { date: '06.12.2025', category: 'Накладные', subcategory: 'Шлифкруги', qty: 1, price: 100, amount: 100 },
    { date: '07.12.2025', category: 'Расход', subcategory: 'Диск по дереву для торцовки', qty: 1, price: 1282, amount: 1282 },
    { date: '07.12.2025', category: 'Накладные', subcategory: 'продукты', qty: 1, price: 700, amount: 700 },
    { date: '07.12.2025', category: 'Накладные', subcategory: 'бензин', qty: 1, price: 2136, amount: 2136 },
];

async function findMissing() {
    try {
        console.log('🔍 Поиск недостающих расходов...\n');

        // Удаляем корректировку
        await pool.query(
            "DELETE FROM taiga.expenses WHERE project_id = 1 AND subcategory = 'Корректировка (недостающая сумма)'"
        );
        console.log('✅ Удалена корректировка\n');

        // Загружаем расходы из БД
        const dbResult = await pool.query(`
            SELECT e.date, ec.name as category, e.subcategory, e.amount, e.id
            FROM taiga.expenses e
            JOIN taiga.expense_categories ec ON e.category_id = ec.id
            WHERE e.project_id = 1
            ORDER BY e.date, e.amount
        `);

        console.log(`📊 В БД: ${dbResult.rows.length} расходов\n`);

        // Подсчитываем сумму из предоставленных данных
        let providedTotal = 0;
        const validExpenses = providedExpenses.filter(exp => {
            if (!exp.amount && exp.qty && exp.price) {
                exp.amount = exp.qty * exp.price;
            }
            if (exp.amount && exp.amount > 0) {
                providedTotal += exp.amount;
                return true;
            }
            return false;
        });

        console.log(`📊 В предоставленных данных: ${validExpenses.length} расходов, сумма = ${providedTotal}\n`);

        // Создаём набор для сравнения (дата + категория + подкатегория + сумма)
        const dbExpenses = new Map();
        dbResult.rows.forEach(row => {
            let dateStr = row.date;
            if (typeof dateStr === 'object' && dateStr.toISOString) {
                dateStr = dateStr.toISOString().split('T')[0];
            } else if (typeof dateStr === 'string') {
                dateStr = dateStr.split('T')[0];
            }
            const dateParts = dateStr.split('-');
            const csvDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
            const key = `${csvDate}|${row.category}|${row.subcategory || ''}|${row.amount}`;
            dbExpenses.set(key, row);
        });

        // Ищем недостающие расходы
        const missing = [];
        for (const exp of validExpenses) {
            // Нормализуем категорию (пустая категория = "Расход")
            let category = exp.category.trim();
            if (!category) {
                category = 'Расход';
            }

            // Нормализуем подкатегорию
            const subcategory = (exp.subcategory || '').trim();

            const key = `${exp.date}|${category}|${subcategory}|${exp.amount}`;
            
            if (!dbExpenses.has(key)) {
                missing.push(exp);
            }
        }

        if (missing.length > 0) {
            console.log(`❌ Найдено ${missing.length} недостающих расходов:\n`);
            let missingTotal = 0;
            missing.forEach((exp, idx) => {
                const category = exp.category.trim() || 'Расход';
                console.log(`${idx + 1}. ${exp.date} | ${category} | ${exp.subcategory} | ${exp.amount} руб`);
                missingTotal += exp.amount;
            });
            console.log(`\n📊 Сумма недостающих: ${missingTotal} руб`);
        } else {
            console.log('✅ Все расходы из предоставленных данных есть в БД');
        }

        // Проверяем итоговую сумму в БД
        const checkResult = await pool.query(
            'SELECT SUM(amount) as total, COUNT(*) as count FROM taiga.expenses WHERE project_id = 1'
        );

        const dbTotal = parseFloat(checkResult.rows[0].total);
        console.log(`\n📊 Итоговая сумма в БД: ${dbTotal}`);
        console.log(`📊 Ожидается: ${providedTotal}`);
        console.log(`📊 Разница: ${providedTotal - dbTotal}`);

    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await pool.end();
    }
}

findMissing();


// Добавление расходов за 12.12.2025
const pool = require('../db');

async function addExpenses() {
    const client = await pool.connect();
    
    try {
        // Находим ID категорий, магазинов, проектов
        const categoryMarga = await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Маржа'`);
        const categoryNakladnye = await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Накладные'`);
        
        const shopYandex = await client.query(`SELECT id FROM taiga.shops WHERE name ILIKE '%Яндекс%'`);
        const shopLenta = await client.query(`SELECT id FROM taiga.shops WHERE name ILIKE '%Лента%'`);
        
        const projectFeruz = await client.query(`SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8'`);
        
        const unitSht = await client.query(`SELECT id FROM taiga.units WHERE short_name = 'шт'`);
        
        console.log('Найденные ID:');
        console.log('Категория Маржа:', categoryMarga.rows[0]?.id);
        console.log('Категория Накладные:', categoryNakladnye.rows[0]?.id);
        console.log('Магазин Яндекс:', shopYandex.rows[0]?.id);
        console.log('Магазин Лента:', shopLenta.rows[0]?.id);
        console.log('Проект Гостевой 5х8:', projectFeruz.rows[0]?.id);
        console.log('Ед. изм. шт:', unitSht.rows[0]?.id);
        
        // Добавляем расходы
        const expenses = [
            {
                date: '2025-12-12',
                category_id: categoryMarga.rows[0]?.id,
                subcategory: 'Барабанов М.В.',
                unit_id: unitSht.rows[0]?.id,
                quantity: 1,
                price: 200,
                amount: 200,
                project_id: projectFeruz.rows[0]?.id,
                shop_id: shopYandex.rows[0]?.id,
                comment: 'Яндекс Плюс'
            },
            {
                date: '2025-12-12',
                category_id: categoryNakladnye.rows[0]?.id,
                subcategory: 'Продукты',
                unit_id: unitSht.rows[0]?.id,
                quantity: 1,
                price: 124.99,
                amount: 124.99,
                project_id: projectFeruz.rows[0]?.id,
                shop_id: shopLenta.rows[0]?.id,
                comment: 'Лента'
            },
            {
                date: '2025-12-12',
                category_id: categoryNakladnye.rows[0]?.id,
                subcategory: 'Продукты',
                unit_id: unitSht.rows[0]?.id,
                quantity: 1,
                price: 1116.64,
                amount: 1116.64,
                project_id: projectFeruz.rows[0]?.id,
                shop_id: shopLenta.rows[0]?.id,
                comment: 'Лента'
            }
        ];
        
        for (const expense of expenses) {
            const insertQuery = `
                INSERT INTO taiga.expenses (
                    date, category_id, subcategory, unit_id, quantity, 
                    price, amount, project_id, shop_id, comment
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, date, amount;
            `;
            
            const result = await client.query(insertQuery, [
                expense.date,
                expense.category_id,
                expense.subcategory,
                expense.unit_id,
                expense.quantity,
                expense.price,
                expense.amount,
                expense.project_id,
                expense.shop_id,
                expense.comment
            ]);
            
            console.log(`✅ Добавлен расход ID ${result.rows[0].id}: ${result.rows[0].date} - ${result.rows[0].amount} ₽`);
        }
        
        console.log('\n✅ Все расходы добавлены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addExpenses();





async function addExpenses() {
    const client = await pool.connect();
    
    try {
        // Находим ID категорий, магазинов, проектов
        const categoryMarga = await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Маржа'`);
        const categoryNakladnye = await client.query(`SELECT id FROM taiga.expense_categories WHERE name = 'Накладные'`);
        
        const shopYandex = await client.query(`SELECT id FROM taiga.shops WHERE name ILIKE '%Яндекс%'`);
        const shopLenta = await client.query(`SELECT id FROM taiga.shops WHERE name ILIKE '%Лента%'`);
        
        const projectFeruz = await client.query(`SELECT id FROM taiga.projects WHERE name = 'Гостевой 5х8'`);
        
        const unitSht = await client.query(`SELECT id FROM taiga.units WHERE short_name = 'шт'`);
        
        console.log('Найденные ID:');
        console.log('Категория Маржа:', categoryMarga.rows[0]?.id);
        console.log('Категория Накладные:', categoryNakladnye.rows[0]?.id);
        console.log('Магазин Яндекс:', shopYandex.rows[0]?.id);
        console.log('Магазин Лента:', shopLenta.rows[0]?.id);
        console.log('Проект Гостевой 5х8:', projectFeruz.rows[0]?.id);
        console.log('Ед. изм. шт:', unitSht.rows[0]?.id);
        
        // Добавляем расходы
        const expenses = [
            {
                date: '2025-12-12',
                category_id: categoryMarga.rows[0]?.id,
                subcategory: 'Барабанов М.В.',
                unit_id: unitSht.rows[0]?.id,
                quantity: 1,
                price: 200,
                amount: 200,
                project_id: projectFeruz.rows[0]?.id,
                shop_id: shopYandex.rows[0]?.id,
                comment: 'Яндекс Плюс'
            },
            {
                date: '2025-12-12',
                category_id: categoryNakladnye.rows[0]?.id,
                subcategory: 'Продукты',
                unit_id: unitSht.rows[0]?.id,
                quantity: 1,
                price: 124.99,
                amount: 124.99,
                project_id: projectFeruz.rows[0]?.id,
                shop_id: shopLenta.rows[0]?.id,
                comment: 'Лента'
            },
            {
                date: '2025-12-12',
                category_id: categoryNakladnye.rows[0]?.id,
                subcategory: 'Продукты',
                unit_id: unitSht.rows[0]?.id,
                quantity: 1,
                price: 1116.64,
                amount: 1116.64,
                project_id: projectFeruz.rows[0]?.id,
                shop_id: shopLenta.rows[0]?.id,
                comment: 'Лента'
            }
        ];
        
        for (const expense of expenses) {
            const insertQuery = `
                INSERT INTO taiga.expenses (
                    date, category_id, subcategory, unit_id, quantity, 
                    price, amount, project_id, shop_id, comment
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, date, amount;
            `;
            
            const result = await client.query(insertQuery, [
                expense.date,
                expense.category_id,
                expense.subcategory,
                expense.unit_id,
                expense.quantity,
                expense.price,
                expense.amount,
                expense.project_id,
                expense.shop_id,
                expense.comment
            ]);
            
            console.log(`✅ Добавлен расход ID ${result.rows[0].id}: ${result.rows[0].date} - ${result.rows[0].amount} ₽`);
        }
        
        console.log('\n✅ Все расходы добавлены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addExpenses();

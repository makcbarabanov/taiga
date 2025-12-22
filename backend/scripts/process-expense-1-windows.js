// Обработка расхода #1: Замена "Окна" на несколько позиций ПВХ окон/дверей
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function processExpense1() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим расход #8 (Окна)
        const expenseResult = await client.query(
            'SELECT * FROM taiga.expenses WHERE id = 8'
        );
        
        if (expenseResult.rows.length === 0) {
            console.log('❌ Расход #8 (Окна) не найден');
            return;
        }
        
        const oldExpense = expenseResult.rows[0];
        console.log('Найден расход:', oldExpense);
        
        // Удаляем старую запись
        await client.query('DELETE FROM taiga.expenses WHERE id = 8');
        console.log('✅ Старая запись удалена');
        
        // Создаём новые записи (45.65% от цены)
        const newExpenses = [
            { name: 'ПВХ Дверь 900х2000 7024', price: 35582, percent: 0.4565 },
            { name: '1200х600 откидное 7024', price: 9213, percent: 0.4565 },
            { name: '1800х2000 с перемычкой 7024', price: 22409, percent: 0.4565 },
            { name: '500х500 7024', price: 9483, percent: 0.4565 },
            { name: '800х1600 с поворотно откидным механизмом 7024', price: 13671, percent: 0.4565 }
        ];
        
        // Получаем ID категории "Мат" и единицы "шт"
        const catResult = await client.query(
            "SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1"
        );
        const unitResult = await client.query(
            "SELECT id FROM taiga.cat_units WHERE short_name = 'шт' LIMIT 1"
        );
        
        const matCategoryId = catResult.rows[0].id;
        const unitId = unitResult.rows[0].id;
        
        console.log(`\nСоздаём ${newExpenses.length} новых записей:`);
        
        for (const item of newExpenses) {
            const newPrice = Math.round(item.price * item.percent);
            const newAmount = newPrice; // количество = 1
            
            const result = await client.query(
                `INSERT INTO taiga.expenses 
                 (project_id, date, month, year, category_id, subcategory, unit_id, quantity, price, amount, section, wallet, shop_id, comment)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                 RETURNING id`,
                [
                    oldExpense.project_id,
                    oldExpense.date,
                    oldExpense.month,
                    oldExpense.year,
                    matCategoryId,
                    item.name,
                    unitId,
                    1,
                    newPrice,
                    newAmount,
                    oldExpense.section,
                    oldExpense.wallet,
                    oldExpense.shop_id,
                    oldExpense.comment || 'Предоплата 45.65%'
                ]
            );
            
            console.log(`  ✅ ${item.name}: ${newPrice} руб (${item.price} × ${(item.percent * 100).toFixed(2)}%)`);
            
            // Добавляем материал в _list_mat, если его нет
            await client.query(
                `INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (mat) DO NOTHING`,
                [item.name, matCategoryId, unitId]
            );
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Все записи созданы успешно!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

processExpense1().catch(console.error);


        client.release();
        await pool.end();
    }
}

processExpense1().catch(console.error);


        client.release();
        await pool.end();
    }
}

processExpense1().catch(console.error);


        client.release();
        await pool.end();
    }
}

processExpense1().catch(console.error);


        client.release();
        await pool.end();
    }
}

processExpense1().catch(console.error);


        client.release();
        await pool.end();
    }
}

processExpense1().catch(console.error);


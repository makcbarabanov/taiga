// Обработка расхода #13: Разбиение "Доборные элементы" на 4 позиции
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function processExpense13() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Находим расход #124 (Доборные элементы)
        const expenseResult = await client.query(
            'SELECT * FROM taiga.expenses WHERE id = 124'
        );
        
        if (expenseResult.rows.length === 0) {
            console.log('❌ Расход #124 (Доборные элементы) не найден');
            return;
        }
        
        const oldExpense = expenseResult.rows[0];
        console.log('Найден расход:', oldExpense);
        
        const totalAmount = parseFloat(oldExpense.amount) || 13500;
        const totalQuantity = 4 + 8 + 4 + 1; // 17 штук
        const pricePerUnit = Math.round(totalAmount / totalQuantity);
        
        console.log(`Общая сумма: ${totalAmount} руб`);
        console.log(`Общее количество: ${totalQuantity} шт`);
        console.log(`Цена за единицу: ${pricePerUnit} руб`);
        
        // Удаляем старую запись
        await client.query('DELETE FROM taiga.expenses WHERE id = 124');
        console.log('✅ Старая запись удалена');
        
        // Создаём новые записи
        const newExpenses = [
            { name: 'конёк шт 4 L=3200мм Ral 7024', quantity: 4 },
            { name: 'карнизная планка 8шт L=3200мм Ral 7024', quantity: 8 },
            { name: 'угол внешний 60х60 4шт L=3200мм Ral 7024', quantity: 4 },
            { name: 'отлив полка 100мм - 1шт L=3200мм Ral 7024', quantity: 1 }
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
        
        let remainingAmount = totalAmount;
        
        for (let i = 0; i < newExpenses.length; i++) {
            const item = newExpenses[i];
            const isLast = i === newExpenses.length - 1;
            
            // Для последней позиции используем остаток суммы, чтобы точно получилось totalAmount
            const itemAmount = isLast ? remainingAmount : Math.round(pricePerUnit * item.quantity);
            const itemPrice = Math.round(itemAmount / item.quantity);
            
            remainingAmount -= itemAmount;
            
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
                    item.quantity,
                    itemPrice,
                    itemAmount,
                    oldExpense.section,
                    oldExpense.wallet,
                    oldExpense.shop_id,
                    oldExpense.comment
                ]
            );
            
            console.log(`  ✅ ${item.name}: ${item.quantity} шт × ${itemPrice} руб = ${itemAmount} руб`);
            
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
        console.log(`Итоговая сумма: ${totalAmount} руб`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

processExpense13().catch(console.error);


        console.log(`Итоговая сумма: ${totalAmount} руб`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

processExpense13().catch(console.error);


        console.log(`Итоговая сумма: ${totalAmount} руб`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

processExpense13().catch(console.error);


        console.log(`Итоговая сумма: ${totalAmount} руб`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

processExpense13().catch(console.error);


        console.log(`Итоговая сумма: ${totalAmount} руб`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

processExpense13().catch(console.error);


        console.log(`Итоговая сумма: ${totalAmount} руб`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

processExpense13().catch(console.error);


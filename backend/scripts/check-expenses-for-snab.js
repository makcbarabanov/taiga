// Проверка расходов на предмет наличия в СНАБ
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkExpenses() {
    try {
        // Получаем ID категорий
        const categoriesResult = await pool.query(`
            SELECT id, name FROM taiga.cat_expense 
            WHERE name IN ('Мат', 'Расход', 'Накладные', 'Инструм')
        `);
        
        const categoryMap = {};
        categoriesResult.rows.forEach(row => {
            categoryMap[row.id] = row.name;
        });
        
        const matCategoryId = categoriesResult.rows.find(r => r.name === 'Мат')?.id;
        const rashodCategoryId = categoriesResult.rows.find(r => r.name === 'Расход')?.id;
        
        // Получаем все расходы из категорий Мат, Расход, Накладные, Инструм
        const expensesResult = await pool.query(`
            SELECT e.*, ce.name as category_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_expense ce ON e.category_id = ce.id
            WHERE e.category_id IN (${Object.keys(categoryMap).join(',')})
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.date DESC, e.id
        `);
        
        console.log(`\nВсего расходов для проверки: ${expensesResult.rows.length}\n`);
        
        const missingInSnab = [];
        const foundInSnab = [];
        const missingInListMat = [];
        
        for (const expense of expensesResult.rows) {
            const categoryName = expense.category_name;
            const materialName = expense.subcategory.trim();
            const isRequired = categoryName === 'Мат' || categoryName === 'Расход';
            
            // Проверяем наличие в _list_mat
            const listMatResult = await pool.query(
                'SELECT id FROM taiga._list_mat WHERE mat = $1 LIMIT 1',
                [materialName]
            );
            const inListMat = listMatResult.rows.length > 0;
            
            // Проверяем наличие в СНАБ
            const snabResult = await pool.query(
                `SELECT id FROM taiga.project_materials_estimate 
                 WHERE project_id = $1 AND material_name = $2 LIMIT 1`,
                [expense.project_id, materialName]
            );
            const inSnab = snabResult.rows.length > 0;
            
            if (!inSnab && isRequired) {
                missingInSnab.push({
                    id: expense.id,
                    date: expense.date,
                    category: categoryName,
                    material: materialName,
                    quantity: expense.quantity,
                    amount: expense.amount,
                    inListMat: inListMat
                });
            } else if (inSnab) {
                foundInSnab.push({
                    id: expense.id,
                    date: expense.date,
                    category: categoryName,
                    material: materialName
                });
            }
            
            if (!inListMat && isRequired) {
                missingInListMat.push({
                    id: expense.id,
                    date: expense.date,
                    category: categoryName,
                    material: materialName
                });
            }
        }
        
        // Выводим результаты
        if (missingInSnab.length > 0) {
            console.log('⚠️  МАТЕРИАЛЫ ИЗ КАТЕГОРИЙ "Мат" ИЛИ "Расход", КОТОРЫЕ НЕ НАЙДЕНЫ В СНАБ:');
            console.log('='.repeat(80));
            missingInSnab.forEach((item, idx) => {
                console.log(`\n${idx + 1}. ID: ${item.id} | ${item.date} | ${item.category}`);
                console.log(`   Материал: "${item.material}"`);
                console.log(`   Количество: ${item.quantity || '-'} | Сумма: ${item.amount || '-'}`);
                console.log(`   В _list_mat: ${item.inListMat ? '✅ Да' : '❌ Нет'}`);
            });
        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();


        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();
        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();


        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();
        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();


        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();
        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();


        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();
        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();


        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();
        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();


        }
        
        if (missingInListMat.length > 0) {
            console.log(`\n\n⚠️  МАТЕРИАЛЫ, КОТОРЫХ НЕТ В _list_mat (${missingInListMat.length}):`);
            console.log('='.repeat(80));
            missingInListMat.forEach((item, idx) => {
                console.log(`${idx + 1}. ID: ${item.id} | ${item.date} | "${item.material}"`);
            });
        }
        
        console.log(`\n\n✅ Найдено в СНАБ: ${foundInSnab.length} записей`);
        console.log(`⚠️  Не найдено в СНАБ (требуется действие): ${missingInSnab.length} записей`);
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await pool.end();
    }
}

checkExpenses();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);





const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);





const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);





const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);





const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);





const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);





const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function addMaterialsFromExpenses() {
    const client = await pool.connect();
    
    try {
        // Получаем ID категории "Мат"
        const catResult = await client.query(`
            SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1
        `);
        
        if (catResult.rows.length === 0) {
            throw new Error('Категория "Мат" не найдена в cat_expense!');
        }
        
        const matCategoryId = catResult.rows[0].id;
        console.log(`Категория "Мат" найдена: ID = ${matCategoryId}\n`);
        
        // Получаем все уникальные материалы из expenses с категорией "Мат"
        const expensesResult = await client.query(`
            SELECT DISTINCT 
                e.subcategory as material,
                e.unit_id,
                u.short_name as unit_name
            FROM taiga.expenses e
            LEFT JOIN taiga.cat_units u ON e.unit_id = u.id
            WHERE e.category_id = $1
                AND e.subcategory IS NOT NULL
                AND e.subcategory != ''
            ORDER BY e.subcategory
        `, [matCategoryId]);
        
        console.log(`Найдено материалов в expenses (категория "Мат"): ${expensesResult.rows.length}\n`);
        
        if (expensesResult.rows.length === 0) {
            console.log('Материалов для добавления не найдено.');
            return;
        }
        
        // Получаем ID единиц измерения
        const unitsResult = await client.query(`
            SELECT id, short_name 
            FROM taiga.cat_units
        `);
        
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.short_name] = row.id;
        });
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        console.log('Начинаем добавление материалов из expenses...\n');
        
        for (const expense of expensesResult.rows) {
            try {
                // Определяем unit_id
                let unitId = expense.unit_id;
                if (!unitId && expense.unit_name) {
                    unitId = unitsMap[expense.unit_name] || unitsMap['шт'];
                } else if (!unitId) {
                    unitId = unitsMap['шт']; // По умолчанию "шт"
                }
                
                const result = await client.query(`
                    INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (mat) DO NOTHING
                    RETURNING id
                `, [expense.material, matCategoryId, unitId]);
                
                if (result.rows.length > 0) {
                    inserted++;
                    console.log(`✅ Добавлено: "${expense.material}" (единица: ${expense.unit_name || 'шт'})`);
                } else {
                    skipped++;
                    console.log(`⏭️  Пропущено (уже существует): "${expense.material}"`);
                }
            } catch (error) {
                errors++;
                console.error(`❌ Ошибка при добавлении "${expense.material}":`, error.message);
            }
        }
        
        console.log(`\n\n📊 ИТОГИ:`);
        console.log(`  ✅ Добавлено: ${inserted}`);
        console.log(`  ⏭️  Пропущено (дубликаты): ${skipped}`);
        console.log(`  ❌ Ошибок: ${errors}`);
        console.log(`  📦 Всего обработано: ${expensesResult.rows.length}`);
        
        // Проверяем итоговое количество
        const countResult = await client.query('SELECT COUNT(*) as total FROM taiga._list_mat');
        console.log(`\n  📋 Всего записей в _list_mat: ${countResult.rows[0].total}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMaterialsFromExpenses().catch(console.error);

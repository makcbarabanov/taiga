const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testQuery() {
    try {
        const search = '50х200х6000';
        
        let query = `
            SELECT 
                lm.id,
                lm.mat,
                lm.cat_expense_id,
                ce.name as category_name,
                ce.icon as category_icon,
                lm.primary_unit,
                u1.short_name as primary_unit_name,
                lm.secondary_unit,
                u2.short_name as secondary_unit_name,
                lm.rules,
                lm.characteristics,
                lm.aliases
            FROM taiga._list_mat lm
            LEFT JOIN taiga.cat_expense ce ON lm.cat_expense_id = ce.id
            LEFT JOIN taiga.cat_units u1 ON lm.primary_unit::integer = u1.id
            LEFT JOIN taiga.cat_units u2 ON lm.secondary_unit::integer = u2.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        // Поиск по наименованию
        if (search) {
            query += ` AND (lm.mat ILIKE $${paramIndex} OR EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(COALESCE(lm.aliases, '[]'::jsonb)) alias 
                WHERE alias ILIKE $${paramIndex}
            ))`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ' ORDER BY lm.mat';
        
        console.log('SQL Query:', query);
        console.log('Params:', params);
        
        const result = await pool.query(query, params);
        console.log('\n✅ Результат:', result.rows.length, 'записей');
        result.rows.forEach(row => {
            console.log(`  - ID: ${row.id} | "${row.mat}"`);
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

testQuery();





const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testQuery() {
    try {
        const search = '50х200х6000';
        
        let query = `
            SELECT 
                lm.id,
                lm.mat,
                lm.cat_expense_id,
                ce.name as category_name,
                ce.icon as category_icon,
                lm.primary_unit,
                u1.short_name as primary_unit_name,
                lm.secondary_unit,
                u2.short_name as secondary_unit_name,
                lm.rules,
                lm.characteristics,
                lm.aliases
            FROM taiga._list_mat lm
            LEFT JOIN taiga.cat_expense ce ON lm.cat_expense_id = ce.id
            LEFT JOIN taiga.cat_units u1 ON lm.primary_unit::integer = u1.id
            LEFT JOIN taiga.cat_units u2 ON lm.secondary_unit::integer = u2.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        // Поиск по наименованию
        if (search) {
            query += ` AND (lm.mat ILIKE $${paramIndex} OR EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(COALESCE(lm.aliases, '[]'::jsonb)) alias 
                WHERE alias ILIKE $${paramIndex}
            ))`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ' ORDER BY lm.mat';
        
        console.log('SQL Query:', query);
        console.log('Params:', params);
        
        const result = await pool.query(query, params);
        console.log('\n✅ Результат:', result.rows.length, 'записей');
        result.rows.forEach(row => {
            console.log(`  - ID: ${row.id} | "${row.mat}"`);
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

testQuery();

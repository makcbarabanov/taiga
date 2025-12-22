const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();




const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();




const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();




const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();




const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();




const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();




const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkCategories() {
    try {
        const result = await pool.query(`
            SELECT id, name, icon 
            FROM taiga.cat_expense 
            ORDER BY name
        `);
        
        console.log('КАТЕГОРИИ В cat_expense:\n');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | ${row.icon || ''} ${row.name}`);
        });
        
        // Проверяем нужные категории
        const needed = ['Инструм', 'Расход', 'Мат'];
        console.log('\n\nПроверка наличия нужных категорий:');
        needed.forEach(name => {
            const found = result.rows.find(r => r.name === name);
            if (found) {
                console.log(`✅ ${name} - ID: ${found.id}`);
            } else {
                console.log(`❌ ${name} - НЕ НАЙДЕНА`);
            }
        });
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await pool.end();
    }
}

checkCategories();
// Интерактивный скрипт для восстановления удалённых расходов
// Помогает восстановить расходы по известным данным

const pool = require('../db');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function getCategoryId(categoryName) {
    const result = await pool.query(`
        SELECT id FROM taiga.expense_categories 
        WHERE name ILIKE $1 OR alias ILIKE $1
        LIMIT 1
    `, [`%${categoryName}%`]);
    return result.rows[0]?.id || null;
}

async function getProjectId(projectName) {
    const result = await pool.query(`
        SELECT id FROM taiga.projects 
        WHERE name ILIKE $1
        LIMIT 1
    `, [`%${projectName}%`]);
    return result.rows[0]?.id || null;
}

async function getShopId(shopName) {
    const result = await pool.query(`
        SELECT id FROM taiga.shops 
        WHERE name ILIKE $1
        LIMIT 1
    `, [`%${shopName}%`]);
    return result.rows[0]?.id || null;
}

async function getUnitId(unitName) {
    const result = await pool.query(`
        SELECT id FROM taiga.cat_units 
        WHERE name ILIKE $1 OR short_name ILIKE $1
        LIMIT 1
    `, [`%${unitName}%`]);
    return result.rows[0]?.id || null;
}

async function restoreExpense() {
    try {
        console.log('\n🔨 Восстановление удалённого расхода\n');
        console.log('Введите данные расхода (можно пропустить поля, нажав Enter):\n');

        // Дата
        const dateStr = await question('📅 Дата (формат: YYYY-MM-DD, например 2025-12-17): ');
        if (!dateStr || !dateStr.trim()) {
            console.log('❌ Дата обязательна!');
            return;
        }
        const date = dateStr.trim();

        // Сумма
        const amountStr = await question('💰 Сумма (обязательно): ');
        if (!amountStr || !amountStr.trim()) {
            console.log('❌ Сумма обязательна!');
            return;
        }
        const amount = parseFloat(amountStr.trim().replace(/\s/g, '').replace(',', '.'));

        // Категория
        const categoryName = await question('📂 Категория (например: Материалы, ФОТ, Накладные, Маржа): ');
        let categoryId = null;
        if (categoryName && categoryName.trim()) {
            categoryId = await getCategoryId(categoryName.trim());
            if (!categoryId) {
                console.log(`⚠️  Категория "${categoryName}" не найдена. Продолжаю без категории...`);
            } else {
                console.log(`✅ Найдена категория ID: ${categoryId}`);
            }
        }

        // Проект
        const projectName = await question('🏗️  Проект (например: Гостевой 5х8): ');
        let projectId = null;
        if (projectName && projectName.trim()) {
            projectId = await getProjectId(projectName.trim());
            if (!projectId) {
                console.log(`⚠️  Проект "${projectName}" не найден. Продолжаю без проекта...`);
            } else {
                console.log(`✅ Найден проект ID: ${projectId}`);
            }
        }

        // Подкатегория
        const subcategory = await question('📝 Подкатегория (например: Барабанов М.В., Продукты): ');

        // Магазин
        const shopName = await question('🏪 Магазин (например: Лента, Яндекс): ');
        let shopId = null;
        if (shopName && shopName.trim()) {
            shopId = await getShopId(shopName.trim());
            if (!shopId) {
                console.log(`⚠️  Магазин "${shopName}" не найден. Продолжаю без магазина...`);
            } else {
                console.log(`✅ Найден магазин ID: ${shopId}`);
            }
        }

        // Комментарий
        const comment = await question('💬 Комментарий: ');

        // Единица измерения
        const unitName = await question('📏 Единица измерения (например: шт, м², м): ');
        let unitId = null;
        if (unitName && unitName.trim()) {
            unitId = await getUnitId(unitName.trim());
            if (!unitId) {
                console.log(`⚠️  Единица "${unitName}" не найдена. Продолжаю без единицы...`);
            } else {
                console.log(`✅ Найдена единица ID: ${unitId}`);
            }
        }

        // Количество и цена
        let quantity = null;
        let price = null;
        if (unitId) {
            const quantityStr = await question('🔢 Количество: ');
            if (quantityStr && quantityStr.trim()) {
                quantity = parseFloat(quantityStr.trim().replace(',', '.'));
                const priceStr = await question('💵 Цена за единицу: ');
                if (priceStr && priceStr.trim()) {
                    price = parseFloat(priceStr.trim().replace(/\s/g, '').replace(',', '.'));
                }
            }
        }

        // Извлекаем месяц и год
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();

        // Подтверждение
        console.log('\n📋 Данные для восстановления:');
        console.log(`   Дата: ${date}`);
        console.log(`   Сумма: ${amount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`   Категория ID: ${categoryId || 'не указана'}`);
        console.log(`   Проект ID: ${projectId || 'не указан'}`);
        console.log(`   Подкатегория: ${subcategory || 'не указана'}`);
        console.log(`   Магазин ID: ${shopId || 'не указан'}`);
        console.log(`   Комментарий: ${comment || 'не указан'}`);
        if (unitId) {
            console.log(`   Единица ID: ${unitId}`);
            console.log(`   Количество: ${quantity || 'не указано'}`);
            console.log(`   Цена: ${price || 'не указана'}`);
        }

        const confirm = await question('\n✅ Восстановить этот расход? (y/n): ');
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'д') {
            console.log('❌ Отменено');
            return;
        }

        // Восстанавливаем расход
        const result = await pool.query(`
            INSERT INTO taiga.expenses 
            (date, month, year, category_id, subcategory, amount, project_id, shop_id, comment, unit_id, quantity, price)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            date, month, year, categoryId, subcategory || null, amount, 
            projectId, shopId || null, comment || null, unitId, quantity, price
        ]);

        console.log(`\n✅ Расход успешно восстановлен!`);
        console.log(`   ID: ${result.rows[0].id}`);
        console.log(`   Дата: ${result.rows[0].date}`);
        console.log(`   Сумма: ${result.rows[0].amount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);

    } catch (error) {
        console.error('❌ Ошибка при восстановлении:', error.message);
    }
}

async function main() {
    try {
        console.log('🔨 Восстановление удалённых расходов');
        console.log('='.repeat(50));
        console.log('Этот скрипт поможет восстановить расходы по известным данным.');
        console.log('Можно восстановить несколько расходов подряд.\n');

        let continueRestore = true;
        while (continueRestore) {
            await restoreExpense();
            
            const continueStr = await question('\n🔄 Восстановить ещё один расход? (y/n): ');
            continueRestore = continueStr.toLowerCase() === 'y' || continueStr.toLowerCase() === 'yes' || continueStr.toLowerCase() === 'д';
        }

        console.log('\n✅ Готово!');
    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        rl.close();
        await pool.end();
    }
}

main();













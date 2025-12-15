// ===========================================
// Импорт данных СНАБ для проекта
// ===========================================

const pool = require('../db');

// Данные для импорта
const supplyData = [
    // Сваи
    { category: 'Сваи', material_name: '108х2500 с оголовком 200х200', unit: 'шт', quantity: 1, price: 5000, cost: 5000 },
    
    // Окна
    { category: 'ПВХ-окно', material_name: '800х1600 с поворотно откидным механизмом 7024', unit: 'шт', quantity: 1, price: 13671, cost: 13671 },
    { category: 'ПВХ-окно', material_name: '1200х600 откидное 7024', unit: 'шт', quantity: 1, price: 9213, cost: 9213 },
    { category: 'ПВХ-окно', material_name: '1800х2000 с перемычкой 7024', unit: 'шт', quantity: 1, price: 22409, cost: 22409 },
    { category: 'ПВХ-окно', material_name: '500х500 7024', unit: 'шт', quantity: 1, price: 9483, cost: 9483 },
    { category: 'ПВХ-дверь', material_name: '900х2000 7024', unit: 'шт', quantity: 1, price: 35582, cost: 35582 },
    
    // Пиломатериал
    { category: 'Пиломат', material_name: '50х200х6000', unit: 'шт', quantity: 27, price: 1410, cost: 38070 },
    { category: 'Пиломат', material_name: '25х150х6000', unit: 'шт', quantity: 51, price: 530, cost: 27030 },
    { category: 'Пиломат', material_name: '45х195х6000', unit: 'шт', quantity: 3, price: 1560, cost: 4680 },
    { category: 'Пиломат', material_name: '28х140х6000', unit: 'шт', quantity: 16, price: 990, cost: 15840 },
    { category: 'Пиломат', material_name: '50х100х6000', unit: 'шт', quantity: 48, price: 711, cost: 34128 },
    { category: 'Пиломат', material_name: '50х150х6000', unit: 'шт', quantity: 19, price: 1060, cost: 20140 },
    { category: 'Пиломат', material_name: '20х50х3000', unit: 'шт', quantity: 230, price: 80, cost: 18400 },
    { category: 'Пиломат', material_name: '25х100х6000', unit: 'шт', quantity: 34, price: 320, cost: 10880 },
    { category: 'Пиломат', material_name: '45х145х6000', unit: 'шт', quantity: 14, price: 1170, cost: 16380 },
    { category: 'Пиломат', material_name: '20х120х6000', unit: 'шт', quantity: 43, price: 555, cost: 23865 },
    { category: 'Пиломат', material_name: '20х120х6000', unit: 'шт', quantity: 6, price: 555, cost: 3330 },
    { category: 'Пиломат', material_name: '100х100х6000', unit: 'шт', quantity: 2, price: 1230, cost: 2460 },
    
    // Утеплитель
    { category: 'Утеплитель', material_name: 'Утеплитель 50мм', unit: 'м³', quantity: 1.284, price: 3500, cost: 4494 },
    { category: 'Утеплитель', material_name: 'Утеплитель 100мм', unit: 'м³', quantity: 13.729, price: 3500, cost: 48052 },
    { category: 'Утеплитель', material_name: 'Белтермо', unit: 'шт', quantity: 30, price: 588, cost: 17640 },
    
    // Профлист
    { category: 'Профлист', material_name: 'L=2800 8шт', unit: 'м²', quantity: 33.6, price: 650, cost: 21840 },
    { category: 'Профлист', material_name: 'L=3200 5шт', unit: 'м²', quantity: 24, price: 650, cost: 15600 },
    { category: 'Профлист', material_name: 'L=2600 12шт', unit: 'м²', quantity: 46.8, price: 650, cost: 30420 },
    { category: 'Профлист', material_name: 'Коньковая L=3200', unit: 'шт', quantity: 4, price: 1000, cost: 4000 },
    { category: 'Профлист', material_name: 'Торцева L=3200', unit: 'шт', quantity: 4, price: 1000, cost: 4000 },
    { category: 'Профлист', material_name: 'Торцева L=2800', unit: 'шт', quantity: 4, price: 1000, cost: 4000 },
    { category: 'Профлист', material_name: 'Угол внешний L=3000', unit: 'шт', quantity: 4, price: 1000, cost: 4000 },
    { category: 'Профлист', material_name: 'Отлив L=3000', unit: 'шт', quantity: 1, price: 1000, cost: 1000 },
    { category: 'Профлист', material_name: 'Саморезы кровельные 72мм', unit: 'шт', quantity: 100, price: 7, cost: 700 },
    { category: 'Профлист', material_name: 'Саморезы кровельные 28мм', unit: 'шт', quantity: 1000, price: 4, cost: 4000 },
    { category: 'Профлист', material_name: 'Саморезы клопы 7024', unit: 'шт', quantity: 250, price: 1, cost: 250 },
    { category: 'Профлист', material_name: 'Краска по металлу 7024', unit: 'бал', quantity: 1, price: 700, cost: 700 },
    
    // Плёнки
    { category: 'Плёнки', material_name: 'Чёрная на фон 70м2', unit: 'шт', quantity: 1, price: 5000, cost: 5000 },
    { category: 'Плёнки', material_name: 'Скотч', unit: 'шт', quantity: 0, price: 600, cost: 0 },
    
    // Плиты
    { category: 'Плиты', material_name: 'ОСП 12х1250х2500', unit: 'шт', quantity: 11, price: 970, cost: 10670 },
    { category: 'Плиты', material_name: 'ЦСП 10х1250х3200', unit: 'шт', quantity: 1, price: 2050, cost: 2050 },
    
    // Отделка
    { category: 'Отделка', material_name: 'имитация', unit: 'м²', quantity: 110, price: 700, cost: 77000 },
    
    // Антисептик
    { category: 'Антисептик', material_name: 'ХМ-11 10л', unit: 'уп', quantity: 1, price: 896, cost: 896 }
];

async function importSupplyData() {
    const client = await pool.connect();
    try {
        // Нужно узнать project_id для проекта "Гостевой 5х8"
        const projectResult = await client.query(
            `SELECT id FROM taiga.projects WHERE name ILIKE '%гостевой%' OR name ILIKE '%5х8%' LIMIT 1`
        );
        
        if (projectResult.rows.length === 0) {
            console.error('❌ Проект "Феруз" не найден');
            return;
        }
        
        const projectId = projectResult.rows[0].id;
        console.log(`✅ Найден проект ID: ${projectId}\n`);
        
        // Получаем справочник единиц измерения
        const unitsResult = await client.query('SELECT id, name FROM taiga.units');
        const unitsMap = {};
        unitsResult.rows.forEach(row => {
            unitsMap[row.name.toLowerCase()] = row.id;
        });
        
        console.log('📦 Импортирую данные СНАБ...\n');
        
        await client.query('BEGIN');
        
        let imported = 0;
        let skipped = 0;
        
        for (const item of supplyData) {
            // Находим unit_id
            const unitName = item.unit.toLowerCase();
            let unitId = unitsMap[unitName];
            
            // Если единица не найдена, создаём её
            if (!unitId) {
                const newUnitResult = await client.query(
                    'INSERT INTO taiga.units (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [item.unit]
                );
                unitId = newUnitResult.rows[0].id;
                unitsMap[unitName] = unitId;
                console.log(`  ➕ Создана единица измерения: ${item.unit}`);
            }
            
            // Вставляем запись
            try {
                await client.query(
                    `INSERT INTO taiga.project_materials_estimate 
                     (project_id, category, material_name, unit_id, planned_quantity, planned_price, planned_cost)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [projectId, item.category, item.material_name, unitId, 
                     item.quantity, item.price, item.cost]
                );
                imported++;
            } catch (error) {
                console.error(`  ❌ Ошибка при импорте "${item.material_name}":`, error.message);
                skipped++;
            }
        }
        
        await client.query('COMMIT');
        
        console.log(`\n✅ Импорт завершён:`);
        console.log(`   Импортировано: ${imported}`);
        console.log(`   Пропущено: ${skipped}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка импорта:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

importSupplyData().catch(console.error);


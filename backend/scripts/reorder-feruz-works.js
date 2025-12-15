// ===========================================
// Изменение порядка работ для проекта Феруза
// ===========================================

const pool = require('../db');

async function reorderWorks() {
    try {
        const projectId = 1; // Гостевой 5х8
        
        // Порядок работ (как указал пользователь)
        const workOrder = [
            'Фундамент - Установка свай',
            'Подсобка - Погрузка/уборка/прочее',
            'Подсобка - Уборка снега',
            'Основа - Обвяз из 50х200, 50х100',
            'Основа - Сетка от грызунов',
            'Основа - Мембрана АМ',
            'Основа - Устройство лаг из доски 50х200х6000',
            'Основа - Контррейка под домом, 25х100х6000х6шт',
            'Основа - Утепление минплитой 200мм',
            'Основа - Пароизоляция В',
            'Основа - 25х150х27шт е.в.(перед половой)',
            'Основа - Устройство ОСП (сухая зона)',
            'Основа - Ламинат (сухая зона)',
            'Основа - ЦСП (су)',
            'Основа - Тёплый пол',
            'Основа - Керамогранит (СУ)',
            'Стены - 50х100хх6000',
            'Стены - 25х100х6000 раскос',
            'Стены - Полиэтилен 200мкр',
            'Стены - Скотч дельта',
            'Стены - Утепление 100мм',
            'Стены - Белтермо снаружи',
            'Стены - Контра 25х50 снаружи',
            'Стены - 22х95х6000 обрешётка под профлистна гвозди 60мм',
            'Стены - Профлист',
            'Стены - Угол внешний',
            'Стены - Планкен вдоль окон',
            'Окна - установка',
            'Окна - отделка внутри',
            'Двери - Уличная 900х2000 ПВХ - установка',
            'Двери - Уличная 900х2000 ПВХ - отделка внутри',
            'Двери - Межкомнатные - установка',
            'Двери - Межкомнатне - отделка',
            'Веранда - Планкен (окраска + монтаж)',
            'Веранда - Террасная доска 28х145 (окраска + монтаж)',
            'Потолок - Стропильная (изготовление + монтаж)',
            'Потолок - Пароизоляция',
            'Потолок - Обрешетка 25х100',
            'Потолок - Утепление 150мм',
            'Потолок - Мембрана АМ',
            'Потолок - Контррейка. Брусок 45х45х3000',
            'Потолок - Обрешетка кровли',
            'Потолок - Профлист 0,45 7024',
            'Потолок - Планки (торцевая, карнизная, конёк)',
            'Потолок - Имитация (окраска + монтаж)',
            'СУ-стены/потолок - Имитация (окраска+монтаж)',
            'СУ-пол - Керамогранит',
            'Эл - Разводка кабелей',
            'Эл - точки (р-10,в4,л-7)',
            'Эл - Щиток 2 автомата',
            'Эл - Ледлента',
            'Сантех - монтаж пп труб',
            'Сантех - монтаж водорозеток',
            'Сантех - монтаж коллектора',
            'Вентиляция - Приточные клапаны'
        ];
        
        // Получаем все работы проекта
        const allWorksRes = await pool.query(`
            SELECT pw.id, 
                   COALESCE(wsec.name || ' - ' || wt.name, wt.name, 'Работа без названия') as work_name,
                   wsec.name as section_name, 
                   wt.name as work_type_name
            FROM taiga.project_works pw
            LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
            LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
            WHERE pw.project_id = $1
        `, [projectId]);
        
        console.log(`Найдено работ в проекте: ${allWorksRes.rows.length}`);
        
        // Создаём мапу для быстрого поиска работ
        const workMap = new Map();
        allWorksRes.rows.forEach(work => {
            const workName = work.work_name;
            workMap.set(workName, work);
        });
        
        // Обновляем sort_order для работ из списка
        let sortOrder = 1;
        let foundCount = 0;
        let notFound = [];
        const processedIds = new Set();
        
        for (const workName of workOrder) {
            let work = workMap.get(workName);
            let found = false;
            
            if (work && !processedIds.has(work.id)) {
                await pool.query(`
                    UPDATE taiga.project_works
                    SET sort_order = $1
                    WHERE id = $2
                `, [sortOrder, work.id]);
                console.log(`${sortOrder}. ✅ ${workName} (ID: ${work.id})`);
                foundCount++;
                sortOrder++;
                processedIds.add(work.id);
                found = true;
            } else {
                // Пробуем найти по частичному совпадению
                const searchPart = workName.split(' - ')[1] || workName;
                for (const [key, value] of workMap.entries()) {
                    if (processedIds.has(value.id)) continue;
                    
                    const keyPart = key.split(' - ')[1] || key;
                    // Проверяем точное совпадение части после " - " или частичное
                    if (keyPart === searchPart || 
                        key.includes(searchPart) || 
                        searchPart.includes(keyPart) ||
                        key.toLowerCase().includes(workName.toLowerCase()) ||
                        workName.toLowerCase().includes(key.toLowerCase())) {
                        await pool.query(`
                            UPDATE taiga.project_works
                            SET sort_order = $1
                            WHERE id = $2
                        `, [sortOrder, value.id]);
                        console.log(`${sortOrder}. ⚠️  Найдено по совпадению: "${key}" → "${workName}" (ID: ${value.id})`);
                        foundCount++;
                        sortOrder++;
                        processedIds.add(value.id);
                        found = true;
                        break;
                    }
                }
            }
            
            if (!found) {
                notFound.push(workName);
                console.log(`❌ Не найдено: ${workName}`);
            }
        }
        
        // Для работ, которых нет в списке, ставим большой sort_order
        for (const [workName, work] of workMap.entries()) {
            if (!processedIds.has(work.id)) {
                await pool.query(`
                    UPDATE taiga.project_works
                    SET sort_order = $1
                    WHERE id = $2
                `, [sortOrder, work.id]);
                console.log(`${sortOrder}. 📌 Не в списке: ${workName} (ID: ${work.id})`);
                sortOrder++;
            }
        }
        
        console.log(`\n✅ Обновлено работ: ${foundCount}`);
        if (notFound.length > 0) {
            console.log(`\n⚠️  Не найдено работ: ${notFound.length}`);
            notFound.forEach(name => console.log(`   - ${name}`));
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

reorderWorks();


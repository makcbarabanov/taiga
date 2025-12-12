// ===========================================
// Скрипт импорта работ из CSV
// ===========================================
// Импортирует опись работ для проекта "Стеклянный Феруз 5х8 гостевой"
// ===========================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');

const pool = new Pool({
    host: process.env.DB_HOST || '83.217.220.97',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'default_db',
    user: process.env.DB_USER || 'marabot',
    password: process.env.DB_PASSWORD || '2nix8#mN&Er5tR'
});

// Устанавливаем схему
pool.on('connect', async (client) => {
    await client.query(`SET search_path TO taiga, public`);
});

// Путь к CSV файлу
const CSV_FILE = path.join(__dirname, '../../Экспорт/Стеклянный Феруз 5х8 гостевой - Работы (копия).csv');

// Маппинг этапов (вручную заданные пользователем)
const STAGE_MAPPING = {
    'Тёплый контур': [
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
        'Основа - ЦСП (су)',
        'Стены - 50х100хх6000',
        'Стены - 25х100х6000 раскос',
        'Стены - Полиэтилен 200мкр',
        'Стены - Утепление 100мм',
        'Стены - Белтермо снаружи',
        'Стены - Контра 25х50 снаружи',
        'Стены - 22х95х6000 обрешётка под профлистна гвозди 60мм',
        'Стены - Профлист',
        'Стены - Угол внешний',
        'Стены - Планкен вдоль окон',
        'Стены - Скотч дельта',
        'Окна - установка',
        'Двери - Уличная 900х2000 ПВХ - установка',
        'Веранда - Планкен (окраска + монтаж)',
        'Потолок - Стропильная (изготовление + монтаж)',
        'Потолок - Пароизоляция',
        'Потолок - Обрешетка 25х100',
        'Потолок - Утепление 150мм',
        'Потолок - Мембрана АМ',
        'Потолок - Контррейка. Брусок 45х45х3000',
        'Потолок - Обрешетка кровли',
        'Потолок - Профлист 0,45 7024',
        'Потолок - Планки (торцевая, карнизная, конёк)',
        'Вентиляция - Приточные клапаны',
        'Антисептирование пиломатериала'
    ],
    'Отделка': [
        'Основа - Ламинат (сухая зона)',
        'Основа - Тёплый пол',
        'Основа - Керамогранит (СУ)',
        'Стены - Имитация внутри',
        'Окна - отделка внутри',
        'Двери - Уличная 900х2000 ПВХ - отделка внутри',
        'Двери - Межкомнатные - установка',
        'Двери - Межкомнатне - отделка',
        'Веранда - Террасная доска 28х145 (окраска + монтаж)',
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
        'Плинтуса,'
    ]
};

// Маппинг разделов
const SECTION_PREFIXES = {
    'Фундамент': 'Фундамент',
    'Подсобка': 'Подсобка',
    'Основа': 'Основа',
    'Стены': 'Стены',
    'Окна': 'Окна',
    'Двери': 'Двери',
    'Веранда': 'Веранда',
    'Потолок': 'Потолок',
    'СУ-': 'СанУзел',
    'Эл': 'Электрика',
    'Сантех': 'Сантехника',
    'Вентиляция': 'Вентиляция',
    'Плинтуса': 'Общестрой',
    'Антисептирование': 'Общестрой'
};

// Маппинг единиц измерения
const UNIT_MAPPING = {
    'шт': 'штука',
    'м2': 'квадратный метр',
    'м.п.': 'метр',
    'час': 'час',
    'компл': 'комплект',
    'рулон': 'рулон'
};

async function importWorks() {
    try {
        console.log('🚀 Начало импорта работ из CSV...\n');

        // 1. Прочитать CSV файл
        const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
        const records = parse(csvContent, {
            columns: false,
            skip_empty_lines: false,
            relax_column_count: true,
            trim: true
        });

        console.log(`📄 Прочитано строк из CSV: ${records.length}\n`);

        // 2. Найти или создать проект
        const projectId = await findOrCreateProject();
        console.log(`✅ Проект найден/создан (ID: ${projectId})\n`);

        // 3. Загрузить справочники в память
        const stages = await loadStages();
        const sections = await loadSections();
        const units = await loadUnits();

        // 4. Обработать каждую строку
        let imported = 0;
        let skipped = 0;

        for (let i = 2; i < records.length; i++) { // Пропускаем заголовки
            const row = records[i];
            if (!row || row.length < 2) continue;

            const workNameFull = row[0]?.trim();
            
            // Пропускаем пустые строки и разделители
            if (!workNameFull || workNameFull === '-' || workNameFull === '') {
                skipped++;
                continue;
            }

            const unitNameRaw = row[1]?.trim() || '';
            const quantityStr = row[2]?.trim() || '0';
            
            // Преобразуем запятую в точку для десятичных чисел
            const quantity = parseFloat(quantityStr.replace(',', '.')) || 0;

            try {
                // Определяем раздел из префикса
                const sectionName = determineSection(workNameFull);
                if (!sectionName) {
                    console.log(`⚠️  Не удалось определить раздел для: "${workNameFull}"`);
                    skipped++;
                    continue;
                }

                // Определяем этап
                const stageName = determineStage(workNameFull);

                // Извлекаем вид работы (без префикса раздела)
                const workTypeName = extractWorkType(workNameFull, sectionName);

                // Нормализуем единицу измерения
                const unitName = normalizeUnit(unitNameRaw);
                
                // Получаем ID из справочников
                const stageId = stages[stageName];
                const sectionId = sections[sectionName];
                const unitId = units[unitName];
                
                // Логируем, если единица не найдена
                if (!unitId && unitNameRaw) {
                    console.log(`⚠️  Единица измерения не найдена: "${unitNameRaw}" (нормализовано: "${unitName}") для работы "${workNameFull}"`);
                }

                if (!stageId || !sectionId) {
                    console.log(`⚠️  Не найдены справочники для: "${workNameFull}"`);
                    skipped++;
                    continue;
                }

                // Создать или найти вид работы
                const workTypeId = await findOrCreateWorkType(workTypeName);

                // Создать или обновить работу
                await insertOrUpdateWork(projectId, {
                    stageId,
                    sectionId,
                    workTypeId,
                    unitId,
                    quantity,
                    sortOrder: imported + 1
                });

                imported++;
                if (imported % 10 === 0) {
                    console.log(`   Импортировано: ${imported}...`);
                }

            } catch (error) {
                console.error(`❌ Ошибка при обработке строки ${i}: "${workNameFull}"`, error.message);
                skipped++;
            }
        }

        console.log(`\n✅ Импорт завершён!`);
        console.log(`   Импортировано: ${imported}`);
        console.log(`   Пропущено: ${skipped}`);

    } catch (error) {
        console.error('❌ Критическая ошибка импорта:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

function normalizeUnit(unitName) {
    if (!unitName) return '';
    
    // Приводим к нижнему регистру для унификации
    let normalized = unitName.toLowerCase().trim();
    
    // Замены должны быть точными и в правильном порядке
    // Сначала обрабатываем полные слова, потом сокращения
    
    // Комплект - сначала, чтобы не перепутать с другими
    if (/^компл(ект)?\.?$/.test(normalized)) {
        return 'компл';
    }
    
    // Рулон
    if (/^рул(он(ов)?)?\.?$/.test(normalized)) {
        return 'рул';
    }
    
    // Квадратные метры
    if (/м\s*[²2]|кв\.?\s*м|м\.кв\.?|кв\.?м/i.test(normalized)) {
        return 'м2';
    }
    
    // Погонные метры (проверяем перед обычными метрами)
    if (/м\.?п\.?|погонн?\.?\s*м|п\.?\s*м/i.test(normalized)) {
        return 'м.п.';
    }
    
    // Часы
    if (/^ч(ас(ов)?)?\.?$/.test(normalized)) {
        return 'ч';
    }
    
    // Штуки
    if (/^шт(ук(а|и)?)?\.?$/.test(normalized)) {
        return 'шт';
    }
    
    // Метры (обычные)
    if (/^м(етр(ов)?)?\.?$/.test(normalized)) {
        return 'м';
    }
    
    // Возвращаем как есть, если не распознали
    return normalized;
}

function determineSection(workNameFull) {
    for (const [prefix, sectionName] of Object.entries(SECTION_PREFIXES)) {
        if (workNameFull.startsWith(prefix)) {
            return sectionName;
        }
    }
    return null;
}

function determineStage(workNameFull) {
    for (const [stageName, works] of Object.entries(STAGE_MAPPING)) {
        if (works.includes(workNameFull)) {
            return stageName;
        }
    }
    // Если не найдено в маппинге, пробуем определить по разделу
    const section = determineSection(workNameFull);
    if (section === 'Электрика' || section === 'Сантехника' || section === 'СанУзел') {
        return 'Отделка';
    }
    return 'Тёплый контур'; // По умолчанию
}

function extractWorkType(workNameFull, sectionName) {
    // Специальные случаи в первую очередь
    if (workNameFull.startsWith('СУ-')) {
        const workType = workNameFull.substring(3).trim();
        if (workType.startsWith('стены/потолок')) {
            return 'Имитация (окраска+монтаж)';
        } else if (workType.startsWith('пол')) {
            return 'Керамогранит';
        }
        return workType;
    }
    
    if (workNameFull === 'Плинтуса,') {
        return 'Плинтуса';
    }
    
    if (workNameFull === 'Антисептирование пиломатериала') {
        return 'Антисептирование пиломатериала';
    }
    
    // Убираем префикс раздела и дефис
    let workType = workNameFull;
    
    // Убираем префикс раздела
    for (const [prefix, section] of Object.entries(SECTION_PREFIXES)) {
        if (workNameFull.startsWith(prefix)) {
            workType = workNameFull.substring(prefix.length).trim();
            // Убираем дефис и пробелы в начале
            if (workType.startsWith('-')) {
                workType = workType.substring(1).trim();
            }
            break;
        }
    }

    return workType || workNameFull;
}

async function findOrCreateProject() {
    // Сначала пробуем найти существующий проект "Гостевой 5х8" с ID = 1
    const existingProject = await pool.query(
        'SELECT id FROM taiga.projects WHERE id = 1 AND name LIKE $1',
        ['%5х8%']
    );
    
    if (existingProject.rows.length > 0) {
        console.log(`✅ Используется существующий проект ID: ${existingProject.rows[0].id}`);
        return existingProject.rows[0].id;
    }
    
    // Если не нашли, ищем любой проект с таким названием
    const projectResult = await pool.query(
        'SELECT id FROM taiga.projects WHERE name LIKE $1 ORDER BY id LIMIT 1',
        ['%5х8%']
    );
    
    if (projectResult.rows.length > 0) {
        console.log(`✅ Используется существующий проект ID: ${projectResult.rows[0].id}`);
        return projectResult.rows[0].id;
    }
    
    // Если не нашли, ищем или создаём клиента
    let clientId;
    const clientResult = await pool.query(
        'SELECT id FROM taiga.clients WHERE name LIKE $1 ORDER BY id LIMIT 1',
        ['%Феруз%']
    );

    if (clientResult.rows.length === 0) {
        const insertResult = await pool.query(
            'INSERT INTO taiga.clients (name) VALUES ($1) RETURNING id',
            ['Феруз']
        );
        clientId = insertResult.rows[0].id;
    } else {
        clientId = clientResult.rows[0].id;
    }

    // Создаём новый проект только если не нашли существующий
    const insertResult = await pool.query(
        'INSERT INTO taiga.projects (client_id, name, status) VALUES ($1, $2, $3) RETURNING id',
        [clientId, 'Гостевой 5х8', 'В работе']
    );
    console.log(`✅ Создан новый проект ID: ${insertResult.rows[0].id}`);
    return insertResult.rows[0].id;
}

async function loadStages() {
    const result = await pool.query('SELECT id, name FROM taiga.work_stages');
    const stages = {};
    result.rows.forEach(row => {
        stages[row.name] = row.id;
    });
    return stages;
}

async function loadSections() {
    const result = await pool.query('SELECT id, name FROM taiga.work_sections');
    const sections = {};
    result.rows.forEach(row => {
        sections[row.name] = row.id;
    });
    return sections;
}

async function loadUnits() {
    const result = await pool.query('SELECT id, short_name, name FROM taiga.units');
    const units = {};
    result.rows.forEach(row => {
        if (row.short_name) units[row.short_name] = row.id;
        units[row.name] = row.id;
    });
    
    // Нормализация и маппинг различных вариантов написания единиц
    // Квадратные метры - ищем ID для квадратного метра
    const m2Id = units['м²'] || units['квадратный метр'];
    if (m2Id) {
        units['м2'] = m2Id;
        units['м²'] = m2Id;
        units['м.кв.'] = m2Id;
        units['м.кв'] = m2Id;
        units['кв.м'] = m2Id;
        units['кв.м.'] = m2Id;
        units['кв м'] = m2Id;
        units['квм'] = m2Id;
    }
    
    // Метры (погонные) - ищем ID для метра
    const mId = units['м'] || units['метр'];
    if (mId) {
        units['м.п.'] = mId;
        units['м.п'] = mId;
        units['м'] = mId;
        units['п.м'] = mId;
        units['п.м.'] = mId;
    }
    
    // Часы - ищем ID для часа
    const hId = units['ч'] || units['час'];
    if (hId) {
        units['ч'] = hId;
        units['час'] = hId;
        units['часов'] = hId;
        units['ч.'] = hId;
    }
    
    // Штуки - ищем ID для штуки
    const pcsId = units['шт'] || units['штука'];
    if (pcsId) {
        units['шт'] = pcsId;
        units['штука'] = pcsId;
        units['шт.'] = pcsId;
        units['шт '] = pcsId;
    }
    
    // Комплекты - ищем ID для комплекта
    const setId = units['компл'] || units['комплект'];
    if (setId) {
        units['компл'] = setId;
        units['комплект'] = setId;
        units['компл.'] = setId;
        units['компл '] = setId;
        units['ком.п.л'] = setId; // Исправляем неправильную нормализацию
    }
    
    // Рулоны - ищем ID для рулона
    const rollId = units['рул'] || units['рулон'];
    if (rollId) {
        units['рул'] = rollId;
        units['рулон'] = rollId;
        units['рул.'] = rollId;
        units['рул '] = rollId;
    }
    
    return units;
}

async function findOrCreateWorkType(name) {
    let result = await pool.query(
        'SELECT id FROM taiga.work_types WHERE name = $1',
        [name]
    );

    if (result.rows.length === 0) {
        result = await pool.query(
            'INSERT INTO taiga.work_types (name) VALUES ($1) RETURNING id',
            [name]
        );
    }

    return result.rows[0].id;
}

async function insertOrUpdateWork(projectId, work) {
    // Проверяем, существует ли уже такая работа
    const existing = await pool.query(
        `SELECT id FROM taiga.p_feruz 
         WHERE project_id = $1 AND stage_id = $2 AND section_id = $3 AND work_type_id = $4`,
        [projectId, work.stageId, work.sectionId, work.workTypeId]
    );

    if (existing.rows.length > 0) {
        // Обновляем существующую
        await pool.query(
            `UPDATE taiga.p_feruz 
             SET quantity = $1, unit_id = $2, sort_order = $3, updated_at = NOW()
             WHERE id = $4`,
            [work.quantity, work.unitId, work.sortOrder, existing.rows[0].id]
        );
    } else {
        // Создаём новую
        await pool.query(
            `INSERT INTO taiga.p_feruz 
             (project_id, stage_id, section_id, work_type_id, unit_id, quantity, sort_order, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [projectId, work.stageId, work.sectionId, work.workTypeId, work.unitId, work.quantity, work.sortOrder, 'В процессе']
        );
    }
}

// Запуск
if (require.main === module) {
    importWorks().catch(console.error);
}

module.exports = { importWorks };


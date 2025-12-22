// Поиск спорных позиций в списке материалов
const materials = [
    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}




    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}

    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}




    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}

    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}




    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}

    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}




    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}

    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}




    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}

    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}




    // Расход
    { name: 'Карандаш', category: 'Расход', unit: 'шт' },
    { name: 'Маркер', category: 'Расход', unit: 'шт' },
    { name: 'Перчатки', category: 'Расход', unit: 'шт' },
    { name: 'Мешки для мусора', category: 'Расход', unit: 'шт' },
    { name: 'Головка 13мм', category: 'Расход', unit: 'шт' },
    { name: 'Головка 8мм', category: 'Расход', unit: 'шт' },
    { name: 'Струбцина', category: 'Расход', unit: 'шт' },
    { name: 'Ведро', category: 'Расход', unit: 'шт' },
    { name: 'Кисточка', category: 'Расход', unit: 'шт' },
    { name: 'Степлер мебельный', category: 'Расход', unit: 'шт' },
    { name: 'Диски по металлу на УШМ 125мм', category: 'Расход', unit: 'шт' },
    { name: 'Бита РН-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-2', category: 'Расход', unit: 'шт' },
    { name: 'Бита PZ-3', category: 'Расход', unit: 'шт' },
    { name: 'Сверло по дереву 5мм', category: 'Расход', unit: 'шт' },
    { name: 'Нож для утеплителя', category: 'Расход', unit: 'шт' },
    { name: 'Ножовка ручная по дереву', category: 'Расход', unit: 'шт' },
    { name: 'Нож канцелярский 18мм', category: 'Расход', unit: 'шт' },
    { name: 'Диск по бетону 125мм на УШМ', category: 'Расход', unit: 'шт' },
    { name: 'Тарелка для шлиф', category: 'Расход', unit: 'шт' },
    { name: 'Замочек', category: 'Расход', unit: 'шт' },
    { name: 'Метла', category: 'Расход', unit: 'шт' },
    { name: 'Очки защитные', category: 'Расход', unit: 'шт' },
    { name: 'Лопата для снега', category: 'Расход', unit: 'шт' },
    
    // Инструм
    { name: 'Бокорезы 160мм Hester', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка диэлектрическая плоская 1000В', category: 'Инструм', unit: 'шт' },
    { name: 'Отвертка плоская индикаторная', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ Атом', category: 'Инструм', unit: 'шт' },
    { name: 'УШМ 125мм Елитек', category: 'Инструм', unit: 'шт' },
    { name: 'Коронки по дереву 70и80мм', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник', category: 'Инструм', unit: 'шт' },
    { name: 'Пылесос 20л', category: 'Инструм', unit: 'шт' },
    { name: 'Набор из 4х инструментов Makkita', category: 'Инструм', unit: 'шт' },
    { name: 'Ручная пила', category: 'Инструм', unit: 'шт' },
    { name: 'Ножовка по дереву', category: 'Инструм', unit: 'шт' },
    { name: 'Струбцина F-образная быстрозажимная', category: 'Инструм', unit: 'шт' },
    { name: 'Угольник Sparta 323445, 300 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Пистолет для монтажной пены', category: 'Инструм', unit: 'шт' },
    { name: 'Плиткорез', category: 'Инструм', unit: 'шт' },
    { name: 'Правило', category: 'Инструм', unit: 'шт' },
    { name: 'Уровень Kapro', category: 'Инструм', unit: 'шт' },
    { name: 'Паяльник для п/п труб', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата штыковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата совковая', category: 'Инструм', unit: 'шт' },
    { name: 'Лопата снеговая', category: 'Инструм', unit: 'шт' },
    { name: 'Фрезер сетевой кромочный', category: 'Инструм', unit: 'шт' },
    { name: 'Ключ комбинированный Sparta 150465 19 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Насадка угловая Vertextools', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка по металлу 105 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамике Vira 559516 40 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка керамограниту и керамике Vira 110 мм', category: 'Инструм', unit: 'шт' },
    { name: 'Коронка алмазная по керамограниту и керамике Vira 60 мм', category: 'Инструм', unit: 'шт' },
];

// Группируем по базовому наименованию
const grouped = {};
materials.forEach(m => {
    // Извлекаем базовое название (первое слово или ключевое слово)
    let normalized = m.name.toLowerCase();
    
    // Убираем детали в скобках
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Убираем марки и модели
    normalized = normalized.replace(/\b(sparta|hester|makkita|atom|елитек|vertextools|vira|kapro)\s*\d*/gi, '');
    
    // Убираем размеры и единицы
    normalized = normalized.replace(/\d+[хx]\d+/g, '');
    normalized = normalized.replace(/\d+\s*мм/gi, '');
    normalized = normalized.replace(/\d+\s*л/gi, '');
    normalized = normalized.replace(/\d+\s*в/gi, '');
    normalized = normalized.replace(/\d+/g, '');
    
    // Убираем лишние слова-модификаторы
    normalized = normalized.replace(/\b(f-образная|быстрозажимная|ручная|диэлектрическая|индикаторная|плоская|сетевая|кромочная|алмазная|по\s+дереву|по\s+металлу|по\s+бетону|по\s+керамике|по\s+керамограниту|для\s+утеплителя|для\s+снега|штыковая|совковая|снеговая|канцелярский)\b/gi, '');
    
    // Убираем множественные пробелы
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    if (!grouped[normalized]) {
        grouped[normalized] = [];
    }
    grouped[normalized].push(m);
});

// Находим спорные (где одно название в разных категориях)
const conflicts = [];
Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length > 1) {
        conflicts.push({
            normalized: key,
            items: items,
            categories: categories
        });
    }
});

console.log('СПОРНЫЕ ПОЗИЦИИ (одно наименование в разных категориях):\n');
conflicts.forEach((conflict, idx) => {
    console.log(`${idx + 1}. "${conflict.normalized}"`);
    conflict.items.forEach(item => {
        console.log(`   - ${item.category}: "${item.name}" (${item.unit})`);
    });
    console.log('');
});

if (conflicts.length === 0) {
    console.log('Спорных позиций не найдено. Все наименования уникальны по категориям.');
}

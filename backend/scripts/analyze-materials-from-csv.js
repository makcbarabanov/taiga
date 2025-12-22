// ===========================================
// Анализ материалов из CSV файла
// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}




// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}

// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}




// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}

// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}




// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}

// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}




// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}

// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}




// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}

// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}




// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    // Простой CSV парсер с учётом кавычек
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Двойные кавычки - экранирование
                    current += '"';
                    i++; // Пропускаем следующую кавычку
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    let lineNum = 0;
    dataLines.forEach(line => {
        lineNum++;
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();      // Категория
            const subcategory = parts[6]?.trim();   // Подкатегория (название материала)
            const unit = parts[7]?.trim();          // Ед. изм.
            const quantity = parts[8]?.trim();      // Кол-во
            
            if (category === 'Мат' && subcategory && subcategory !== 'Мат') {
                const key = subcategory.toLowerCase();
                if (!materials.has(key)) {
                    materials.set(key, {
                        subcategory: subcategory,
                        units: new Set(),
                        examples: []
                    });
                }
                
                const material = materials.get(key);
                if (unit) material.units.add(unit);
                if (quantity && unit) {
                    material.examples.push({
                        quantity: quantity,
                        unit: unit
                    });
                }
            }
        }
    });
    
    console.log(`Найдено уникальных материалов: ${materials.size}\n`);
    
    // Группируем по типам
    const groups = {
        'Пиломатериал': [],
        'Утеплитель': [],
        'Профлист/Белтермо': [],
        'Кабель/Провод': [],
        'Крепеж': [],
        'Прочее': []
    };
    
    materials.forEach((material, key) => {
        const sub = material.subcategory.toLowerCase();
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub)) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    console.log('Группы материалов:');
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`\n${groupName} (${groups[groupName].length}):`);
            groups[groupName].slice(0, 10).forEach(m => {
                console.log(`  - ${m.subcategory} [${Array.from(m.units).join(', ')}]`);
            });
            if (groups[groupName].length > 10) {
                console.log(`  ... и ещё ${groups[groupName].length - 10}`);
            }
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}

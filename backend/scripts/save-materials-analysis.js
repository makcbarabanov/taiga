// ===========================================
// Сохранение анализа материалов из CSV
// ===========================================

const fs = require('fs');
const path = require('path');

const csvPath = 'E:\\Forge\\Экспорт\\Тайга (общая таблица)\\Тайга 2023 - Рас.csv';

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
                current += '"';
                i++;
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

try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const materials = new Map();
    
    dataLines.forEach(line => {
        if (!line.trim() || line.startsWith(',')) return;
        
        const parts = parseCSVLine(line);
        if (parts.length >= 9) {
            const category = parts[5]?.trim();
            const subcategory = parts[6]?.trim();
            const unit = parts[7]?.trim();
            const quantity = parts[8]?.trim();
            
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
        if (sub.includes('х') && /\d+[хx]\d+/.test(sub) && !sub.includes('профлист') && !sub.includes('профнастил')) {
            groups['Пиломатериал'].push(material);
        } else if (sub.includes('утеплитель') || sub.includes('минплита') || sub.includes('кнауф') || sub.includes('изоляция') || sub.includes('пенополистирол') || sub.includes('пеноплекс')) {
            groups['Утеплитель'].push(material);
        } else if (sub.includes('профлист') || sub.includes('белтермо') || sub.includes('профнастил')) {
            groups['Профлист/Белтермо'].push(material);
        } else if (sub.includes('кабель') || sub.includes('провод') || sub.includes('ввг')) {
            groups['Кабель/Провод'].push(material);
        } else if (sub.includes('саморез') || sub.includes('гвозд') || sub.includes('дюбель') || sub.includes('шуруп') || sub.includes('глухарь')) {
            groups['Крепеж'].push(material);
        } else {
            groups['Прочее'].push(material);
        }
    });
    
    // Сохраняем результаты в JSON
    const output = {
        total_materials: materials.size,
        groups: {}
    };
    
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            output.groups[groupName] = groups[groupName].map(m => ({
                name: m.subcategory,
                units: Array.from(m.units),
                examples: m.examples.slice(0, 3) // Первые 3 примера
            }));
        }
    });
    
    const outputPath = path.join(__dirname, '../../materials_analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`✅ Анализ сохранён в ${outputPath}`);
    console.log(`\nВсего материалов: ${materials.size}`);
    Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length > 0) {
            console.log(`${groupName}: ${groups[groupName].length}`);
        }
    });
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}




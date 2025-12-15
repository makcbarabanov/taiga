const line = ',,05.05.2023,   5,  2 023,Мат,"Кабель ВВГ НГ 3х2,5 бухта 100м",шт,   2,  6 200,  12 400,Анна Анатолий,Отделка,Раздел 1а. Электрика,,,,,';

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

const parts = parseCSVLine(line);
console.log('Всего частей:', parts.length);
console.log('Часть 4 (индекс 4):', parts[4]);
console.log('Часть 5 (индекс 5):', parts[5]);
console.log('Часть 6 (индекс 6):', parts[6]);
console.log('Часть 7 (индекс 7):', parts[7]);




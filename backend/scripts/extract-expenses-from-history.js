const fs = require('fs');
const path = require('path');

// Пути к файлам истории (относительно E:\Forge)
const basePath = path.resolve(__dirname, '../../../..');
const historyFiles = [
    path.join(basePath, 'Экспорт/cursor_powershell_lines_146_168.md'),
    path.join(basePath, '_history/dialogues/CHAT_2025-12-10.md'),
    path.join(basePath, '_history/dialogues/dialogue-18-10-2025-taiga.md'),
    path.join(basePath, '_history/dialogues/cursor_.md'),
];

// Паттерны для поиска расходов
const expensePatterns = [
    // Формат: "сумма руб" или "сумма ₽"
    /(\d+[\s,.]?\d*)\s*(?:руб|₽|рублей|рубля)/gi,
    // Формат: "цена: сумма" или "цена сумма"
    /(?:цена|стоимость|сумма|amount)[\s:]*(\d+[\s,.]?\d*)/gi,
    // Формат: "расход сумма" или "expense сумма"
    /(?:расход|expense)[\s:]*(\d+[\s,.]?\d*)/gi,
    // Формат: "дата сумма категория"
    /(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})[\s\S]{0,100}?(\d+[\s,.]?\d*)\s*(?:руб|₽)/gi,
];

// Категории расходов для поиска
const categoryKeywords = [
    'магазин', 'shop', 'категория', 'category', 'подкатегория', 'subcategory',
    'снаб', 'материалы', 'материал', 'material', 'expense', 'расход',
    'транспорт', 'топливо', 'бензин', 'аренда', 'аренда мастерской',
    'фот', 'зарплата', 'сотрудник', 'employee',
    'накладные', 'прочие', 'прочее',
];

// Магазины для поиска
const shopKeywords = [
    'леруа', 'leroy', 'максидом', 'maxidom', 'оби', 'obi',
    'стройка', 'строительный', 'строймаркет',
    'яндекс', 'yandex', 'тинькофф', 'tinkoff',
    'белтермо', 'beltermo', 'кнауф', 'knauf',
    'доборные', 'доборные элементы',
];

async function readFileSafe(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Файл не найден: ${filePath}`);
            return null;
        }
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`📄 ${path.basename(filePath)}: ${sizeMB} MB`);
        
        // Для больших файлов читаем построчно
        if (stats.size > 100 * 1024 * 1024) { // > 100 MB
            console.log(`   ⚠️  Большой файл, обработка по частям...`);
            return readLargeFile(filePath);
        }
        
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`❌ Ошибка чтения ${filePath}:`, error.message);
        return null;
    }
}

function readLargeFile(filePath) {
    // Читаем построчно для экономии памяти
    const content = [];
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    let buffer = '';
    let lineCount = 0;
    
    return new Promise((resolve, reject) => {
        fileStream.on('data', (chunk) => {
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Последняя неполная строка
            content.push(...lines);
            lineCount += lines.length;
            if (lineCount % 100000 === 0) {
                process.stdout.write(`   Обработано строк: ${lineCount.toLocaleString()}\r`);
            }
        });
        
        fileStream.on('end', () => {
            if (buffer) content.push(buffer);
            console.log(`   ✅ Прочитано строк: ${content.length.toLocaleString()}`);
            resolve(content.join('\n'));
        });
        
        fileStream.on('error', reject);
    });
}

function extractExpenses(text, filePath) {
    const expenses = [];
    
    // Разбиваем на блоки по разделителям **User** и **Cursor**
    const blocks = text.split(/\*\*User\*\*/);
    
    // Обрабатываем только блоки пользователя (пропускаем первый, если он пустой)
    for (let blockIndex = 1; blockIndex < blocks.length; blockIndex++) {
        const userBlock = blocks[blockIndex].split(/\*\*Cursor\*\*/)[0]; // Берем только часть до ответа Cursor
        const lines = userBlock.split('\n');
        
        // Ищем в блоке пользователя
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const context = lines.slice(Math.max(0, i - 2), Math.min(i + 10, lines.length)).join(' ');
            
            // Ищем даты в формате ДД.ММ.ГГГГ или ДД.ММ.ГГ или ДД-ММ-ГГГГ
            const datePatterns = [
                /(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/g,
                /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/g, // ГГГГ-ММ-ДД
            ];
            
            let dateMatch = null;
            let date = null;
            
            for (const pattern of datePatterns) {
                const matches = [...context.matchAll(pattern)];
                if (matches.length > 0) {
                    const match = matches[0];
                    if (pattern === datePatterns[0]) {
                        // ДД.ММ.ГГГГ
                        const day = match[1].padStart(2, '0');
                        const month = match[2].padStart(2, '0');
                        const year = match[3].length === 2 ? `20${match[3]}` : match[3];
                        date = `${year}-${month}-${day}`;
                    } else {
                        // ГГГГ-ММ-ДД
                        date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
                    }
                    dateMatch = match;
                    break;
                }
            }
            
            if (!dateMatch) continue;
            
            // Ищем суммы в контексте (руб, ₽, рублей)
            const amountPatterns = [
                /(\d+[\s,.]?\d*)\s*(?:руб|₽|рублей|рубля|руб\.)/gi,
                /(?:цена|стоимость|сумма|amount|расход)[\s:]*(\d+[\s,.]?\d*)/gi,
            ];
            
            let amount = null;
            for (const pattern of amountPatterns) {
                const matches = [...context.matchAll(pattern)];
                if (matches.length > 0) {
                    const amountStr = matches[0][1].replace(/[^\d,.]/g, '').replace(',', '.').replace(/\s/g, '');
                    const parsed = parseFloat(amountStr);
                    if (!isNaN(parsed) && parsed > 0 && parsed < 10000000) { // Разумные пределы
                        amount = parsed;
                        break;
                    }
                }
            }
            
            if (!amount) continue;
            
            // Ищем категорию
            let category = null;
            for (const keyword of categoryKeywords) {
                if (context.toLowerCase().includes(keyword.toLowerCase())) {
                    category = keyword;
                    break;
                }
            }
            
            // Ищем магазин
            let shop = null;
            for (const keyword of shopKeywords) {
                if (context.toLowerCase().includes(keyword.toLowerCase())) {
                    shop = keyword;
                    break;
                }
            }
            
            // Извлекаем описание (первые 200 символов контекста)
            let description = context.substring(0, 200).trim();
            // Убираем лишние пробелы и переносы строк
            description = description.replace(/\s+/g, ' ').trim();
            
            // Проверяем, не дублируем ли мы уже найденный расход
            const isDuplicate = expenses.some(exp => 
                exp.date === date && 
                Math.abs(exp.amount - amount) < 0.01 &&
                exp.description.substring(0, 50) === description.substring(0, 50)
            );
            
            if (!isDuplicate) {
                expenses.push({
                    date,
                    amount,
                    category: category || 'не указана',
                    shop: shop || 'не указан',
                    description: description || 'без описания',
                    source: path.basename(filePath),
                    blockIndex: blockIndex,
                    context: context.substring(0, 500),
                });
            }
        }
    }
    
    return expenses;
}

async function main() {
    console.log('🔍 Поиск расходов в истории чатов...\n');
    
    const allExpenses = [];
    
    for (const filePath of historyFiles) {
        console.log(`\n📂 Обработка: ${filePath}`);
        const content = await readFileSafe(filePath);
        if (!content) continue;
        
        console.log(`   Поиск расходов...`);
        const expenses = extractExpenses(content, filePath);
        console.log(`   ✅ Найдено расходов: ${expenses.length}`);
        
        allExpenses.push(...expenses);
    }
    
    console.log(`\n\n📊 ИТОГО найдено расходов: ${allExpenses.length}\n`);
    
    // Группируем по датам
    const byDate = {};
    allExpenses.forEach(exp => {
        if (!byDate[exp.date]) byDate[exp.date] = [];
        byDate[exp.date].push(exp);
    });
    
    // Выводим результаты
    console.log('📅 Расходы по датам:\n');
    Object.keys(byDate).sort().forEach(date => {
        console.log(`\n${date}:`);
        byDate[date].forEach(exp => {
            console.log(`  - ${exp.amount.toFixed(2)} руб | ${exp.category} | ${exp.shop} | ${exp.description.substring(0, 50)}`);
            console.log(`    Источник: ${exp.source}, строка ${exp.lineNumber}`);
        });
    });
    
    // Сохраняем в JSON
    const outputPath = path.join(__dirname, 'extracted-expenses.json');
    fs.writeFileSync(outputPath, JSON.stringify(allExpenses, null, 2), 'utf8');
    console.log(`\n\n💾 Результаты сохранены в: ${outputPath}`);
    
    // Создаем SQL скрипт для восстановления
    const sqlPath = path.join(__dirname, 'restore-expenses-from-history.sql');
    let sql = `-- Восстановление расходов из истории чатов\n`;
    sql += `-- Сгенерировано: ${new Date().toISOString()}\n\n`;
    sql += `BEGIN;\n\n`;
    
    allExpenses.forEach((exp, index) => {
        const id = index + 1;
        sql += `-- Расход #${id} из ${exp.source}\n`;
        sql += `INSERT INTO taiga.expenses (date, amount, category_id, shop_id, description, project_id, created_at)\n`;
        sql += `VALUES (\n`;
        sql += `  '${exp.date}',\n`;
        sql += `  ${exp.amount},\n`;
        sql += `  (SELECT id FROM taiga.cat_expense WHERE name ILIKE '%${exp.category}%' LIMIT 1),\n`;
        sql += `  (SELECT id FROM taiga.shops WHERE name ILIKE '%${exp.shop}%' LIMIT 1),\n`;
        sql += `  '${exp.description.replace(/'/g, "''")}',\n`;
        sql += `  1, -- project_id (Феруз)\n`;
        sql += `  NOW()\n`;
        sql += `) ON CONFLICT DO NOTHING;\n\n`;
    });
    
    sql += `COMMIT;\n`;
    
    fs.writeFileSync(sqlPath, sql, 'utf8');
    console.log(`📝 SQL скрипт создан: ${sqlPath}`);
    console.log(`\n⚠️  ВНИМАНИЕ: Перед выполнением SQL скрипта проверьте данные!`);
}

main().catch(console.error);


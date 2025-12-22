// Скрипт для обновления меню во всех HTML файлах
const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../../frontend');
const htmlFiles = [
    'taiga.html',
    'income.html',
    'cash.html',
    'journal.html',
    'shops.html',
    'employees.html',
    'rules.html'
];

const headerIcons = `
                    <a href="rules.html" title="Правила обучения распознавания расходов" style="font-size: 24px; text-decoration: none; color: var(--secondary-color); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.2)'; this.style.color='#2980b9';" onmouseout="this.style.transform='scale(1)'; this.style.color='var(--secondary-color)';">
                        📚
                    </a>
                    <a href="catalogs.html" title="Справочники работ и материалов" style="font-size: 24px; text-decoration: none; color: var(--secondary-color); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.2)'; this.style.color='#2980b9';" onmouseout="this.style.transform='scale(1)'; this.style.color='var(--secondary-color)';">
                        📋
                    </a>
                    <a href="catalogs.html" title="Справочник работ" style="font-size: 24px; text-decoration: none; color: var(--secondary-color); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.2)'; this.style.color='#2980b9';" onmouseout="this.style.transform='scale(1)'; this.style.color='var(--secondary-color)';">
                        ⚒️
                    </a>`;

const navRight = `
                <div class="nav-right">
                    <a href="shops.html" class="nav-link directory-link">Маги</a>
                    <a href="employees.html" class="nav-link directory-link">Сотрудники</a>
                </div>`;

htmlFiles.forEach(file => {
    const filePath = path.join(frontendDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Файл ${file} не найден, пропускаем`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Обновляем header icons
    const headerIconPattern = /(<div style="display: flex; gap: 15px; align-items: center;">[\s\S]*?<\/div>\s*<\/h1>)/;
    if (headerIconPattern.test(content)) {
        content = content.replace(headerIconPattern, (match) => {
            if (!match.includes('📋') || !match.includes('⚒️')) {
                // Заменяем старые иконки на новые
                const newMatch = match.replace(
                    /<a href="rules\.html"[^>]*>📋<\/a>/,
                    headerIcons.trim()
                );
                if (newMatch !== match) {
                    modified = true;
                    return newMatch;
                }
                // Если нет иконок вообще, добавляем
                if (!match.includes('📋')) {
                    modified = true;
                    return match.replace('</div>', headerIcons + '\n                </div>');
                }
            }
            return match;
        });
    }
    
    // Убираем "Справочники" из nav-right
    content = content.replace(
        /<a href="catalogs\.html"[^>]*>Справочники<\/a>/g,
        ''
    );
    
    // Обновляем nav-right
    const navRightPattern = /<div class="nav-right">[\s\S]*?<\/div>/;
    if (navRightPattern.test(content)) {
        content = content.replace(navRightPattern, (match) => {
            if (match.includes('Справочники') || !match.includes('Маги')) {
                modified = true;
                return navRight.trim();
            }
            return match;
        });
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Обновлён ${file}`);
    } else {
        console.log(`⏭️  ${file} не требует изменений`);
    }
});

console.log('\n✅ Обновление меню завершено!');


// ===========================================
// Загрузка правил из MD файла в БД
// ===========================================

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function loadRulesToDB() {
    try {
        // Читаем MD файл
        const mdPath = path.join(__dirname, '../../ПРАВИЛА_ЗАПИСИ_РАСХОДОВ.md');
        const mdContent = fs.readFileSync(mdPath, 'utf8');
        
        // Парсим MD и разбиваем на секции
        const sections = parseMarkdown(mdContent);
        
        // Очищаем старые данные (кроме статистики, которая будет обновляться отдельно)
        await pool.query('DELETE FROM taiga.rules WHERE section != \'statistics\'');
        
        // Вставляем секции
        for (const section of sections) {
            await pool.query(`
                INSERT INTO taiga.rules (section, title, content, sort_order)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT DO NOTHING
            `, [section.section, section.title, section.content, section.sortOrder]);
        }
        
        console.log(`✅ Загружено ${sections.length} секций правил в БД`);
        await pool.end();
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        await pool.end();
        process.exit(1);
    }
}

function parseMarkdown(md) {
    const sections = [];
    const lines = md.split('\n');
    let currentSection = null;
    let currentContent = [];
    let sortOrder = 1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Заголовок H1
        if (line.startsWith('# ')) {
            if (currentSection) {
                sections.push({
                    section: currentSection.section,
                    title: currentSection.title,
                    content: convertMarkdownToHTML(currentContent.join('\n')),
                    sortOrder: currentSection.sortOrder
                });
            }
            currentSection = {
                section: 'intro',
                title: line.replace('# ', '').trim(),
                sortOrder: sortOrder++
            };
            currentContent = [];
            continue;
        }
        
        // Заголовок H2
        if (line.startsWith('## ')) {
            if (currentSection) {
                sections.push({
                    section: currentSection.section,
                    title: currentSection.title,
                    content: convertMarkdownToHTML(currentContent.join('\n')),
                    sortOrder: currentSection.sortOrder
                });
            }
            const title = line.replace('## ', '').trim();
            const sectionKey = title.toLowerCase()
                .replace(/[^a-zа-я0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            currentSection = {
                section: sectionKey,
                title: title,
                sortOrder: sortOrder++
            };
            currentContent = [];
            continue;
        }
        
        // Заголовок H3
        if (line.startsWith('### ')) {
            currentContent.push(line);
            continue;
        }
        
        // Разделитель
        if (line.trim() === '---') {
            if (currentContent.length > 0) {
                currentContent.push('<hr>');
            }
            continue;
        }
        
        // Обычная строка
        if (currentSection) {
            currentContent.push(line);
        }
    }
    
    // Добавляем последнюю секцию
    if (currentSection) {
        sections.push({
            section: currentSection.section,
            title: currentSection.title,
            content: convertMarkdownToHTML(currentContent.join('\n')),
            sortOrder: currentSection.sortOrder
        });
    }
    
    return sections;
}

function convertMarkdownToHTML(md) {
    let html = md;
    
    // Жирный текст
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Код
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Блоки кода
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Списки
    html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    
    // Параграфы
    html = html.split('\n\n').map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<')) return p; // Уже HTML
        if (p.startsWith('#')) return p; // Заголовок
        if (p.startsWith('<li>')) return '<ul>' + p + '</ul>'; // Список
        return '<p>' + p + '</p>';
    }).join('\n');
    
    // Заголовки H3
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    return html;
}

loadRulesToDB();




-- ===========================================
-- Создание таблицы для хранения правил обучения
-- ===========================================

-- 1. Создаём таблицу rules
CREATE TABLE IF NOT EXISTS taiga.rules (
    id SERIAL PRIMARY KEY,
    section VARCHAR(100) NOT NULL, -- Раздел (например, "БЕЛТЕРМО и Профлист", "Общие принципы")
    title VARCHAR(200), -- Заголовок раздела
    content TEXT NOT NULL, -- Содержимое раздела (HTML или Markdown)
    sort_order INTEGER DEFAULT 0, -- Порядок отображения
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE taiga.rules IS 'Правила обучения классификации расходов';
COMMENT ON COLUMN taiga.rules.section IS 'Раздел правил (например, "БЕЛТЕРМО и Профлист")';
COMMENT ON COLUMN taiga.rules.title IS 'Заголовок раздела';
COMMENT ON COLUMN taiga.rules.content IS 'Содержимое раздела в формате HTML';
COMMENT ON COLUMN taiga.rules.sort_order IS 'Порядок отображения разделов';

-- 2. Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_rules_section ON taiga.rules(section);
CREATE INDEX IF NOT EXISTS idx_rules_sort_order ON taiga.rules(sort_order);

-- 3. Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION taiga.update_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_rules_updated_at ON taiga.rules;
CREATE TRIGGER trigger_update_rules_updated_at
    BEFORE UPDATE ON taiga.rules
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_rules_updated_at();

-- 5. Вставляем начальные данные (статистика будет обновляться отдельно)
INSERT INTO taiga.rules (section, title, content, sort_order) VALUES
('intro', 'Введение', '<p>Этот файл содержит правила форматирования расходов для разных типов материалов. Эти правила используются при добавлении расходов в режиме обучения ("expense learning mode").</p><p><strong>Важно:</strong> Эти правила применяются <strong>после</strong> определения категории расхода. Они описывают, как правильно заполнять поля "Подкатегория", "Единица измерения", "Количество" и "Комментарий" для разных типов материалов.</p>', 1),
('statistics', 'Статистика обучения', '<div class="statistics-box"><h3>📊 Статистика обучения</h3><p>Статистика будет обновляться автоматически после каждой сессии обучения.</p></div>', 2)
ON CONFLICT DO NOTHING;

SELECT '✅ Таблица taiga.rules создана' AS result;




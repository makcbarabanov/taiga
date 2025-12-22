-- ===========================================
-- ТАБЛИЦА ПРАВИЛ КЛАССИФИКАЦИИ РАСХОДОВ
-- ===========================================
-- Хранит правила для автоматического определения категории расходов
-- ===========================================

SET search_path TO taiga, public;

-- 1. Создаём таблицу правил классификации
CREATE TABLE IF NOT EXISTS taiga.expense_classification_rules (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL, -- 'pattern', 'employee', 'material_pattern', 'keyword'
    pattern TEXT NOT NULL, -- Шаблон для поиска (регулярное выражение или точное совпадение)
    category_id INTEGER NOT NULL REFERENCES taiga.expense_categories(id) ON DELETE RESTRICT,
    requires_comment BOOLEAN DEFAULT FALSE, -- Требуется ли комментарий (для Маржи)
    priority INTEGER DEFAULT 0, -- Приоритет правила (больше = выше)
    description TEXT, -- Описание правила для понимания
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE -- Можно временно отключить правило
);

COMMENT ON TABLE taiga.expense_classification_rules IS 'Правила для автоматической классификации расходов';
COMMENT ON COLUMN taiga.expense_classification_rules.rule_type IS 'Тип правила: pattern (регулярное выражение), employee (имя сотрудника), material_pattern (шаблон материала), keyword (ключевое слово)';
COMMENT ON COLUMN taiga.expense_classification_rules.pattern IS 'Шаблон для поиска в тексте расхода';
COMMENT ON COLUMN taiga.expense_classification_rules.requires_comment IS 'Обязательно ли заполнение комментария (для личных денег Макса)';

-- 2. Индексы
CREATE INDEX IF NOT EXISTS idx_classification_rules_type ON taiga.expense_classification_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_classification_rules_category ON taiga.expense_classification_rules(category_id);
CREATE INDEX IF NOT EXISTS idx_classification_rules_active ON taiga.expense_classification_rules(is_active, priority DESC);

-- 3. Триггер для updated_at
CREATE TRIGGER update_classification_rules_updated_at
    BEFORE UPDATE ON taiga.expense_classification_rules
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- 4. Добавляем начальные правила на основе примеров
-- ВАЖНО: Маржа используется только для личных денег Макса (Барабанов М.В.)
-- ФОТ используется только для сотрудников (список берётся из employees со статусом 'Работает')

-- Маржа (личные деньги Макса) - требует комментарий
-- ПРАВИЛО: У категории "Маржа" есть ТОЛЬКО ОДНА подкатегория - "Барабанов М.В."
-- При выборе категории "Маржа" подкатегория ВСЕГДА автоматически = "Барабанов М.В."
-- В комментарии указывается описание расхода (например, "массаж", "хозтовары (шапка, задярка) Лента" и т.д.)
-- Примечание: Барабанов М.В. больше не в ФОТ, только в Маржа
-- Используем категорию с name = 'Маржа' (ID 8), а не 'Прибыль'
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('keyword', 'Макс', (SELECT id FROM taiga.expense_categories WHERE name = 'Маржа' LIMIT 1), TRUE, 100, 'Личные деньги Макса (Барабанов М.В.) - требуют комментария'),
    ('keyword', 'Барабанов', (SELECT id FROM taiga.expense_categories WHERE name = 'Маржа' LIMIT 1), TRUE, 100, 'Личные деньги Макса (Барабанов М.В.) - требуют комментария'),
    ('keyword', 'М.В.', (SELECT id FROM taiga.expense_categories WHERE name = 'Маржа' LIMIT 1), TRUE, 100, 'Личные деньги Макса (Барабанов М.В.) - требуют комментария')
ON CONFLICT DO NOTHING;

-- ФОТ (сотрудники) - правила создаются автоматически на основе employees со статусом 'Работает'
-- Здесь добавляем только базовые правила для имён, которые точно являются сотрудниками
-- Основная логика: при выборе категории ФОТ показывать выпадающий список сотрудников со статусом 'Работает'
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('employee', 'Жура', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Жура'),
    ('employee', 'Даня', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Даня'),
    ('employee', 'Балуев', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Балуев'),
    ('employee', 'Сирожутдин', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Сирожутдин'),
    ('employee', 'Алексей', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Алексей'),
    ('employee', 'Жасур', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Жасур'),
    ('employee', 'Хуснидин', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Хуснидин'),
    ('employee', 'Ринат', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Ринат'),
    ('employee', 'Фуркат', (SELECT id FROM taiga.expense_categories WHERE alias = 'ФОТ'), FALSE, 90, 'Сотрудник Фуркат')
ON CONFLICT DO NOTHING;

-- Материалы (шаблоны размеров)
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('material_pattern', '\d+[хxXХ]\d+[хxXХ]\d+', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 80, 'Материал по шаблону размеров (например, 50х150х6000)'),
    ('keyword', 'м²', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 70, 'Ключевое слово: квадратные метры'),
    ('keyword', 'м2', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 70, 'Ключевое слово: квадратные метры'),
    ('keyword', 'кг', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 70, 'Ключевое слово: килограммы'),
    ('keyword', 'шт', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 70, 'Ключевое слово: штуки (для материалов)')
ON CONFLICT DO NOTHING;

-- ТЗР
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('keyword', 'Аренда', (SELECT id FROM taiga.expense_categories WHERE alias = 'ТЗР'), FALSE, 85, 'Транспорт: аренда'),
    ('keyword', 'Газель', (SELECT id FROM taiga.expense_categories WHERE alias = 'ТЗР'), FALSE, 85, 'Транспорт: Газель'),
    ('keyword', 'Доставка', (SELECT id FROM taiga.expense_categories WHERE alias = 'ТЗР'), FALSE, 85, 'Транспорт: доставка')
ON CONFLICT DO NOTHING;

-- Накладные
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('keyword', 'Бензин', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: бензин'),
    ('keyword', 'Продукты', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: продукты'),
    ('keyword', 'Делимобиль', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: делимобиль'),
    ('keyword', 'Матиз', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: матиз'),
    ('keyword', 'Т-Мобайл', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: мобильная связь (Т-Мобайл)'),
    ('keyword', 'Мобайл', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: мобильная связь'),
    ('keyword', 'связь', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: связь'),
    ('keyword', 'мобильная связь', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: мобильная связь'),
    ('keyword', 'Газпромнефть', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: Газпромнефть (обычно заправки, но может быть хозтовары)'),
    ('keyword', 'Татнефть', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: Татнефть (бензин, учитывать кэшбэк)'),
    ('keyword', 'Пятёрочка', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: продукты (Пятёрочка)'),
    ('keyword', 'Верный', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: продукты (Верный)'),
    ('keyword', 'Шав24БМ', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: продукты/фастфуд'),
    ('keyword', 'фастфуд', (SELECT id FROM taiga.expense_categories WHERE alias = 'Накл'), FALSE, 75, 'Накладные: фастфуд')
ON CONFLICT DO NOTHING;

-- Инструменты
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('keyword', 'Перфоратор', (SELECT id FROM taiga.expense_categories WHERE alias = 'Инстр'), FALSE, 75, 'Инструмент: перфоратор'),
    ('keyword', 'УШМ', (SELECT id FROM taiga.expense_categories WHERE alias = 'Инстр'), FALSE, 75, 'Инструмент: угловая шлифовальная машина'),
    ('keyword', 'Пылесос', (SELECT id FROM taiga.expense_categories WHERE alias = 'Инстр'), FALSE, 75, 'Инструмент: пылесос'),
    ('keyword', 'домкрат', (SELECT id FROM taiga.expense_categories WHERE alias = 'Инстр'), FALSE, 75, 'Инструмент: домкрат')
ON CONFLICT DO NOTHING;

-- Расходные материалы
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('keyword', 'мешки для мусора', (SELECT id FROM taiga.expense_categories WHERE alias = 'Расх'), FALSE, 75, 'Расходные: мешки для мусора'),
    ('keyword', 'мешок', (SELECT id FROM taiga.expense_categories WHERE alias = 'Расх'), FALSE, 75, 'Расходные: мешки'),
    ('keyword', 'шлифкруг', (SELECT id FROM taiga.expense_categories WHERE alias = 'Расх'), FALSE, 75, 'Расходные: шлифкруги для УШМ'),
    ('keyword', 'шлифкруги', (SELECT id FROM taiga.expense_categories WHERE alias = 'Расх'), FALSE, 75, 'Расходные: шлифкруги для УШМ')
ON CONFLICT DO NOTHING;

-- Материалы (магазины/поставщики)
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('keyword', 'Тамбовская 50', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 75, 'Материалы: ООО Тамбовская 50 (профлист, производитель)'),
    ('keyword', 'ООО Тамбовская', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 75, 'Материалы: ООО Тамбовская 50'),
    ('keyword', 'профлист', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 80, 'Материалы: профлист'),
    ('keyword', 'профнастил', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 80, 'Материалы: профнастил'),
    ('keyword', 'муфта', (SELECT id FROM taiga.expense_categories WHERE alias = 'Мат'), FALSE, 75, 'Материалы: сантехническая муфта')
ON CONFLICT DO NOTHING;

-- Маржа (личные деньги Макса)
INSERT INTO taiga.expense_classification_rules (rule_type, pattern, category_id, requires_comment, priority, description) VALUES
    ('keyword', 'code-top', (SELECT id FROM taiga.expense_categories WHERE name = 'Маржа' LIMIT 1), TRUE, 100, 'Маржа: code-top (личные деньги, требует комментарий)')
ON CONFLICT DO NOTHING;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Таблица expense_classification_rules создана';
    RAISE NOTICE '✅ Добавлены начальные правила классификации';
END $$;


END $$;


END $$;


END $$;


END $$;


END $$;


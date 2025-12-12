-- ===========================================
-- СОЗДАНИЕ СПРАВОЧНИКОВ ДЛЯ РАБОТ
-- ===========================================
-- Этапы, Разделы, Виды работ
-- ===========================================

SET search_path TO taiga, public;

-- 1. СПРАВОЧНИК ЭТАПОВ
CREATE TABLE IF NOT EXISTS taiga.work_stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_stages IS 'Справочник этапов работ (Тёплый контур, Отделка)';

INSERT INTO taiga.work_stages (name, sort_order) VALUES
    ('Тёплый контур', 1),
    ('Отделка', 2)
ON CONFLICT (name) DO NOTHING;

-- 2. СПРАВОЧНИК РАЗДЕЛОВ
CREATE TABLE IF NOT EXISTS taiga.work_sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    alias VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_sections IS 'Справочник разделов работ (Фундамент, Основа, Стены и т.д.)';
COMMENT ON COLUMN taiga.work_sections.alias IS 'Сокращение для отображения (например, ВЕНТ, Эл, СУ)';

INSERT INTO taiga.work_sections (name, alias, sort_order) VALUES
    ('Фундамент', 'Фунд', 1),
    ('Подсобка', 'Подс', 2),
    ('Основа', 'Осн', 3),
    ('Стены', 'Стен', 4),
    ('Окна', 'Окна', 5),
    ('Двери', 'Двер', 6),
    ('Веранда', 'Вер', 7),
    ('Потолок', 'Пот', 8),
    ('СанУзел', 'СУ', 9),
    ('Электрика', 'Эл', 10),
    ('Сантехника', 'Сантех', 11),
    ('Вентиляция', 'ВЕНТ', 12),
    ('Общестрой', 'Общ', 13)
ON CONFLICT (name) DO NOTHING;

-- 3. СПРАВОЧНИК ВИДОВ РАБОТ
CREATE TABLE IF NOT EXISTS taiga.work_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_types IS 'Справочник видов работ (без префикса раздела, например "Установка свай", "Утепление 200мм")';

CREATE INDEX IF NOT EXISTS idx_work_types_name ON taiga.work_types(name);

-- Сообщение об успешном создании
DO $$
BEGIN
    RAISE NOTICE '✅ Справочники для работ успешно созданы!';
    RAISE NOTICE '   - work_stages (этапы)';
    RAISE NOTICE '   - work_sections (разделы)';
    RAISE NOTICE '   - work_types (виды работ)';
END $$;


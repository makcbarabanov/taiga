-- Миграция 41: Создание таблицы _list_mat и перенос данных из materials_directory

SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ _list_mat
-- ===========================================
-- Удаляем таблицу, если она уже существует со старой структурой
DROP TABLE IF EXISTS taiga._list_mat CASCADE;

CREATE TABLE taiga._list_mat (
    id SERIAL PRIMARY KEY,
    mat VARCHAR(255) NOT NULL UNIQUE,
    cat_expense_id INTEGER REFERENCES taiga.cat_expense(id),
    primary_unit VARCHAR(50),
    secondary_unit VARCHAR(50),
    rules JSONB,
    characteristics JSONB DEFAULT '{}'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb
);

COMMENT ON TABLE taiga._list_mat IS 'Справочник всех материалов с единицами измерения, правилами и алиасами';
COMMENT ON COLUMN taiga._list_mat.mat IS 'Наименование материала';
COMMENT ON COLUMN taiga._list_mat.cat_expense_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga._list_mat.primary_unit IS 'Основная единица измерения. Если заполнена только она - простой материал, если заполнены обе (primary_unit и secondary_unit) - сложный материал';
COMMENT ON COLUMN taiga._list_mat.secondary_unit IS 'Вторая единица измерения для сложных материалов. Если заполнена - материал сложный';
COMMENT ON COLUMN taiga._list_mat.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga._list_mat.characteristics IS 'Дополнительные характеристики (JSONB)';
COMMENT ON COLUMN taiga._list_mat.aliases IS 'Алиасы материала (JSONB массив строк)';

CREATE INDEX IF NOT EXISTS idx_list_mat_cat_expense_id ON taiga._list_mat(cat_expense_id);
CREATE INDEX IF NOT EXISTS idx_list_mat_mat ON taiga._list_mat(mat);

-- ===========================================
-- 2. ПЕРЕНОС ДАННЫХ ИЗ materials_directory
-- ===========================================
-- Переносим все записи из materials_directory в _list_mat
-- По умолчанию все материалы относятся к категории "Мат"
INSERT INTO taiga._list_mat (
    mat,
    cat_expense_id,
    primary_unit,
    secondary_unit,
    rules,
    characteristics,
    aliases
)
SELECT 
    md.name as mat,
    (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1) as cat_expense_id,
    COALESCE(md.primary_unit, md.primary_unit_complex) as primary_unit,
    md.secondary_unit_complex as secondary_unit,
    md.rules,
    md.characteristics,
    COALESCE(md.aliases, '[]'::jsonb) as aliases
FROM taiga.materials_directory md
ON CONFLICT (mat) DO NOTHING;

-- ===========================================
-- 3. ОБНОВЛЕНИЕ СВЯЗАННЫХ ТАБЛИЦ
-- ===========================================
-- Добавляем поле material_id в project_materials_estimate для связи с _list_mat
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS material_id INTEGER REFERENCES taiga._list_mat(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.material_id IS 'ID материала из справочника _list_mat';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_id 
    ON taiga.project_materials_estimate(material_id);

-- ===========================================
-- 4. УДАЛЕНИЕ ТАБЛИЦЫ materials_directory
-- ===========================================
-- Сначала проверяем, что все данные перенесены
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM taiga.materials_directory;
    SELECT COUNT(*) INTO target_count FROM taiga._list_mat;
    
    IF source_count = target_count THEN
        DROP TABLE IF EXISTS taiga.materials_directory CASCADE;
        RAISE NOTICE '✅ Таблица materials_directory удалена (перенесено % записей)', target_count;
    ELSE
        RAISE WARNING '⚠️ Количество записей не совпадает: materials_directory = %, _list_mat = %', source_count, target_count;
        RAISE NOTICE 'Таблица materials_directory НЕ удалена. Проверьте данные вручную.';
    END IF;
END $$;

SELECT '✅ Миграция 41 выполнена: создана таблица _list_mat, данные перенесены' AS result;

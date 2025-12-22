-- Миграция 36: Переименование справочников с префиксом cat_ и добавление иконок

SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;

SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;




SET search_path TO taiga, public;

-- ===========================================
-- 1. ПЕРЕИМЕНОВАНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ===========================================

-- Переименование единиц измерения
ALTER TABLE IF EXISTS taiga.units RENAME TO cat_units;

-- Переименование категорий расходов
ALTER TABLE IF EXISTS taiga.expense_categories RENAME TO cat_expense;

-- Переименование категорий ресурсов
ALTER TABLE IF EXISTS taiga.resource_categories RENAME TO cat_resource_type;

-- ===========================================
-- ОБНОВЛЕНИЕ ВНЕШНИХ КЛЮЧЕЙ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ===========================================
-- PostgreSQL автоматически обновляет внешние ключи при переименовании таблиц,
-- но нужно обновить ссылки в других таблицах, которые используют старые названия

-- Обновление ссылок в project_works (если есть)
-- ALTER TABLE taiga.project_works DROP CONSTRAINT IF EXISTS project_works_unit_id_fkey;
-- ALTER TABLE taiga.project_works ADD CONSTRAINT project_works_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в project_materials_estimate
-- ALTER TABLE taiga.project_materials_estimate DROP CONSTRAINT IF EXISTS project_materials_estimate_unit_id_fkey;
-- ALTER TABLE taiga.project_materials_estimate ADD CONSTRAINT project_materials_estimate_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);

-- Обновление ссылок в work_resources
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_unit_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_unit_id_fkey 
--     FOREIGN KEY (unit_id) REFERENCES taiga.cat_units(id);
-- ALTER TABLE taiga.work_resources DROP CONSTRAINT IF EXISTS work_resources_resource_category_id_fkey;
-- ALTER TABLE taiga.work_resources ADD CONSTRAINT work_resources_resource_category_id_fkey 
--     FOREIGN KEY (resource_category_id) REFERENCES taiga.cat_resource_categories(id);

-- Обновление ссылок в expenses
-- ALTER TABLE taiga.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
-- ALTER TABLE taiga.expenses ADD CONSTRAINT expenses_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES taiga.cat_expense_categories(id);

-- ===========================================
-- 2. ДОБАВЛЕНИЕ ИКОНОК В КАТЕГОРИИ РАСХОДОВ
-- ===========================================

ALTER TABLE taiga.cat_expense 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

COMMENT ON COLUMN taiga.cat_expense.icon IS 'Иконка для отображения категории (эмодзи)';

-- Заполнение иконок
UPDATE taiga.cat_expense SET icon = '📦' WHERE name = 'Мат';
UPDATE taiga.cat_expense SET icon = '👷' WHERE name = 'ФОТ';
UPDATE taiga.cat_expense SET icon = '🚚' WHERE name = 'ТЗР';
UPDATE taiga.cat_expense SET icon = '💼' WHERE name = 'Накладные';
UPDATE taiga.cat_expense SET icon = '🔧' WHERE name = 'Инструм';
UPDATE taiga.cat_expense SET icon = '🧰' WHERE name = 'Расход';
UPDATE taiga.cat_expense SET icon = '💰' WHERE name = 'Прибыль';

-- ===========================================
-- 3. СОЗДАНИЕ НОВЫХ СПРАВОЧНИКОВ
-- ===========================================

-- Справочник работ
CREATE TABLE IF NOT EXISTS taiga.cat_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_work IS 'Справочник работ с единицами измерения';
COMMENT ON COLUMN taiga.cat_work.name IS 'Наименование работы';
COMMENT ON COLUMN taiga.cat_work.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_work_name ON taiga.cat_work(name);
CREATE INDEX IF NOT EXISTS idx_cat_work_unit_id ON taiga.cat_work(unit_id);

-- Справочник ресурсов
CREATE TABLE IF NOT EXISTS taiga.cat_resource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expense_category_id INTEGER REFERENCES taiga.cat_expense(id),
    resource_category_id INTEGER REFERENCES taiga.cat_expense(id),
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cat_resource IS 'Справочник ресурсов (материалы, инструменты, расходники, накладные) с единицами измерения';
COMMENT ON COLUMN taiga.cat_resource.name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.cat_resource.expense_category_id IS 'ID категории расходов (Мат, ФОТ, ТЗР и т.д.)';
COMMENT ON COLUMN taiga.cat_resource.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.cat_resource.unit_id IS 'ID единицы измерения';

CREATE INDEX IF NOT EXISTS idx_cat_resource_name ON taiga.cat_resource(name);
CREATE INDEX IF NOT EXISTS idx_cat_resource_expense_category_id ON taiga.cat_resource(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_resource_category_id ON taiga.cat_resource(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_cat_resource_unit_id ON taiga.cat_resource(unit_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cat_work_updated_at
    BEFORE UPDATE ON taiga.cat_work
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cat_resource_updated_at
    BEFORE UPDATE ON taiga.cat_resource
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

SELECT '✅ Миграция 36 выполнена: справочники переименованы, иконки добавлены, новые справочники созданы' AS result;

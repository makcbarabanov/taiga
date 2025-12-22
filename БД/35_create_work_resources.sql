-- Создание таблицы ресурсов работ и справочника категорий ресурсов

-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;




-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;

-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;




-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;

-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;




-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;

-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;




-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;

-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;




-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;

-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;




-- ===========================================
-- 1. КАТЕГОРИИ РЕСУРСОВ
-- ===========================================
-- Категории ресурсов теперь берутся из cat_expense (Мат, Инструм, Расход, Накладные)
-- Таблица cat_resource_type больше не нужна

-- ===========================================
-- 2. ТАБЛИЦА РЕСУРСОВ РАБОТ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.work_resources (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES taiga.project_works(id) ON DELETE CASCADE,
    resource_category_id INTEGER NOT NULL REFERENCES taiga.cat_expense(id) ON DELETE RESTRICT,
    material_name VARCHAR(255) NOT NULL, -- Наименование ресурса (материал, инструмент и т.д.)
    unit_id INTEGER REFERENCES taiga.cat_units(id),
    quantity DECIMAL(10, 2) NOT NULL, -- Количество ресурса для данной работы
    is_shared BOOLEAN DEFAULT FALSE, -- Если TRUE - ресурс общий (не суммируется), если FALSE - суммируется
    notes TEXT, -- Примечания (например, "для всех работ")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.work_resources IS 'Ресурсы, необходимые для выполнения работ';
COMMENT ON COLUMN taiga.work_resources.work_id IS 'ID работы';
COMMENT ON COLUMN taiga.work_resources.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';
COMMENT ON COLUMN taiga.work_resources.material_name IS 'Наименование ресурса';
COMMENT ON COLUMN taiga.work_resources.quantity IS 'Количество ресурса для данной работы';
COMMENT ON COLUMN taiga.work_resources.is_shared IS 'Если TRUE - ресурс общий (не суммируется между работами), если FALSE - суммируется';

CREATE INDEX IF NOT EXISTS idx_work_resources_work_id ON taiga.work_resources(work_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_category_id ON taiga.work_resources(resource_category_id);
CREATE INDEX IF NOT EXISTS idx_work_resources_material_name ON taiga.work_resources(material_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_work_resources_updated_at
    BEFORE UPDATE ON taiga.work_resources
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- ===========================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ project_materials_estimate
-- ===========================================
-- Добавляем поле category_id для связи с категориями ресурсов
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS resource_category_id INTEGER REFERENCES taiga.cat_expense(id);

COMMENT ON COLUMN taiga.project_materials_estimate.resource_category_id IS 'ID категории расходов (Мат, Инструм, Расход, Накладные)';

-- Добавляем поле work_resource_id для связи с ресурсами работ
ALTER TABLE taiga.project_materials_estimate 
    ADD COLUMN IF NOT EXISTS work_resource_id INTEGER REFERENCES taiga.work_resources(id) ON DELETE SET NULL;

COMMENT ON COLUMN taiga.project_materials_estimate.work_resource_id IS 'ID ресурса работы (если материал добавлен из ресурсов работ)';

-- Обновляем существующие записи: по умолчанию все материалы
UPDATE taiga.project_materials_estimate 
SET resource_category_id = (SELECT id FROM taiga.cat_expense WHERE name = 'Мат' LIMIT 1)
WHERE resource_category_id IS NULL;

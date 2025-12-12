-- ===========================================
-- СОЗДАНИЕ ТАБЛИЦ ДЛЯ КЛИЕНТОВ
-- ===========================================
-- Таблицы для страницы клиента:
-- статистика, работы, снаб, журнал, табель
-- ===========================================

SET search_path TO taiga, public;

-- ===========================================
-- 1. СТАТИСТИКА ПО ДНЯМ (для каждого проекта)
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.project_statistics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    planned_percent DECIMAL(5, 2), -- Плановый процент готовности
    actual_percent DECIMAL(5, 2), -- Фактический процент готовности
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, date)
);

COMMENT ON TABLE taiga.project_statistics IS 'Статистика по дням (план/факт готовности)';
COMMENT ON COLUMN taiga.project_statistics.project_id IS 'ID проекта';
COMMENT ON COLUMN taiga.project_statistics.date IS 'Дата';
COMMENT ON COLUMN taiga.project_statistics.planned_percent IS 'Плановый процент готовности';
COMMENT ON COLUMN taiga.project_statistics.actual_percent IS 'Фактический процент готовности';

CREATE INDEX IF NOT EXISTS idx_project_statistics_project_id ON taiga.project_statistics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_statistics_date ON taiga.project_statistics(date);

-- ===========================================
-- 2. ОПИСЬ РАБОТ (для каждого проекта)
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.project_works (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    section VARCHAR(255), -- Раздел работ (например, "Антисептирование и огнезащита")
    work_name TEXT NOT NULL, -- Наименование работы
    unit_id INTEGER REFERENCES taiga.units(id),
    quantity DECIMAL(10, 2), -- Количество
    price_per_unit DECIMAL(10, 2), -- Цена за единицу
    total_cost DECIMAL(12, 2), -- Общая стоимость
    progress_percent DECIMAL(5, 2) DEFAULT 0, -- Прогресс выполнения (%)
    completed_quantity DECIMAL(10, 2) DEFAULT 0, -- Выполнено (количество)
    status VARCHAR(50) DEFAULT 'В процессе', -- В процессе, Выполнено
    notes TEXT,
    sort_order INTEGER DEFAULT 0, -- Порядок сортировки
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.project_works IS 'Опись работ по проекту с прогрессом выполнения';
COMMENT ON COLUMN taiga.project_works.project_id IS 'ID проекта';
COMMENT ON COLUMN taiga.project_works.section IS 'Раздел работ';
COMMENT ON COLUMN taiga.project_works.work_name IS 'Наименование работы';
COMMENT ON COLUMN taiga.project_works.progress_percent IS 'Прогресс выполнения (%)';
COMMENT ON COLUMN taiga.project_works.completed_quantity IS 'Выполнено (количество)';

CREATE INDEX IF NOT EXISTS idx_project_works_project_id ON taiga.project_works(project_id);
CREATE INDEX IF NOT EXISTS idx_project_works_section ON taiga.project_works(section);

-- ===========================================
-- 3. ВЕДОМОСТЬ МАТЕРИАЛОВ (СНАБ) - СМЕТА
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.project_materials_estimate (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    category VARCHAR(255), -- Категория (например, "Электрика")
    material_name VARCHAR(255) NOT NULL, -- Наименование материала
    unit_id INTEGER REFERENCES taiga.units(id),
    planned_quantity DECIMAL(10, 2), -- Плановое количество (из сметы)
    planned_price DECIMAL(10, 2), -- Плановая цена (из сметы)
    planned_cost DECIMAL(12, 2), -- Плановая стоимость (количество * цена)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.project_materials_estimate IS 'Ведомость материалов (СМЕТА)';
COMMENT ON COLUMN taiga.project_materials_estimate.project_id IS 'ID проекта';
COMMENT ON COLUMN taiga.project_materials_estimate.category IS 'Категория материалов';
COMMENT ON COLUMN taiga.project_materials_estimate.material_name IS 'Наименование материала';
COMMENT ON COLUMN taiga.project_materials_estimate.planned_quantity IS 'Плановое количество (из сметы)';
COMMENT ON COLUMN taiga.project_materials_estimate.planned_price IS 'Плановая цена (из сметы)';
COMMENT ON COLUMN taiga.project_materials_estimate.planned_cost IS 'Плановая стоимость';

CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_project_id ON taiga.project_materials_estimate(project_id);
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_category ON taiga.project_materials_estimate(category);
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_name ON taiga.project_materials_estimate(material_name);

-- ===========================================
-- 4. ВЕДОМОСТЬ МАТЕРИАЛОВ (СНАБ) - ФАКТ
-- ===========================================
-- Фактические данные берутся из taiga.expenses
-- Но для удобства можно создать представление (view)

-- ===========================================
-- 5. ЖУРНАЛ ВЕДЕНИЯ РАБОТ (для каждого проекта)
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.project_journal (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    worker_name VARCHAR(255), -- Имя рабочего
    work_id INTEGER REFERENCES taiga.project_works(id), -- Связь с описью работ
    hours DECIMAL(5, 2), -- Отработано часов
    quantity_completed DECIMAL(10, 2), -- Выполнено (количество)
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.project_journal IS 'Журнал ведения работ (ежедневный учёт)';
COMMENT ON COLUMN taiga.project_journal.project_id IS 'ID проекта';
COMMENT ON COLUMN taiga.project_journal.date IS 'Дата работы';
COMMENT ON COLUMN taiga.project_journal.worker_name IS 'Имя рабочего';
COMMENT ON COLUMN taiga.project_journal.work_id IS 'ID работы из описи';
COMMENT ON COLUMN taiga.project_journal.hours IS 'Отработано часов';
COMMENT ON COLUMN taiga.project_journal.quantity_completed IS 'Выполнено (количество)';

CREATE INDEX IF NOT EXISTS idx_project_journal_project_id ON taiga.project_journal(project_id);
CREATE INDEX IF NOT EXISTS idx_project_journal_date ON taiga.project_journal(date);
CREATE INDEX IF NOT EXISTS idx_project_journal_work_id ON taiga.project_journal(work_id);

-- ===========================================
-- 6. ТАБЕЛЬ (формируется автоматически из журнала)
-- ===========================================
-- Табель можно формировать через представление (view) или запрос
-- Создадим представление для удобства

CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.project_id,
    pj.date,
    pj.worker_name,
    pw.work_name,
    pj.hours,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.units u ON pw.unit_id = u.id
ORDER BY pj.date DESC, pj.worker_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала)';

-- ===========================================
-- 7. СПРАВОЧНИК СООТВЕТСТВИЙ ТОВАРОВ
-- ===========================================
-- Для сопоставления товаров из чеков с материалами в смете
CREATE TABLE IF NOT EXISTS taiga.material_mapping (
    id SERIAL PRIMARY KEY,
    receipt_name VARCHAR(255) NOT NULL, -- Название из чека
    material_name VARCHAR(255) NOT NULL, -- Название материала в смете
    project_id INTEGER REFERENCES taiga.projects(id), -- Если привязано к конкретному проекту
    category VARCHAR(255),
    unit_id INTEGER REFERENCES taiga.units(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(receipt_name, material_name, project_id)
);

COMMENT ON TABLE taiga.material_mapping IS 'Справочник соответствий товаров (чек → смета)';
COMMENT ON COLUMN taiga.material_mapping.receipt_name IS 'Название товара из чека';
COMMENT ON COLUMN taiga.material_mapping.material_name IS 'Название материала в смете';
COMMENT ON COLUMN taiga.material_mapping.project_id IS 'ID проекта (если привязано)';

CREATE INDEX IF NOT EXISTS idx_material_mapping_receipt_name ON taiga.material_mapping(receipt_name);
CREATE INDEX IF NOT EXISTS idx_material_mapping_material_name ON taiga.material_mapping(material_name);

-- ===========================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- ===========================================
CREATE TRIGGER update_project_statistics_updated_at
    BEFORE UPDATE ON taiga.project_statistics
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_project_works_updated_at
    BEFORE UPDATE ON taiga.project_works
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_project_materials_estimate_updated_at
    BEFORE UPDATE ON taiga.project_materials_estimate
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_project_journal_updated_at
    BEFORE UPDATE ON taiga.project_journal
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_material_mapping_updated_at
    BEFORE UPDATE ON taiga.material_mapping
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- Сообщение об успешном создании
DO $$
BEGIN
    RAISE NOTICE '✅ Таблицы для клиентов успешно созданы!';
END $$;




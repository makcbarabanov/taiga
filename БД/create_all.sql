-- ===========================================
-- СОЗДАНИЕ ВСЕЙ СТРУКТУРЫ БД TAIGA
-- ===========================================
-- Выполнить этот скрипт в DBeaver для создания всей структуры
-- ===========================================

-- 1. СОЗДАНИЕ СХЕМЫ
CREATE SCHEMA IF NOT EXISTS taiga;
GRANT ALL PRIVILEGES ON SCHEMA taiga TO marabot;
SET search_path TO taiga, public;

-- 2. СОЗДАНИЕ СПРАВОЧНИКОВ

-- Клиенты
CREATE TABLE IF NOT EXISTS taiga.clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.clients IS 'Справочник клиентов';
CREATE INDEX IF NOT EXISTS idx_clients_name ON taiga.clients(name);

-- Магазины
CREATE TABLE IF NOT EXISTS taiga.shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    working_hours VARCHAR(255),
    contact_person VARCHAR(255),
    website VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.shops IS 'Справочник магазинов и поставщиков';
CREATE INDEX IF NOT EXISTS idx_shops_name ON taiga.shops(name);

-- Инструменты
CREATE TABLE IF NOT EXISTS taiga.tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2),
    project_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.tools IS 'Справочник инструментов на балансе';
CREATE INDEX IF NOT EXISTS idx_tools_name ON taiga.tools(name);

-- Категории расходов
CREATE TABLE IF NOT EXISTS taiga.expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.expense_categories IS 'Справочник категорий расходов';

INSERT INTO taiga.expense_categories (name, description) VALUES
    ('Мат', 'Материалы'),
    ('ФОТ', 'Фонд оплаты труда (зарплаты)'),
    ('ТЗР', 'Транспортно-заготовительные расходы'),
    ('Накладные', 'Накладные расходы (бензин, продукты и т.д.)'),
    ('Инструм', 'Инструменты'),
    ('Расход', 'Расходные материалы'),
    ('Прибыль', 'Прибыль')
ON CONFLICT (name) DO NOTHING;

-- Единицы измерения
CREATE TABLE IF NOT EXISTS taiga.units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    short_name VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.units IS 'Справочник единиц измерения';

INSERT INTO taiga.units (name, short_name) VALUES
    ('штука', 'шт'),
    ('метр', 'м'),
    ('квадратный метр', 'м²'),
    ('кубический метр', 'м³'),
    ('литр', 'л'),
    ('килограмм', 'кг'),
    ('тонна', 'т'),
    ('час', 'ч'),
    ('смена', 'смена'),
    ('комплект', 'компл'),
    ('упаковка', 'уп'),
    ('рулон', 'рул')
ON CONFLICT (name) DO NOTHING;

-- 3. ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ updated_at
CREATE OR REPLACE FUNCTION taiga.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. ОСНОВНЫЕ ТАБЛИЦЫ

-- Объекты
CREATE TABLE IF NOT EXISTS taiga.projects (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES taiga.clients(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'В работе',
    start_date DATE,
    end_date DATE,
    planned_profit DECIMAL(12, 2),
    actual_profit DECIMAL(12, 2),
    planned_income DECIMAL(12, 2),
    actual_income DECIMAL(12, 2),
    planned_expense DECIMAL(12, 2),
    actual_expense DECIMAL(12, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(client_id, name)
);

COMMENT ON TABLE taiga.projects IS 'База всех объектов с финансовой аналитикой';
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON taiga.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON taiga.projects(status);

-- Доходы
CREATE TABLE IF NOT EXISTS taiga.income (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    month INTEGER,
    year INTEGER,
    amount DECIMAL(12, 2) NOT NULL,
    wallet VARCHAR(100),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.income IS 'Все доходы от клиентов';
CREATE INDEX IF NOT EXISTS idx_income_project_id ON taiga.income(project_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON taiga.income(date);
CREATE INDEX IF NOT EXISTS idx_income_year_month ON taiga.income(year, month);

-- Расходы
CREATE TABLE IF NOT EXISTS taiga.expenses (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    month INTEGER,
    year INTEGER,
    category_id INTEGER NOT NULL REFERENCES taiga.expense_categories(id) ON DELETE RESTRICT,
    subcategory VARCHAR(255),
    unit_id INTEGER REFERENCES taiga.units(id),
    quantity DECIMAL(10, 2),
    price DECIMAL(10, 2),
    amount DECIMAL(12, 2) NOT NULL,
    section VARCHAR(255),
    wallet VARCHAR(100),
    shop_id INTEGER REFERENCES taiga.shops(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.expenses IS 'Все расходы со всех объектов по всем категориям';
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON taiga.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON taiga.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON taiga.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_shop_id ON taiga.expenses(shop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_year_month ON taiga.expenses(year, month);

-- Касса
CREATE TABLE IF NOT EXISTS taiga.cash (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    calculated_amount DECIMAL(12, 2),
    actual_amount DECIMAL(12, 2),
    difference DECIMAL(12, 2),
    initial_balance DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cash IS 'Ежедневный учёт финансов (сверка остатков)';
CREATE INDEX IF NOT EXISTS idx_cash_date ON taiga.cash(date);

-- 5. ТАБЛИЦЫ ДЛЯ КЛИЕНТОВ

-- Статистика по дням
CREATE TABLE IF NOT EXISTS taiga.project_statistics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    planned_percent DECIMAL(5, 2),
    actual_percent DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, date)
);

COMMENT ON TABLE taiga.project_statistics IS 'Статистика по дням (план/факт готовности)';
CREATE INDEX IF NOT EXISTS idx_project_statistics_project_id ON taiga.project_statistics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_statistics_date ON taiga.project_statistics(date);

-- Опись работ
CREATE TABLE IF NOT EXISTS taiga.project_works (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    section VARCHAR(255),
    work_name TEXT NOT NULL,
    unit_id INTEGER REFERENCES taiga.units(id),
    quantity DECIMAL(10, 2),
    price_per_unit DECIMAL(10, 2),
    total_cost DECIMAL(12, 2),
    progress_percent DECIMAL(5, 2) DEFAULT 0,
    completed_quantity DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'В процессе',
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.project_works IS 'Опись работ по проекту с прогрессом выполнения';
CREATE INDEX IF NOT EXISTS idx_project_works_project_id ON taiga.project_works(project_id);
CREATE INDEX IF NOT EXISTS idx_project_works_section ON taiga.project_works(section);

-- Ведомость материалов (СМЕТА)
CREATE TABLE IF NOT EXISTS taiga.project_materials_estimate (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    category VARCHAR(255),
    material_name VARCHAR(255) NOT NULL,
    unit_id INTEGER REFERENCES taiga.units(id),
    planned_quantity DECIMAL(10, 2),
    planned_price DECIMAL(10, 2),
    planned_cost DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.project_materials_estimate IS 'Ведомость материалов (СМЕТА)';
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_project_id ON taiga.project_materials_estimate(project_id);
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_category ON taiga.project_materials_estimate(category);
CREATE INDEX IF NOT EXISTS idx_project_materials_estimate_material_name ON taiga.project_materials_estimate(material_name);

-- Журнал ведения работ
CREATE TABLE IF NOT EXISTS taiga.project_journal (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    worker_name VARCHAR(255),
    work_id INTEGER REFERENCES taiga.project_works(id),
    hours DECIMAL(5, 2),
    quantity_completed DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.project_journal IS 'Журнал ведения работ (ежедневный учёт)';
CREATE INDEX IF NOT EXISTS idx_project_journal_project_id ON taiga.project_journal(project_id);
CREATE INDEX IF NOT EXISTS idx_project_journal_date ON taiga.project_journal(date);
CREATE INDEX IF NOT EXISTS idx_project_journal_work_id ON taiga.project_journal(work_id);

-- Табель (представление)
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

-- Справочник соответствий товаров
CREATE TABLE IF NOT EXISTS taiga.material_mapping (
    id SERIAL PRIMARY KEY,
    receipt_name VARCHAR(255) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    project_id INTEGER REFERENCES taiga.projects(id),
    category VARCHAR(255),
    unit_id INTEGER REFERENCES taiga.units(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(receipt_name, material_name, project_id)
);

COMMENT ON TABLE taiga.material_mapping IS 'Справочник соответствий товаров (чек → смета)';
CREATE INDEX IF NOT EXISTS idx_material_mapping_receipt_name ON taiga.material_mapping(receipt_name);
CREATE INDEX IF NOT EXISTS idx_material_mapping_material_name ON taiga.material_mapping(material_name);

-- 6. ТРИГГЕРЫ ДЛЯ ОБНОВЛЕНИЯ updated_at

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON taiga.clients
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON taiga.shops
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON taiga.tools
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON taiga.projects
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_income_updated_at
    BEFORE UPDATE ON taiga.income
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON taiga.expenses
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

CREATE TRIGGER update_cash_updated_at
    BEFORE UPDATE ON taiga.cash
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

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
    RAISE NOTICE '✅ Схема taiga и все таблицы успешно созданы!';
END $$;




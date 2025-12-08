-- ===========================================
-- СОЗДАНИЕ ОСНОВНЫХ ТАБЛИЦ
-- ===========================================
-- Таблицы: объекты, доходы, расходы, касса
-- ===========================================

SET search_path TO taiga, public;

-- ===========================================
-- 1. ТАБЛИЦА ОБЪЕКТОВ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.projects (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES taiga.clients(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'В работе', -- В работе, В кассе, Завершён
    start_date DATE,
    end_date DATE,
    planned_profit DECIMAL(12, 2), -- Плановая прибыль из сметы
    actual_profit DECIMAL(12, 2), -- Фактическая прибыль
    planned_income DECIMAL(12, 2), -- Плановый доход
    actual_income DECIMAL(12, 2), -- Фактический доход
    planned_expense DECIMAL(12, 2), -- Плановый расход
    actual_expense DECIMAL(12, 2), -- Фактический расход
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(client_id, name) -- Один клиент может иметь несколько объектов с разными названиями
);

COMMENT ON TABLE taiga.projects IS 'База всех объектов с финансовой аналитикой';
COMMENT ON COLUMN taiga.projects.client_id IS 'ID клиента';
COMMENT ON COLUMN taiga.projects.name IS 'Название объекта';
COMMENT ON COLUMN taiga.projects.status IS 'Статус: В работе, В кассе, Завершён';
COMMENT ON COLUMN taiga.projects.planned_profit IS 'Плановая прибыль из первоначальной сметы';
COMMENT ON COLUMN taiga.projects.actual_profit IS 'Фактическая прибыль (доход - расход)';

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON taiga.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON taiga.projects(status);

-- ===========================================
-- 2. ТАБЛИЦА ДОХОДОВ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.income (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    month INTEGER,
    year INTEGER,
    amount DECIMAL(12, 2) NOT NULL,
    wallet VARCHAR(100), -- Кошелёк (название)
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.income IS 'Все доходы от клиентов';
COMMENT ON COLUMN taiga.income.project_id IS 'ID объекта';
COMMENT ON COLUMN taiga.income.date IS 'Дата поступления';
COMMENT ON COLUMN taiga.income.amount IS 'Сумма дохода';
COMMENT ON COLUMN taiga.income.wallet IS 'Кошелёк (название)';

CREATE INDEX IF NOT EXISTS idx_income_project_id ON taiga.income(project_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON taiga.income(date);
CREATE INDEX IF NOT EXISTS idx_income_year_month ON taiga.income(year, month);

-- ===========================================
-- 3. ТАБЛИЦА РАСХОДОВ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.expenses (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    month INTEGER,
    year INTEGER,
    category_id INTEGER NOT NULL REFERENCES taiga.expense_categories(id) ON DELETE RESTRICT,
    subcategory VARCHAR(255), -- Подкатегория (название товара/работы)
    unit_id INTEGER REFERENCES taiga.units(id),
    quantity DECIMAL(10, 2), -- Количество
    price DECIMAL(10, 2), -- Цена за единицу
    amount DECIMAL(12, 2) NOT NULL, -- Стоимость (количество * цена)
    section VARCHAR(255), -- Раздел (например, "Раздел 1а. Электрика")
    wallet VARCHAR(100), -- Кошелёк
    shop_id INTEGER REFERENCES taiga.shops(id), -- Магазин
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.expenses IS 'Все расходы со всех объектов по всем категориям';
COMMENT ON COLUMN taiga.expenses.project_id IS 'ID объекта';
COMMENT ON COLUMN taiga.expenses.date IS 'Дата расхода';
COMMENT ON COLUMN taiga.expenses.category_id IS 'ID категории расхода';
COMMENT ON COLUMN taiga.expenses.subcategory IS 'Подкатегория (название товара/работы)';
COMMENT ON COLUMN taiga.expenses.unit_id IS 'ID единицы измерения';
COMMENT ON COLUMN taiga.expenses.quantity IS 'Количество';
COMMENT ON COLUMN taiga.expenses.price IS 'Цена за единицу';
COMMENT ON COLUMN taiga.expenses.amount IS 'Стоимость (количество * цена)';
COMMENT ON COLUMN taiga.expenses.section IS 'Раздел работ';
COMMENT ON COLUMN taiga.expenses.shop_id IS 'ID магазина';

CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON taiga.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON taiga.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON taiga.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_shop_id ON taiga.expenses(shop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_year_month ON taiga.expenses(year, month);

-- ===========================================
-- 4. ТАБЛИЦА КАССЫ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.cash (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    calculated_amount DECIMAL(12, 2), -- Расчётная сумма (доходы - расходы + начальный остаток)
    actual_amount DECIMAL(12, 2), -- Фактический остаток (вводится вручную)
    difference DECIMAL(12, 2), -- Разница (факт - расчёт)
    initial_balance DECIMAL(12, 2) DEFAULT 0, -- Начальный остаток (динамический)
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.cash IS 'Ежедневный учёт финансов (сверка остатков)';
COMMENT ON COLUMN taiga.cash.date IS 'Дата';
COMMENT ON COLUMN taiga.cash.calculated_amount IS 'Расчётная сумма (доходы - расходы + начальный остаток)';
COMMENT ON COLUMN taiga.cash.actual_amount IS 'Фактический остаток (вводится вручную)';
COMMENT ON COLUMN taiga.cash.difference IS 'Разница (факт - расчёт)';
COMMENT ON COLUMN taiga.cash.initial_balance IS 'Начальный остаток (динамический)';

CREATE INDEX IF NOT EXISTS idx_cash_date ON taiga.cash(date);

-- ===========================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- ===========================================
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

-- Сообщение об успешном создании
DO $$
BEGIN
    RAISE NOTICE '✅ Основные таблицы успешно созданы!';
END $$;



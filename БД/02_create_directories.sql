-- ===========================================
-- СОЗДАНИЕ СПРАВОЧНИКОВ (DIRECTORIES)
-- ===========================================
-- Справочники: магазины, инструменты, категории расходов,
-- единицы измерения, клиенты
-- ===========================================

SET search_path TO taiga, public;

-- ===========================================
-- 1. СПРАВОЧНИК КЛИЕНТОВ
-- ===========================================
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
COMMENT ON COLUMN taiga.clients.name IS 'Имя клиента';
COMMENT ON COLUMN taiga.clients.phone IS 'Телефон';
COMMENT ON COLUMN taiga.clients.email IS 'Email';
COMMENT ON COLUMN taiga.clients.address IS 'Адрес';
COMMENT ON COLUMN taiga.clients.notes IS 'Заметки';

CREATE INDEX IF NOT EXISTS idx_clients_name ON taiga.clients(name);

-- ===========================================
-- 2. СПРАВОЧНИК МАГАЗИНОВ
-- ===========================================
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
COMMENT ON COLUMN taiga.shops.name IS 'Название магазина';
COMMENT ON COLUMN taiga.shops.phone IS 'Телефон';
COMMENT ON COLUMN taiga.shops.address IS 'Адрес';
COMMENT ON COLUMN taiga.shops.working_hours IS 'Часы работы';
COMMENT ON COLUMN taiga.shops.contact_person IS 'Контактное лицо';
COMMENT ON COLUMN taiga.shops.website IS 'Сайт';

CREATE INDEX IF NOT EXISTS idx_shops_name ON taiga.shops(name);

-- ===========================================
-- 3. СПРАВОЧНИК ИНСТРУМЕНТОВ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2),
    project_id INTEGER, -- Связь с проектом (если инструмент привязан к проекту)
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.tools IS 'Справочник инструментов на балансе';
COMMENT ON COLUMN taiga.tools.name IS 'Название инструмента';
COMMENT ON COLUMN taiga.tools.price IS 'Стоимость';
COMMENT ON COLUMN taiga.tools.project_id IS 'ID проекта (если привязан)';

CREATE INDEX IF NOT EXISTS idx_tools_name ON taiga.tools(name);

-- ===========================================
-- 4. СПРАВОЧНИК КАТЕГОРИЙ РАСХОДОВ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.expense_categories IS 'Справочник категорий расходов';
COMMENT ON COLUMN taiga.expense_categories.name IS 'Название категории (Мат, ФОТ, ТЗР, Накладные, Инструм, Расход)';

-- Заполнение базовыми категориями
INSERT INTO taiga.expense_categories (name, description) VALUES
    ('Мат', 'Материалы'),
    ('ФОТ', 'Фонд оплаты труда (зарплаты)'),
    ('ТЗР', 'Транспортно-заготовительные расходы'),
    ('Накладные', 'Накладные расходы (бензин, продукты и т.д.)'),
    ('Инструм', 'Инструменты'),
    ('Расход', 'Расходные материалы'),
    ('Прибыль', 'Прибыль')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 5. СПРАВОЧНИК ЕДИНИЦ ИЗМЕРЕНИЯ
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    short_name VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.units IS 'Справочник единиц измерения';
COMMENT ON COLUMN taiga.units.name IS 'Полное название единицы';
COMMENT ON COLUMN taiga.units.short_name IS 'Сокращённое название';

-- Заполнение базовыми единицами
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

-- ===========================================
-- ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION taiga.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
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

-- Сообщение об успешном создании
DO $$
BEGIN
    RAISE NOTICE '✅ Справочники успешно созданы!';
END $$;



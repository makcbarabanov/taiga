-- ===========================================
-- СОЗДАНИЕ СПРАВОЧНИКА СОТРУДНИКОВ
-- ===========================================

SET search_path TO taiga, public;

-- 1. Создаём таблицу сотрудников
CREATE TABLE IF NOT EXISTS taiga.employees (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    address_actual TEXT,
    address_registration TEXT,
    phone_numbers TEXT[], -- Массив телефонов
    hire_date DATE,
    dismissal_date DATE,
    status VARCHAR(20) DEFAULT 'Не указан', -- 'Работает', 'Уволен', 'Не указан'
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.employees IS 'Справочник сотрудников';
COMMENT ON COLUMN taiga.employees.phone_numbers IS 'Массив телефонных номеров сотрудника';
COMMENT ON COLUMN taiga.employees.hire_date IS 'Дата трудоустройства';
COMMENT ON COLUMN taiga.employees.dismissal_date IS 'Дата увольнения (NULL если работает)';
COMMENT ON COLUMN taiga.employees.status IS 'Статус сотрудника: Работает, Уволен, Не указан (автоматически обновляется по датам)';

-- 2. Индексы
CREATE INDEX IF NOT EXISTS idx_employees_last_name ON taiga.employees(last_name);
CREATE INDEX IF NOT EXISTS idx_employees_full_name ON taiga.employees(last_name, first_name, middle_name);

-- 3. Функция для автоматического обновления статуса сотрудника
CREATE OR REPLACE FUNCTION taiga.update_employee_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Если есть дата увольнения - статус "Уволен"
    IF NEW.dismissal_date IS NOT NULL THEN
        NEW.status = 'Уволен';
    -- Если есть дата трудоустройства и нет даты увольнения - статус "Работает"
    ELSIF NEW.hire_date IS NOT NULL AND NEW.dismissal_date IS NULL THEN
        NEW.status = 'Работает';
    -- Иначе - статус остаётся "Не указан"
    ELSE
        NEW.status = COALESCE(OLD.status, 'Не указан');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION taiga.update_employee_status() IS 'Автоматически обновляет статус сотрудника на основе дат трудоустройства и увольнения';

-- 4. Триггер для автоматического обновления статуса
DROP TRIGGER IF EXISTS trigger_update_employee_status ON taiga.employees;
CREATE TRIGGER trigger_update_employee_status
    BEFORE INSERT OR UPDATE ON taiga.employees
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_employee_status();

-- 5. Триггер для updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON taiga.employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON taiga.employees
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- 6. Добавляем начальные данные (из CSV видно сотрудников)
-- Добавляем только тех, кого нет, чтобы не нарушить существующие записи
INSERT INTO taiga.employees (last_name, first_name, middle_name, phone_numbers, hire_date, status) VALUES
    ('Балуев', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Сирожутдин', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Алексей', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Жура', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Даня', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Жасур', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Хуснидин', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Ринат', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает'),
    ('Фуркат', '', '', ARRAY[]::TEXT[], CURRENT_DATE, 'Работает')
ON CONFLICT DO NOTHING;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Справочник employees создан';
END $$;


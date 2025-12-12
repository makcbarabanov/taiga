-- ===========================================
-- ДОБАВЛЕНИЕ ПОЛЕЙ В СПРАВОЧНИК СОТРУДНИКОВ
-- ===========================================
-- Добавляем: должность и тип занятости
-- ===========================================

SET search_path TO taiga, public;

-- 1. Добавляем поле "должность"
ALTER TABLE taiga.employees
    ADD COLUMN IF NOT EXISTS position VARCHAR(200);

COMMENT ON COLUMN taiga.employees.position IS 'Должность сотрудника (например: прораб, разнорабочий, электрик и т.д.)';

-- 2. Добавляем поле "тип занятости"
ALTER TABLE taiga.employees
    ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'постоянно';

COMMENT ON COLUMN taiga.employees.employment_type IS 'Тип занятости: постоянно, разово, удалённо';

-- 3. Добавляем CHECK ограничение для типа занятости (опционально, для валидации)
DO $$
BEGIN
    -- Проверяем, существует ли уже это ограничение
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'employees_employment_type_check'
        AND conrelid = 'taiga.employees'::regclass
    ) THEN
        ALTER TABLE taiga.employees
            ADD CONSTRAINT employees_employment_type_check 
            CHECK (employment_type IN ('постоянно', 'разово', 'удалённо'));
    END IF;
END $$;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Поля добавлены в таблицу employees:';
    RAISE NOTICE '   - position (должность)';
    RAISE NOTICE '   - employment_type (тип занятости: постоянно, разово, удалённо)';
END $$;


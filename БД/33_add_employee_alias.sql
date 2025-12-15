-- ===========================================
-- ДОБАВЛЕНИЕ ПОЛЯ ALIAS ДЛЯ СОТРУДНИКОВ
-- ===========================================

SET search_path TO taiga, public;

-- Добавляем поле alias для сокращённых имён
ALTER TABLE taiga.employees 
    ADD COLUMN IF NOT EXISTS alias VARCHAR(50);

COMMENT ON COLUMN taiga.employees.alias IS 'Сокращённое имя сотрудника для использования в журнале, табеле и других местах';

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Добавлено поле alias для сотрудников';
END $$;


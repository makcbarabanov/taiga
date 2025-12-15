-- ===========================================
-- УБИРАЕМ ОБЯЗАТЕЛЬНОСТЬ ПОЛЯ last_name
-- ===========================================

SET search_path TO taiga, public;

-- Убираем ограничение NOT NULL с поля last_name
ALTER TABLE taiga.employees 
    ALTER COLUMN last_name DROP NOT NULL;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Поле last_name теперь необязательное';
END $$;


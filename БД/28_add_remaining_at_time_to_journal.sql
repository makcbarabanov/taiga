-- ===========================================
-- ДОБАВЛЕНИЕ ПОЛЯ remaining_at_time В project_journal
-- ===========================================
-- Это поле будет хранить историческое значение "Осталось"
-- на момент выполнения записи в журнале
-- ===========================================

SET search_path TO taiga, public;

BEGIN;

-- Добавляем поле remaining_at_time
ALTER TABLE taiga.project_journal
    ADD COLUMN IF NOT EXISTS remaining_at_time DECIMAL(10, 2);

COMMENT ON COLUMN taiga.project_journal.remaining_at_time IS 'Осталось выполнить работы на момент создания/редактирования записи (историческое значение)';

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_journal_remaining_at_time ON taiga.project_journal(remaining_at_time);

COMMIT;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Поле remaining_at_time добавлено в таблицу project_journal';
END $$;






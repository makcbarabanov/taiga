-- ===========================================
-- ОБНОВЛЕНИЕ СТРУКТУРЫ project_works
-- ===========================================
-- Замена текстовых полей на связи со справочниками
-- ===========================================

SET search_path TO taiga, public;

-- 1. Добавляем новые колонки для связей
ALTER TABLE taiga.project_works
    ADD COLUMN IF NOT EXISTS stage_id INTEGER REFERENCES taiga.work_stages(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS section_id INTEGER REFERENCES taiga.work_sections(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS work_type_id INTEGER REFERENCES taiga.work_types(id) ON DELETE RESTRICT;

-- 1.1. Делаем work_name nullable (больше не используется, только для совместимости)
ALTER TABLE taiga.project_works
    ALTER COLUMN work_name DROP NOT NULL;

-- 2. Комментарии для новых колонок
COMMENT ON COLUMN taiga.project_works.stage_id IS 'ID этапа работы (Тёплый контур / Отделка)';
COMMENT ON COLUMN taiga.project_works.section_id IS 'ID раздела работы (Фундамент, Основа, Стены и т.д.)';
COMMENT ON COLUMN taiga.project_works.work_type_id IS 'ID вида работы (без префикса раздела)';

-- 3. Создаём индексы для новых колонок
CREATE INDEX IF NOT EXISTS idx_project_works_stage_id ON taiga.project_works(stage_id);
CREATE INDEX IF NOT EXISTS idx_project_works_section_id ON taiga.project_works(section_id);
CREATE INDEX IF NOT EXISTS idx_project_works_work_type_id ON taiga.project_works(work_type_id);

-- 4. Функция для автоматического обновления прогресса из журнала
CREATE OR REPLACE FUNCTION taiga.update_work_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем progress_percent и completed_quantity для работы
    UPDATE taiga.project_works pw
    SET 
        completed_quantity = COALESCE((
            SELECT SUM(quantity_completed)
            FROM taiga.project_journal pj
            WHERE pj.work_id = COALESCE(NEW.work_id, OLD.work_id)
        ), 0),
        progress_percent = CASE
            WHEN pw.quantity > 0 THEN
                ROUND(COALESCE((
                    SELECT SUM(quantity_completed)
                    FROM taiga.project_journal pj
                    WHERE pj.work_id = COALESCE(NEW.work_id, OLD.work_id)
                ), 0) / pw.quantity * 100, 2)
            ELSE 0
        END,
        updated_at = NOW()
    WHERE pw.id = COALESCE(NEW.work_id, OLD.work_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Триггер для автоматического обновления прогресса при изменении журнала
DROP TRIGGER IF EXISTS trigger_update_work_progress ON taiga.project_journal;

CREATE TRIGGER trigger_update_work_progress
    AFTER INSERT OR UPDATE OR DELETE ON taiga.project_journal
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_work_progress();

-- 6. Представление для удобного получения полного названия работы
CREATE OR REPLACE VIEW taiga.v_project_works_full AS
SELECT 
    pw.id,
    pw.project_id,
    pw.stage_id,
    ws.name AS stage_name,
    pw.section_id,
    wsec.name AS section_name,
    wsec.alias AS section_alias,
    pw.work_type_id,
    wt.name AS work_type_name,
    -- Полное название работы: "Раздел - Вид работы"
    wsec.name || ' - ' || wt.name AS work_name,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    pw.quantity,
    pw.price_per_unit,
    pw.total_cost,
    pw.progress_percent,
    pw.completed_quantity,
    pw.status,
    pw.notes,
    pw.sort_order,
    pw.created_at,
    pw.updated_at
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников';

-- Сообщение об успешном обновлении
DO $$
BEGIN
    RAISE NOTICE '✅ Структура project_works успешно обновлена!';
    RAISE NOTICE '   - Добавлены связи: stage_id, section_id, work_type_id';
    RAISE NOTICE '   - Создан триггер для автоматического обновления прогресса';
    RAISE NOTICE '   - Создано представление v_project_works_full для получения полных названий';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ВНИМАНИЕ: Колонки section и work_name остались для совместимости';
    RAISE NOTICE '   Их можно будет удалить после миграции данных';
END $$;


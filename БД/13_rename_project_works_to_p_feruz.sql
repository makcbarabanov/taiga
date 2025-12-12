-- ===========================================
-- ПЕРЕИМЕНОВАНИЕ project_works В p_feruz
-- ===========================================
-- p_ - префикс для основных таблиц проекта
-- feruz - название конкретного проекта
-- ===========================================

SET search_path TO taiga, public;

BEGIN;

-- 1. Переименовываем таблицу
ALTER TABLE taiga.project_works RENAME TO p_feruz;

-- 2. Обновляем комментарий
COMMENT ON TABLE taiga.p_feruz IS 'Опись работ по проекту Феруз';

-- 3. Обновляем представление v_project_works_full
DROP VIEW IF EXISTS taiga.v_project_works_full CASCADE;

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
    pw.sort_order,
    pw.created_at,
    pw.updated_at
FROM taiga.p_feruz pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление p_feruz с полными названиями из справочников';

-- 4. Обновляем триггер для updated_at (автоматически переименуется)

-- 5. Обновляем функцию update_work_progress для работы с p_feruz
CREATE OR REPLACE FUNCTION taiga.update_work_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE taiga.p_feruz pw
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

-- 6. Обновляем представление project_timesheet
DROP VIEW IF EXISTS taiga.project_timesheet CASCADE;

CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.project_id,
    pj.date,
    pj.worker_name,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.hours,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name
FROM taiga.project_journal pj
LEFT JOIN taiga.p_feruz pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.units u ON pw.unit_id = u.id
ORDER BY pj.date DESC, pj.worker_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала)';

COMMIT;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Таблица project_works переименована в p_feruz';
    RAISE NOTICE '✅ Обновлены все представления и функции';
END $$;


-- ===========================================
-- УДАЛЕНИЕ УСТАРЕВШИХ ПОЛЕЙ ИЗ project_works
-- ===========================================
-- Удаляем: section, work_name, notes
-- Сначала обновляем представления, которые зависят от этих полей
-- ===========================================

SET search_path TO taiga, public;

-- 1. Обновляем представление v_project_works_full (убираем pw.notes)
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
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников';

-- 2. Обновляем представление project_timesheet
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
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.units u ON pw.unit_id = u.id
ORDER BY pj.date DESC, pj.worker_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала)';

-- 3. Удаляем устаревшие поля из таблицы
ALTER TABLE taiga.project_works
    DROP COLUMN IF EXISTS section,
    DROP COLUMN IF EXISTS work_name,
    DROP COLUMN IF EXISTS notes;

-- Сообщение об успешном удалении
DO $$
BEGIN
    RAISE NOTICE '✅ Устаревшие поля удалены из таблицы project_works';
    RAISE NOTICE '   - section (заменено на section_id)';
    RAISE NOTICE '   - work_name (заменено на work_type_id)';
    RAISE NOTICE '   - notes';
    RAISE NOTICE '✅ Представление project_timesheet обновлено';
END $$;


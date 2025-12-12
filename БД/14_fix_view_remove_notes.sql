-- ===========================================
-- ИСПРАВЛЕНИЕ ПРЕДСТАВЛЕНИЯ v_project_works_full
-- ===========================================
-- Удаляем ссылку на несуществующее поле notes
-- ===========================================

SET search_path TO taiga, public;

-- Пересоздаём представление без поля notes
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

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Представление v_project_works_full обновлено (удалено поле notes)';
END $$;


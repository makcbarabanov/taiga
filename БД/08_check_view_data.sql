-- ===========================================
-- ПРОВЕРКА ДАННЫХ В ПРЕДСТАВЛЕНИИ
-- ===========================================

SET search_path TO taiga, public;

-- Проверка: какие данные возвращает представление
SELECT 
    id,
    project_id,
    section_name,
    work_type_name,
    work_name,
    unit_short_name,
    quantity,
    progress_percent
FROM taiga.v_project_works_full
WHERE project_id = 1
ORDER BY sort_order, id
LIMIT 10;

-- Проверка: есть ли NULL в ключевых полях
SELECT 
    COUNT(*) as total,
    COUNT(section_name) as has_section,
    COUNT(work_type_name) as has_work_type,
    COUNT(work_name) as has_work_name,
    COUNT(unit_short_name) as has_unit
FROM taiga.v_project_works_full
WHERE project_id = 1;

-- Проверка работ с NULL названиями
SELECT 
    pw.id,
    pw.section_id,
    pw.work_type_id,
    wsec.name as section_name,
    wt.name as work_type_name
FROM taiga.project_works pw
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
WHERE pw.project_id = 1
  AND (wsec.name IS NULL OR wt.name IS NULL)
LIMIT 10;


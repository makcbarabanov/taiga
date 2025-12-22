-- Миграция 39: Обновление представлений для использования cat_units вместо units

SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;




SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;

SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;




SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;

SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;




SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;

SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;




SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;

SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;




SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;

SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;




SET search_path TO taiga, public;

-- Обновление представления v_project_works_full
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- Обновление представления project_timesheet
CREATE OR REPLACE VIEW taiga.project_timesheet AS
SELECT 
    pj.id AS journal_id,
    pj.project_id,
    pj.date,
    pj.time_start,
    pj.time_end,
    pj.break_duration,
    pj.hours,
    pj.work_id,
    COALESCE(wsec.name || ' - ' || wt.name, 'Работа не указана') AS work_name,
    pj.quantity_completed,
    pw.unit_id,
    u.name AS unit_name,
    u.short_name AS unit_short_name,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    pj.notes,
    pj.created_at,
    pj.updated_at
FROM taiga.project_journal pj
LEFT JOIN taiga.project_works pw ON pj.work_id = pw.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.cat_units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

SELECT '✅ Миграция 39 выполнена: представления обновлены для использования cat_units' AS result;

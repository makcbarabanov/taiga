-- ===========================================
-- ОБНОВЛЕНИЕ СТРУКТУРЫ ЖУРНАЛА
-- ===========================================
-- 1. Возвращаем p_feruz обратно в project_works (если существует)
-- 2. Обновляем структуру project_journal: добавляем время начала/окончания/перерыва
-- 3. Создаём таблицу project_journal_workers для связи многие-ко-многим
-- 4. Обновляем триггеры и функции
-- 5. Обновляем представление project_timesheet
-- ===========================================

SET search_path TO taiga, public;

BEGIN;

-- ===========================================
-- 1. ВОЗВРАЩАЕМ p_feruz В project_works (если существует)
-- ===========================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'taiga' AND table_name = 'p_feruz') THEN
        -- Переименовываем обратно
        ALTER TABLE taiga.p_feruz RENAME TO project_works;
        COMMENT ON TABLE taiga.project_works IS 'Опись работ по проекту с прогрессом выполнения';
        RAISE NOTICE '✅ Таблица p_feruz переименована обратно в project_works';
    ELSE
        RAISE NOTICE 'ℹ️  Таблица p_feruz не найдена, пропускаем переименование';
    END IF;
END $$;

-- ===========================================
-- 2. ОБНОВЛЯЕМ СТРУКТУРУ project_journal
-- ===========================================

-- Добавляем поля для времени работы
ALTER TABLE taiga.project_journal
    ADD COLUMN IF NOT EXISTS time_start TIME,
    ADD COLUMN IF NOT EXISTS time_end TIME,
    ADD COLUMN IF NOT EXISTS break_duration INTERVAL;

-- Обновляем комментарии
COMMENT ON COLUMN taiga.project_journal.time_start IS 'Время начала работы';
COMMENT ON COLUMN taiga.project_journal.time_end IS 'Время окончания работы';
COMMENT ON COLUMN taiga.project_journal.break_duration IS 'Продолжительность перерыва (например, 1:00:00)';

-- Убираем worker_name (будет в отдельной таблице)
-- Но оставляем поле для обратной совместимости, просто не будем его использовать

-- ===========================================
-- 3. СОЗДАЁМ ТАБЛИЦУ project_journal_workers
-- ===========================================
CREATE TABLE IF NOT EXISTS taiga.project_journal_workers (
    id SERIAL PRIMARY KEY,
    journal_id INTEGER NOT NULL REFERENCES taiga.project_journal(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES taiga.employees(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(journal_id, employee_id)
);

COMMENT ON TABLE taiga.project_journal_workers IS 'Связь многие-ко-многим: запись журнала - сотрудники';
COMMENT ON COLUMN taiga.project_journal_workers.journal_id IS 'ID записи в журнале';
COMMENT ON COLUMN taiga.project_journal_workers.employee_id IS 'ID сотрудника';

CREATE INDEX IF NOT EXISTS idx_project_journal_workers_journal_id ON taiga.project_journal_workers(journal_id);
CREATE INDEX IF NOT EXISTS idx_project_journal_workers_employee_id ON taiga.project_journal_workers(employee_id);

-- ===========================================
-- 4. ОБНОВЛЯЕМ ФУНКЦИЮ update_work_progress
-- ===========================================
CREATE OR REPLACE FUNCTION taiga.update_work_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем completed_quantity и progress_percent для работы
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

-- Обновляем триггер
DROP TRIGGER IF EXISTS trigger_update_work_progress ON taiga.project_journal;
CREATE TRIGGER trigger_update_work_progress
    AFTER INSERT OR UPDATE OR DELETE ON taiga.project_journal
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_work_progress();

-- ===========================================
-- 5. ОБНОВЛЯЕМ ПРЕДСТАВЛЕНИЕ v_project_works_full
-- ===========================================
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
    pw.updated_at,
    -- Вычисляем остаток
    (pw.quantity - COALESCE(pw.completed_quantity, 0)) AS remaining_quantity
FROM taiga.project_works pw
LEFT JOIN taiga.work_stages ws ON pw.stage_id = ws.id
LEFT JOIN taiga.work_sections wsec ON pw.section_id = wsec.id
LEFT JOIN taiga.work_types wt ON pw.work_type_id = wt.id
LEFT JOIN taiga.units u ON pw.unit_id = u.id;

COMMENT ON VIEW taiga.v_project_works_full IS 'Представление project_works с полными названиями из справочников и остатком работ';

-- ===========================================
-- 6. ОБНОВЛЯЕМ ПРЕДСТАВЛЕНИЕ project_timesheet
-- ===========================================
DROP VIEW IF EXISTS taiga.project_timesheet CASCADE;

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
LEFT JOIN taiga.units u ON pw.unit_id = u.id
LEFT JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
LEFT JOIN taiga.employees e ON pjw.employee_id = e.id
ORDER BY pj.date DESC, pj.time_start, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet IS 'Табель (автоматически формируется из журнала) с информацией о сотрудниках';

-- ===========================================
-- 7. СОЗДАЁМ ПРЕДСТАВЛЕНИЕ ДЛЯ АГРЕГАЦИИ ТАБЕЛЯ ПО СОТРУДНИКАМ И ДАТАМ
-- ===========================================
CREATE OR REPLACE VIEW taiga.project_timesheet_aggregated AS
SELECT 
    pj.project_id,
    pj.date,
    e.id AS employee_id,
    TRIM(CONCAT(COALESCE(e.last_name, ''), ' ', COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''))) AS employee_name,
    SUM(pj.hours) AS total_hours,
    COUNT(DISTINCT pj.id) AS journal_entries_count
FROM taiga.project_journal pj
INNER JOIN taiga.project_journal_workers pjw ON pj.id = pjw.journal_id
INNER JOIN taiga.employees e ON pjw.employee_id = e.id
GROUP BY pj.project_id, pj.date, e.id, e.last_name, e.first_name, e.middle_name
ORDER BY pj.date DESC, e.last_name, e.first_name;

COMMENT ON VIEW taiga.project_timesheet_aggregated IS 'Агрегированный табель по сотрудникам и датам (сумма часов за день)';

COMMIT;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Структура журнала успешно обновлена!';
    RAISE NOTICE '   - Добавлены поля time_start, time_end, break_duration';
    RAISE NOTICE '   - Создана таблица project_journal_workers для связи многие-ко-многим';
    RAISE NOTICE '   - Обновлены триггеры и функции';
    RAISE NOTICE '   - Обновлены представления v_project_works_full и project_timesheet';
    RAISE NOTICE '   - Создано представление project_timesheet_aggregated для табеля';
END $$;


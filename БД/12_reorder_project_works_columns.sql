-- ===========================================
-- ИЗМЕНЕНИЕ ПОРЯДКА КОЛОНОК В project_works
-- ===========================================
-- Перемещаем stage_id, section_id, work_type_id
-- После project_id, перед unit_id
-- ===========================================

SET search_path TO taiga, public;

-- ВАЖНО: Если предыдущая транзакция была прервана, сначала выполни:
-- ROLLBACK;

BEGIN;

-- 1. Создаём временную таблицу с правильным порядком колонок
CREATE TABLE taiga.project_works_new (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES taiga.projects(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES taiga.work_stages(id) ON DELETE RESTRICT,
    section_id INTEGER REFERENCES taiga.work_sections(id) ON DELETE RESTRICT,
    work_type_id INTEGER REFERENCES taiga.work_types(id) ON DELETE RESTRICT,
    unit_id INTEGER REFERENCES taiga.units(id),
    quantity DECIMAL(10, 2),
    price_per_unit DECIMAL(10, 2),
    total_cost DECIMAL(12, 2),
    progress_percent DECIMAL(5, 2) DEFAULT 0,
    completed_quantity DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'В процессе',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Копируем данные из старой таблицы
INSERT INTO taiga.project_works_new (
    id, project_id, stage_id, section_id, work_type_id, unit_id,
    quantity, price_per_unit, total_cost, progress_percent, completed_quantity,
    status, sort_order, created_at, updated_at
)
SELECT 
    id, project_id, stage_id, section_id, work_type_id, unit_id,
    quantity, price_per_unit, total_cost, progress_percent, completed_quantity,
    status, sort_order, created_at, updated_at
FROM taiga.project_works;

-- 3. Удаляем старую таблицу
DROP TABLE taiga.project_works CASCADE;

-- 4. Переименовываем новую таблицу
ALTER TABLE taiga.project_works_new RENAME TO project_works;

-- 5. Восстанавливаем индексы
CREATE INDEX IF NOT EXISTS idx_project_works_project_id ON taiga.project_works(project_id);
CREATE INDEX IF NOT EXISTS idx_project_works_stage_id ON taiga.project_works(stage_id);
CREATE INDEX IF NOT EXISTS idx_project_works_section_id ON taiga.project_works(section_id);
CREATE INDEX IF NOT EXISTS idx_project_works_work_type_id ON taiga.project_works(work_type_id);

-- 6. Восстанавливаем триггер для updated_at
DROP TRIGGER IF EXISTS update_project_works_updated_at ON taiga.project_works;
CREATE TRIGGER update_project_works_updated_at
    BEFORE UPDATE ON taiga.project_works
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- 7. Восстанавливаем триггер для автоматического обновления прогресса
DROP TRIGGER IF EXISTS trigger_update_work_progress ON taiga.project_journal;
CREATE TRIGGER trigger_update_work_progress
    AFTER INSERT OR UPDATE OR DELETE ON taiga.project_journal
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_work_progress();

-- 8. Восстанавливаем представление v_project_works_full
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

COMMENT ON TABLE taiga.project_works IS 'Опись работ по проекту с прогрессом выполнения';

COMMIT;

-- Сообщение об успешном изменении
DO $$
BEGIN
    RAISE NOTICE '✅ Порядок колонок в таблице project_works изменён';
    RAISE NOTICE '   Порядок: id, project_id, stage_id, section_id, work_type_id, unit_id, ...';
END $$;


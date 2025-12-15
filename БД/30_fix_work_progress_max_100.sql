-- Исправление функции update_work_progress: ограничение прогресса максимумом 100%
-- ===========================================

CREATE OR REPLACE FUNCTION taiga.update_work_progress()
RETURNS TRIGGER AS $$
DECLARE
    work_quantity DECIMAL(10, 2);
    total_completed DECIMAL(10, 2);
    calculated_progress DECIMAL(5, 2);
BEGIN
    -- Получаем количество работы и сумму выполненных
    SELECT pw.quantity, COALESCE((
        SELECT SUM(quantity_completed)
        FROM taiga.project_journal pj
        WHERE pj.work_id = COALESCE(NEW.work_id, OLD.work_id)
    ), 0)
    INTO work_quantity, total_completed
    FROM taiga.project_works pw
    WHERE pw.id = COALESCE(NEW.work_id, OLD.work_id);
    
    -- Рассчитываем прогресс, ограничивая максимумом 100%
    calculated_progress := CASE
        WHEN work_quantity > 0 THEN
            LEAST(ROUND(total_completed / work_quantity * 100, 2), 100.00)
        ELSE 0
    END;
    
    -- Обновляем completed_quantity и progress_percent для работы
    UPDATE taiga.project_works pw
    SET 
        completed_quantity = total_completed,
        progress_percent = calculated_progress,
        updated_at = NOW()
    WHERE pw.id = COALESCE(NEW.work_id, OLD.work_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION taiga.update_work_progress() IS 'Обновляет прогресс выполнения работы на основе записей журнала. Прогресс ограничен максимумом 100%';

-- Обновляем все существующие записи, чтобы прогресс не превышал 100%
UPDATE taiga.project_works
SET progress_percent = LEAST(progress_percent, 100.00)
WHERE progress_percent > 100.00;




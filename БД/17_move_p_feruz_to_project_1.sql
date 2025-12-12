-- ===========================================
-- ПЕРЕМЕЩЕНИЕ ДАННЫХ В ПРОЕКТ С ID = 1
-- ===========================================
-- Переносим все записи из проекта 4 в проект 1
-- ===========================================

SET search_path TO taiga, public;

-- Обновляем project_id с 4 на 1
UPDATE taiga.p_feruz
SET project_id = 1
WHERE project_id = 4;

-- Проверка
SELECT 
    project_id,
    COUNT(*) as count
FROM taiga.p_feruz
GROUP BY project_id
ORDER BY project_id;

-- Сообщение
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Обновлено записей: % (project_id изменён с 4 на 1)', updated_count;
END $$;


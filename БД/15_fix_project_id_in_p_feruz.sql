-- ===========================================
-- ИСПРАВЛЕНИЕ project_id В p_feruz
-- ===========================================
-- Обновляем project_id с 3 на 1
-- ===========================================

SET search_path TO taiga, public;

-- Обновляем все записи в p_feruz, меняя project_id с 3 на 1
UPDATE taiga.p_feruz
SET project_id = 1
WHERE project_id = 3;

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
    RAISE NOTICE '✅ Обновлено записей: % (project_id изменён с 3 на 1)', updated_count;
END $$;


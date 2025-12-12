-- ===========================================
-- УДАЛЕНИЕ ДУБЛИКАТОВ КЛИЕНТА И ПРОЕКТА
-- ===========================================
-- Удаляем:
-- - Клиент ID 2: "Стеклянный Феруз"
-- - Проект ID 4: "5х8 гостевой" (клиент "Стеклянный Феруз")
-- 
-- Оставляем:
-- - Клиент ID 1: "Феруз"
-- - Проект ID 1: "Гостевой 5х8" (клиент "Феруз")
-- ===========================================

SET search_path TO taiga, public;

BEGIN;

-- 1. Проверяем зависимости (для безопасности)
DO $$
DECLARE
    expense_count INTEGER;
    income_count INTEGER;
    works_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO expense_count FROM taiga.expenses WHERE project_id = 4;
    SELECT COUNT(*) INTO income_count FROM taiga.income WHERE project_id = 4;
    SELECT COUNT(*) INTO works_count FROM taiga.p_feruz WHERE project_id = 4;
    
    IF expense_count > 0 OR income_count > 0 OR works_count > 0 THEN
        RAISE EXCEPTION 'Проект ID 4 имеет зависимости! Нельзя удалять.';
    END IF;
END $$;

-- 2. Удаляем проект ID 4 (если существует)
DELETE FROM taiga.projects WHERE id = 4;

-- 3. Удаляем клиента ID 2 (если существует и нет других проектов)
DELETE FROM taiga.clients 
WHERE id = 2 
AND NOT EXISTS (
    SELECT 1 FROM taiga.projects WHERE client_id = 2
);

COMMIT;

-- Проверка результата
SELECT 
    'Клиенты после удаления:' as info,
    id, name
FROM taiga.clients
ORDER BY id;

SELECT 
    'Проекты после удаления:' as info,
    p.id, p.name, c.name as client_name
FROM taiga.projects p
LEFT JOIN taiga.clients c ON p.client_id = c.id
ORDER BY p.id;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Дубликаты удалены:';
    RAISE NOTICE '   - Проект ID 4: "5х8 гостевой"';
    RAISE NOTICE '   - Клиент ID 2: "Стеклянный Феруз"';
    RAISE NOTICE '✅ Осталось:';
    RAISE NOTICE '   - Клиент ID 1: "Феруз"';
    RAISE NOTICE '   - Проект ID 1: "Гостевой 5х8"';
END $$;


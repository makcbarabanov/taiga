-- ===========================================
-- ИСПРАВЛЕНИЕ АЛИАСОВ РАЗДЕЛОВ
-- ===========================================
-- Устанавливаем NULL для алиасов, которые не были указаны пользователем
-- Оставляем только: ВЕНТ, Эл, Сантех, СУ
-- ===========================================

SET search_path TO taiga, public;

-- 1. Сначала убираем ограничение UNIQUE с alias
ALTER TABLE taiga.work_sections 
DROP CONSTRAINT IF EXISTS work_sections_alias_key;

-- 2. Убираем ограничение NOT NULL с alias (чтобы можно было устанавливать NULL)
ALTER TABLE taiga.work_sections 
ALTER COLUMN alias DROP NOT NULL;

-- 3. Обновляем алиасы: NULL для ВСЕХ, кроме указанных пользователем
UPDATE taiga.work_sections 
SET alias = NULL
WHERE name NOT IN ('Вентиляция', 'Электрика', 'Сантехника', 'СанУзел');

-- 4. Убеждаемся, что указанные алиасы правильные
UPDATE taiga.work_sections SET alias = 'ВЕНТ' WHERE name = 'Вентиляция';
UPDATE taiga.work_sections SET alias = 'Эл' WHERE name = 'Электрика';
UPDATE taiga.work_sections SET alias = 'Сантех' WHERE name = 'Сантехника';
UPDATE taiga.work_sections SET alias = 'СУ' WHERE name = 'СанУзел';

-- Проверка результата
SELECT 
    name,
    alias,
    CASE WHEN alias IS NULL THEN 'NULL' ELSE alias END as alias_display
FROM taiga.work_sections
ORDER BY sort_order;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Алиасы обновлены!';
    RAISE NOTICE '   Алиасы установлены только для: ВЕНТ, Эл, Сантех, СУ';
    RAISE NOTICE '   Остальные разделы имеют alias = NULL';
END $$;


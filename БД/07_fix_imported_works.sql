-- ===========================================
-- ИСПРАВЛЕНИЕ ИМПОРТИРОВАННЫХ РАБОТ
-- ===========================================
-- Заполняет unit_id для работ на основе данных из CSV
-- ===========================================

SET search_path TO taiga, public;

-- 1. Обновляем unit_id для работ на основе work_type_id и section_id

-- Фундамент - Установка свай (шт)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Фундамент')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Установка свай')
  AND pw.unit_id IS NULL;

-- Подсобка - Погрузка/уборка/прочее (час)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'ч')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Подсобка')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Погрузка/уборка/прочее')
  AND pw.unit_id IS NULL;

-- Подсобка - Уборка снега (час)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'ч')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Подсобка')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Уборка снега')
  AND pw.unit_id IS NULL;

-- Основа - все работы (м²) кроме исключений
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'м²')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Основа')
  AND pw.unit_id IS NULL;

-- Стены - 50х100хх6000 (м.п.)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'метр')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Стены')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = '50х100хх6000')
  AND pw.unit_id IS NULL;

-- Стены - 25х100х6000 раскос (шт)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Стены')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = '25х100х6000 раскос')
  AND pw.unit_id IS NULL;

-- Стены - Скотч дельта (рулон)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'рулон')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Стены')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Скотч дельта')
  AND pw.unit_id IS NULL;

-- Стены - все остальные (м²)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'м²')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Стены')
  AND pw.unit_id IS NULL;

-- Окна - все (шт)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Окна')
  AND pw.unit_id IS NULL;

-- Двери - все (шт)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Двери')
  AND pw.unit_id IS NULL;

-- Веранда - все (м²)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'м²')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Веранда')
  AND pw.unit_id IS NULL;

-- Потолок - Планки (торцевая, карнизная, конёк) (м.п.)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'метр')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Потолок')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name LIKE '%Планки%')
  AND pw.unit_id IS NULL;

-- Потолок - все остальные (м²)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'м²')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Потолок')
  AND pw.unit_id IS NULL;

-- СанУзел - все (м²)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'м²')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'СанУзел')
  AND pw.unit_id IS NULL;

-- Электрика - Разводка кабелей (компл)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'компл')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Электрика')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Разводка кабелей')
  AND pw.unit_id IS NULL;

-- Электрика - Ледлента (м.п.)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'метр')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Электрика')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Ледлента')
  AND pw.unit_id IS NULL;

-- Электрика - все остальные (шт)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Электрика')
  AND pw.unit_id IS NULL;

-- Сантехника - все (шт) кроме монтаж пп труб
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Сантехника')
  AND pw.work_type_id != (SELECT id FROM taiga.work_types WHERE name = 'монтаж пп труб')
  AND pw.unit_id IS NULL;

-- Сантехника - монтаж пп труб (оставляем NULL или м²)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'м²')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Сантехника')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'монтаж пп труб')
  AND pw.unit_id IS NULL;

-- Вентиляция - все (шт)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Вентиляция')
  AND pw.unit_id IS NULL;

-- Общестрой - Плинтуса (м.п.)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'метр')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Общестрой')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Плинтуса')
  AND pw.unit_id IS NULL;

-- Общестрой - Антисептирование пиломатериала (м²)
UPDATE taiga.project_works pw
SET unit_id = (SELECT id FROM taiga.units WHERE short_name = 'м²')
WHERE pw.project_id = 1 
  AND pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Общестрой')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name = 'Антисептирование пиломатериала')
  AND pw.unit_id IS NULL;

-- 2. Проверяем результат
DO $$
DECLARE
    works_without_unit INTEGER;
    total_works INTEGER;
BEGIN
    SELECT COUNT(*) INTO works_without_unit
    FROM taiga.project_works
    WHERE project_id = 1 AND unit_id IS NULL;
    
    SELECT COUNT(*) INTO total_works
    FROM taiga.project_works
    WHERE project_id = 1;
    
    RAISE NOTICE 'Всего работ: %', total_works;
    RAISE NOTICE 'Работ без unit_id после обновления: %', works_without_unit;
END $$;

-- 3. Показываем статистику по единицам измерения
SELECT 
    COALESCE(u.name, 'NULL') AS unit_name,
    COALESCE(u.short_name, 'NULL') AS unit_short,
    COUNT(*) AS count
FROM taiga.project_works pw
LEFT JOIN taiga.units u ON pw.unit_id = u.id
WHERE pw.project_id = 1
GROUP BY u.name, u.short_name
ORDER BY count DESC;

-- Сообщение об успешном обновлении
DO $$
BEGIN
    RAISE NOTICE '✅ Unit_id для работ обновлены!';
    RAISE NOTICE 'Теперь представление v_project_works_full должно корректно показывать данные';
END $$;

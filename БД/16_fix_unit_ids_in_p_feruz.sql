-- ===========================================
-- ИСПРАВЛЕНИЕ unit_id В p_feruz
-- ===========================================
-- Обновляем unit_id на основе work_type_id и section_id
-- ===========================================

SET search_path TO taiga, public;

-- Обновляем unit_id для работ раздела "Основа" с квадратными метрами
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'квадратный метр' OR short_name = 'м²' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Основа')
  AND pw.unit_id IS NULL
  AND pw.work_type_id IN (
    SELECT id FROM taiga.work_types WHERE name IN (
      'Обвяз из 50х200, 50х100',
      'Сетка от грызунов',
      'Мембрана АМ',
      'Устройство лаг из доски 50х200х6000',
      'Контррейка под домом, 25х100х6000х6шт',
      'Утепление минплитой 200мм',
      'Пароизоляция В',
      '25х150х27шт е.в.(перед половой)',
      'Устройство ОСП (сухая зона)',
      'Ламинат (сухая зона)',
      'ЦСП (су)',
      'Тёплый пол',
      'Керамогранит (СУ)'
    )
  );

-- Обновляем unit_id для работ раздела "Потолок" с квадратными метрами
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'квадратный метр' OR short_name = 'м²' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Потолок')
  AND pw.unit_id IS NULL
  AND pw.work_type_id IN (
    SELECT id FROM taiga.work_types WHERE name LIKE '%Стропильная%'
      OR name LIKE '%Пароизоляция%'
      OR name LIKE '%Обрешетка%'
      OR name LIKE '%Утепление%'
      OR name LIKE '%Мембрана%'
      OR name LIKE '%Контррейка%'
      OR name LIKE '%Профлист%'
      OR name LIKE '%Имитация%'
  );

-- Обновляем unit_id для работ раздела "Потолок" с метрами (планки)
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'метр' OR short_name = 'м' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Потолок')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name LIKE '%Планки%');

-- Обновляем unit_id для работ раздела "Стены" с квадратными метрами
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'квадратный метр' OR short_name = 'м²' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Стены')
  AND pw.unit_id IS NULL
  AND pw.work_type_id IN (
    SELECT id FROM taiga.work_types WHERE name LIKE '%Полиэтилен%'
      OR name LIKE '%Утепление%'
      OR name LIKE '%Белтермо%'
      OR name LIKE '%Контра%'
      OR name LIKE '%Обрешётка%'
      OR name LIKE '%Профлист%'
  );

-- Обновляем unit_id для работ раздела "Стены" с метрами
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'метр' OR short_name = 'м' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Стены')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name LIKE '%50х100хх6000%');

-- Обновляем unit_id для работ раздела "Стены" с рулонами
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'рулон' OR short_name = 'рул' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Стены')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name LIKE '%Скотч%');

-- Обновляем unit_id для работ раздела "Веранда" с квадратными метрами
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'квадратный метр' OR short_name = 'м²' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Веранда')
  AND pw.unit_id IS NULL;

-- Обновляем unit_id для работ раздела "Общестрой" с метрами (плинтуса)
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'метр' OR short_name = 'м' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Общестрой')
  AND pw.unit_id IS NULL
  AND pw.work_type_id IN (
    SELECT id FROM taiga.work_types WHERE name LIKE '%стены%' OR name LIKE '%пол%'
  );

-- Обновляем unit_id для работ раздела "Общестрой" с квадратными метрами (антисептирование)
UPDATE taiga.p_feruz pw
SET unit_id = (SELECT id FROM taiga.units WHERE name = 'квадратный метр' OR short_name = 'м²' LIMIT 1)
WHERE pw.section_id = (SELECT id FROM taiga.work_sections WHERE name = 'Общестрой')
  AND pw.work_type_id = (SELECT id FROM taiga.work_types WHERE name LIKE '%Антисептирование%');

-- Проверка результата
SELECT 
    u.name as unit_name,
    u.short_name,
    COUNT(*) as count
FROM taiga.p_feruz pw
LEFT JOIN taiga.units u ON pw.unit_id = u.id
GROUP BY u.id, u.name, u.short_name
ORDER BY count DESC;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Единицы измерения обновлены в таблице p_feruz';
END $$;


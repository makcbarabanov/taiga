-- ===========================================
-- ЗАПОЛНЕНИЕ ЕДИНИЦ ИЗМЕРЕНИЯ И ЦЕН ДЛЯ РАСХОДОВ
-- ===========================================
-- Заполняет единицы измерения (шт), количество (1) и цены
-- для записей расходов, где эти поля не заполнены
-- ===========================================

SET search_path TO taiga, public;

-- Простое обновление всех записей, где не заполнены единицы/количество/цена
UPDATE taiga.expenses
SET 
    unit_id = (SELECT id FROM taiga.units WHERE short_name = 'шт' LIMIT 1),
    quantity = 1,
    price = amount,
    updated_at = NOW()
WHERE amount > 0 
  AND (unit_id IS NULL OR quantity IS NULL OR quantity = 0 OR price IS NULL OR price = 0);

-- Показываем результат
SELECT 
    id,
    date,
    amount as стоимость,
    (SELECT short_name FROM taiga.units WHERE id = expenses.unit_id) as единица,
    quantity as количество,
    price as цена
FROM taiga.expenses
WHERE amount > 0
ORDER BY id DESC
LIMIT 20;


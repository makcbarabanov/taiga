-- ===========================================
-- ОБНОВЛЕНИЕ СПРАВОЧНИКА КАТЕГОРИЙ РАСХОДОВ
-- ===========================================
-- Добавляем поле alias для отображения коротких названий
-- ===========================================

SET search_path TO taiga, public;

-- 1. Добавляем поле alias в expense_categories
ALTER TABLE taiga.expense_categories
    ADD COLUMN IF NOT EXISTS alias VARCHAR(20);

-- 2. Обновляем существующие категории, добавляя алиасы
UPDATE taiga.expense_categories SET alias = 'Мат' WHERE name = 'Мат';
UPDATE taiga.expense_categories SET alias = 'ФОТ' WHERE name = 'ФОТ';
UPDATE taiga.expense_categories SET alias = 'ТЗР' WHERE name = 'ТЗР';
UPDATE taiga.expense_categories SET alias = 'Накл' WHERE name = 'Накладные';
UPDATE taiga.expense_categories SET alias = 'Инстр' WHERE name = 'Инструм';
UPDATE taiga.expense_categories SET alias = 'Расх' WHERE name = 'Расход';
UPDATE taiga.expense_categories SET alias = 'Маржа' WHERE name = 'Прибыль';

-- 3. Добавляем категорию "Маржа" если её нет (вместо "Прибыль" для личных денег)
INSERT INTO taiga.expense_categories (name, alias, description)
VALUES ('Маржа', 'Маржа', 'Личные деньги Макса (Барабанов М.В.), требуют комментария')
ON CONFLICT (name) DO UPDATE SET alias = 'Маржа';

-- Комментарии
COMMENT ON COLUMN taiga.expense_categories.alias IS 'Короткое название для отображения в интерфейсе';

-- Проверка
SELECT id, name, alias, description FROM taiga.expense_categories ORDER BY id;

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Справочник expense_categories обновлён (добавлены алиасы)';
END $$;


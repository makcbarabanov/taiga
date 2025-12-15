-- ===========================================
-- Добавление всех материалов в справочник
-- ===========================================

-- Добавляем Гвозди
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Гвозди',
    'simple',
    'кг',
    '{
        "description": "Гвозди - простой материал, измеряется в килограммах"
    }'::jsonb,
    '{
        "available_units": ["кг"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Саморезы
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Саморезы',
    'simple',
    'шт',
    '{
        "description": "Саморезы - простой материал, измеряется в штуках. Вес будет добавлен позже"
    }'::jsonb,
    '{
        "available_units": ["шт"],
        "note": "Вес будет добавлен позже"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Уголки крепёжные
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Уголки крепёжные',
    'simple',
    'шт',
    '{
        "description": "Уголки крепёжные - простой материал, измеряется в штуках"
    }'::jsonb,
    '{
        "available_units": ["шт"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Утеплители (минераловатные плиты)
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit_complex,
    secondary_unit_complex,
    rules,
    characteristics
) VALUES (
    'Утеплители (минераловатные плиты)',
    'complex',
    'уп',
    'м³',
    '{
        "description": "Утеплители (минераловатные плиты) - сложный материал с двумя единицами измерения",
        "naming_rule": "В наименовании указывается: количество упаковок и характеристики материала. Пример: Минплита Кнауф 100х610х1300, уп=0,634м3=6,34м2",
        "calculation_rule": "Объём в м³ вычисляется из упаковок. В наименовании указывается количество упаковок",
        "example": {
            "input": "Минплита Кнауф 100х610х1300, уп=0,634м3=6,34м2",
            "output": {
                "name": "Минплита Кнауф 100х610х1300, уп=0,634м3=6,34м2",
                "quantity": "м³",
                "unit": "м³"
            }
        }
    }'::jsonb,
    '{
        "available_units": ["уп", "м³", "м²", "кг"],
        "default_units_for_supply": ["уп", "м³"],
        "weight_per_m3": 30,
        "weight_formula": "вес = объём × 30",
        "area_formula": "S = (ширина/1000) × (длина/1000) × количество_листов",
        "note": "Для расчёта площади используются только 2 размера: ширина и длина листа"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit_complex = EXCLUDED.primary_unit_complex,
    secondary_unit_complex = EXCLUDED.secondary_unit_complex,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Кабель/Провод
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Кабель/Провод',
    'simple',
    'м.п.',
    '{
        "description": "Кабель/Провод - простой материал, измеряется в метрах погонных",
        "naming_rule": "В наименовании указывается: Кабель такой то / м.п. / количество_метров. Пример: Кабель ВВГ НГ 3х2,5 / м.п. / 100",
        "example": {
            "input": "Кабель ВВГ НГ 3х2,5 бухта 100м",
            "output": {
                "name": "Кабель ВВГ НГ 3х2,5 / м.п. / 100",
                "quantity": 100,
                "unit": "м.п."
            }
        }
    }'::jsonb,
    '{
        "available_units": ["м.п."],
        "note": "Обычно покупается бухтами по 100м"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Скотч
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Скотч',
    'simple',
    'шт',
    '{
        "description": "Скотч - простой материал, измеряется в штуках"
    }'::jsonb,
    '{
        "available_units": ["шт"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Плёнки/Мембраны
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Плёнки/Мембраны',
    'simple',
    'рул',
    '{
        "description": "Плёнки/Мембраны - простой материал, измеряется в рулонах",
        "naming_rule": "В наименовании обязательно указывается площадь рулона (35м², 70м², 75м²). Пример: Строизол SD (супердиффузионная мембрана 70м²)",
        "example": {
            "input": "Строизол SD (супердиффузионная мембрана 70м2)",
            "output": {
                "name": "Строизол SD (супердиффузионная мембрана 70м²)",
                "quantity": 1,
                "unit": "рул"
            }
        }
    }'::jsonb,
    '{
        "available_units": ["рул"],
        "common_sizes": [35, 70, 75],
        "note": "Площадь рулона обязательно указывается в наименовании"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Плитка/Керамогранит
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Плитка/Керамогранит',
    'simple',
    'м²',
    '{
        "description": "Плитка/Керамогранит - простой материал, измеряется в квадратных метрах",
        "naming_rule": "В наименовании дополнительно указывается количество упаковок и количество штук в упаковке (индивидуально для каждого случая)",
        "example": {
            "input": "Плитка настенная Azori Cruise Soft 31.5Х63 см 1.79 м2 глянцевая бежевая",
            "output": {
                "name": "Плитка настенная Azori Cruise Soft 31.5Х63 см 1.79 м2 глянцевая бежевая",
                "quantity": 1.79,
                "unit": "м²"
            }
        }
    }'::jsonb,
    '{
        "available_units": ["м²"],
        "note": "Количество упаковок и штук в упаковке указывается в наименовании индивидуально"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Окна
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Окна',
    'simple',
    'шт',
    '{
        "description": "Окна - простой материал, измеряется в штуках"
    }'::jsonb,
    '{
        "available_units": ["шт"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Сантехника/Фитинги
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Сантехника/Фитинги',
    'simple',
    'шт',
    '{
        "description": "Сантехника/Фитинги - простой материал, измеряется в штуках"
    }'::jsonb,
    '{
        "available_units": ["шт"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Электротехника
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Электротехника',
    'simple',
    'шт',
    '{
        "description": "Электротехника (розетки, выключатели, автоматы) - простой материал, измеряется в штуках"
    }'::jsonb,
    '{
        "available_units": ["шт"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Краски/Грунтовки/Клеи
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Краски/Грунтовки/Клеи',
    'simple',
    'шт',
    '{
        "description": "Краски/Грунтовки/Клеи - простой материал, измеряется в штуках",
        "naming_rule": "В описании обязательно указывается количество литров (или килограммов)",
        "example": {
            "input": "Краска для деревянных фасадов Tikkurila Valtti Ultra матовая цвет белый база А 9 л",
            "output": {
                "name": "Краска для деревянных фасадов Tikkurila Valtti Ultra матовая цвет белый база А 9 л",
                "quantity": 1,
                "unit": "шт"
            }
        }
    }'::jsonb,
    '{
        "available_units": ["шт"],
        "note": "В описании обязательно указывается количество литров (или килограммов)"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Ламинат/Подложка
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Ламинат/Подложка',
    'simple',
    'м²',
    '{
        "description": "Ламинат/Подложка - простой материал, измеряется в квадратных метрах"
    }'::jsonb,
    '{
        "available_units": ["м²"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Антисептик
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Антисептик',
    'simple',
    'л',
    '{
        "description": "Антисептик - простой материал, измеряется в литрах"
    }'::jsonb,
    '{
        "available_units": ["л"]
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Уплотнитель
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit,
    rules,
    characteristics
) VALUES (
    'Уплотнитель',
    'simple',
    'шт',
    '{
        "description": "Уплотнитель - простой материал, измеряется в штуках",
        "naming_rule": "В наименовании обязательно указываются характеристики (размеры, длина и т.д.)",
        "example": {
            "input": "Уплотнитель межвенцовый льняной Ясная поляна 5 мм 15 см х 20 м",
            "output": {
                "name": "Уплотнитель межвенцовый льняной Ясная поляна 5 мм 15 см х 20 м",
                "quantity": 1,
                "unit": "шт"
            }
        }
    }'::jsonb,
    '{
        "available_units": ["шт"],
        "note": "В наименовании обязательно указываются характеристики"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit = EXCLUDED.primary_unit,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();




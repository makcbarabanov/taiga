-- ===========================================
-- Справочник материалов
-- ===========================================

CREATE TABLE IF NOT EXISTS taiga.materials_directory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    material_type VARCHAR(50) NOT NULL DEFAULT 'simple' CHECK (material_type IN ('simple', 'complex')),
    -- Для простых материалов
    primary_unit VARCHAR(50),
    -- Для сложных материалов
    primary_unit_complex VARCHAR(50),
    secondary_unit_complex VARCHAR(50),
    -- Правила записи (JSONB)
    rules JSONB,
    -- Алиасы (JSONB массив строк)
    aliases JSONB DEFAULT '[]'::jsonb,
    -- Дополнительные характеристики (вес, м² и т.д.)
    characteristics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE taiga.materials_directory IS 'Справочник материалов с единицами измерения, алиасами и правилами';
COMMENT ON COLUMN taiga.materials_directory.name IS 'Общее название материала';
COMMENT ON COLUMN taiga.materials_directory.material_type IS 'Тип материала: simple (простой) или complex (сложный)';
COMMENT ON COLUMN taiga.materials_directory.primary_unit IS 'Основная единица измерения для простых материалов';
COMMENT ON COLUMN taiga.materials_directory.primary_unit_complex IS 'Первая единица измерения для сложных материалов (отображается в наименовании)';
COMMENT ON COLUMN taiga.materials_directory.secondary_unit_complex IS 'Вторая единица измерения для сложных материалов (отображается в ед.изм и кол-во)';
COMMENT ON COLUMN taiga.materials_directory.rules IS 'Правила записи материала (JSONB)';
COMMENT ON COLUMN taiga.materials_directory.aliases IS 'Алиасы (различные названия одного материала)';
COMMENT ON COLUMN taiga.materials_directory.characteristics IS 'Дополнительные характеристики (вес, м², формулы расчёта)';

CREATE OR REPLACE FUNCTION taiga.update_materials_directory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_materials_directory_updated_at ON taiga.materials_directory;
CREATE TRIGGER trigger_update_materials_directory_updated_at
BEFORE UPDATE ON taiga.materials_directory
FOR EACH ROW
EXECUTE FUNCTION taiga.update_materials_directory_updated_at();

-- Добавляем Белтермо
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit_complex,
    secondary_unit_complex,
    rules,
    characteristics
) VALUES (
    'Белтермо',
    'complex',
    'листы',
    'м²',
    '{
        "description": "Белтермо - сложный материал с двумя единицами измерения",
        "naming_rule": "В наименовании указывается: количество листов и полное описание материала. Пример: БЕЛТЕРМО, Топ, 200кг/м³, 2490×590×20мм Шип-паз 30 листов",
        "calculation_rule": "Площадь в м² вычисляется по формуле: S = (высота/1000) × (длина/1000) × количество_листов. Используются только 2 размера: высота и длина листа (в отличие от доски, где используются 6 граней)",
        "example": {
            "input": "БЕЛТЕРМО, Топ, 200кг/м³, 2490×590×20мм Шип-паз 30 листов",
            "calculation": "S = 0.59 × 2.49 × 30 = 44.07 м²",
            "output": {
                "name": "БЕЛТЕРМО, Топ, 200кг/м³, 2490×590×20мм Шип-паз 30 листов",
                "quantity": 44.07,
                "unit": "м²"
            }
        }
    }'::jsonb,
    '{
        "available_units": ["листы", "м²", "кг"],
        "default_units_for_supply": ["листы", "м²"],
        "weight_per_m3": 200,
        "weight_formula": "вес = объём × 200",
        "area_formula": "S = (высота/1000) × (длина/1000) × количество_листов",
        "note": "Для расчёта площади используются только 2 размера: высота и длина листа (в отличие от доски)"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit_complex = EXCLUDED.primary_unit_complex,
    secondary_unit_complex = EXCLUDED.secondary_unit_complex,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Белтермо
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit_complex,
    secondary_unit_complex,
    rules,
    characteristics
) VALUES (
    'Белтермо',
    'complex',
    'листы',
    'м²',
    '{
        "description": "Белтермо - сложный материал с двумя единицами измерения",
        "naming_rule": "В наименовании указывается: количество листов и полное описание материала. Пример: БЕЛТЕРМО, Топ, 200кг/м³, 2490×590×20мм Шип-паз 30 листов",
        "calculation_rule": "Площадь в м² вычисляется по формуле: S = (высота/1000) × (длина/1000) × количество_листов. Используются только 2 размера: высота и длина листа (в отличие от доски, где используются 6 граней)",
        "example": {
            "input": "БЕЛТЕРМО, Топ, 200кг/м³, 2490×590×20мм Шип-паз 30 листов",
            "calculation": "S = 0.59 × 2.49 × 30 = 44.07 м²",
            "output": {
                "name": "БЕЛТЕРМО, Топ, 200кг/м³, 2490×590×20мм Шип-паз 30 листов",
                "quantity": 44.07,
                "unit": "м²"
            }
        }
    }'::jsonb,
    '{
        "available_units": ["листы", "м²", "кг"],
        "default_units_for_supply": ["листы", "м²"],
        "weight_per_m3": 200,
        "weight_formula": "вес = объём × 200",
        "area_formula": "S = (высота/1000) × (длина/1000) × количество_листов",
        "note": "Для расчёта площади используются только 2 размера: высота и длина листа (в отличие от доски)"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit_complex = EXCLUDED.primary_unit_complex,
    secondary_unit_complex = EXCLUDED.secondary_unit_complex,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем Профнастил
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit_complex,
    secondary_unit_complex,
    rules,
    characteristics
) VALUES (
    'Профнастил',
    'complex',
    'листы',
    'м²',
    '{
        "description": "Профнастил - сложный материал с двумя единицами измерения",
        "naming_rule": "В наименовании указывается: количество листов и характеристики материала (марка, толщина, цвет). Пример: Профлист МП-20/С-20 25 листов",
        "calculation_rule": "Площадь в м² вычисляется по формуле: S = (высота/1000) × (длина/1000) × количество_листов. Используются только 2 размера: высота и длина листа",
        "example": {
            "input": "Профлист МП-20/С-20 25 листов",
            "calculation": "S = высота × длина × 25",
            "output": {
                "name": "Профлист МП-20/С-20 25 листов",
                "quantity": "м²",
                "unit": "м²"
            }
        },
        "thickness": {
            "description": "Характеристика толщины листа",
            "common": 0.45,
            "variants": [0.4, 0.45, 0.5],
            "unit": "мм"
        }
    }'::jsonb,
    '{
        "available_units": ["листы", "м²", "кг"],
        "default_units_for_supply": ["листы", "м²"],
        "weight_per_m2_0_45": 3.95,
        "weight_formula": "вес = площадь × вес_1м2",
        "weight_note": "Вес 1 м² оцинкованного профлиста толщиной 0,45 мм = 3,95 кг",
        "area_formula": "S = (высота/1000) × (длина/1000) × количество_листов",
        "note": "Для расчёта площади используются только 2 размера: высота и длина листа"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit_complex = EXCLUDED.primary_unit_complex,
    secondary_unit_complex = EXCLUDED.secondary_unit_complex,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();

-- Добавляем пиломатериал
INSERT INTO taiga.materials_directory (
    name,
    material_type,
    primary_unit_complex,
    secondary_unit_complex,
    rules,
    characteristics
) VALUES (
    'Пиломатериал',
    'complex',
    'шт',
    'м³',
    '{
        "description": "Пиломатериал - сложный материал с двумя единицами измерения",
        "naming_rule": "В наименовании указывается: размеры в мм (ширина×высота×длина) и количество в штуках. Пример: 50х200х6000х10шт",
        "calculation_rule": "Объём в м³ вычисляется по формуле: V = (ширина/1000) × (высота/1000) × (длина/1000) × количество_штук",
        "example": {
            "input": "50х200х6000х10шт",
            "calculation": "V = 0.05 × 0.2 × 6 × 10 = 0.6 м³",
            "output": {
                "name": "50х200х6000х10шт",
                "quantity": 0.6,
                "unit": "м³"
            }
        },
        "moisture_types": {
            "сухая": {
                "weight_per_m3": 510,
                "description": "Удельный вес сухой доски: 510 кг/м³"
            },
            "сырая": {
                "weight_per_m3": 810,
                "description": "Удельный вес сырой доски (естественной влажности): 810 кг/м³"
            }
        },
        "area_calculation": {
            "description": "Площадь поверхности доски (м²) = сумма площадей всех 6 граней",
            "formula": "S = (ширина×длина×2) + (высота×длина×2) + (ширина×высота×2)",
            "example": "Для доски 50×200×6000: S = (0.05×6×2) + (0.2×6×2) + (0.05×0.2×2)"
        }
    }'::jsonb,
    '{
        "available_units": ["шт", "м³", "м²", "кг"],
        "default_units_for_supply": ["шт", "м³"],
        "weight_formula": "вес = объём × удельный_вес",
        "area_formula": "S = (ширина×длина×2) + (высота×длина×2) + (ширина×высота×2)"
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET
    material_type = EXCLUDED.material_type,
    primary_unit_complex = EXCLUDED.primary_unit_complex,
    secondary_unit_complex = EXCLUDED.secondary_unit_complex,
    rules = EXCLUDED.rules,
    characteristics = EXCLUDED.characteristics,
    updated_at = NOW();


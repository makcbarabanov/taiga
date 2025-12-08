-- ===========================================
-- ШАБЛОН: Создание таблицы в схеме taiga
-- ===========================================
-- Замени "example_table" на название своей таблицы
-- Замени поля на нужные тебе
-- ===========================================

-- Создание таблицы в схеме taiga
CREATE TABLE IF NOT EXISTS taiga.example_table (
    -- Первичный ключ (обязательно)
    id SERIAL PRIMARY KEY,
    
    -- Основные поля (измени под свои нужды)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    value INTEGER,
    
    -- Временные метки (рекомендуется оставить)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска (создай нужные индексы)
CREATE INDEX IF NOT EXISTS idx_example_table_name 
    ON taiga.example_table(name);

CREATE INDEX IF NOT EXISTS idx_example_table_status 
    ON taiga.example_table(status);

-- Комментарии к таблице и полям
COMMENT ON TABLE taiga.example_table IS 'Описание таблицы: что она хранит';
COMMENT ON COLUMN taiga.example_table.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN taiga.example_table.name IS 'Название/имя';
COMMENT ON COLUMN taiga.example_table.description IS 'Описание';
COMMENT ON COLUMN taiga.example_table.status IS 'Статус записи';
COMMENT ON COLUMN taiga.example_table.created_at IS 'Дата и время создания';
COMMENT ON COLUMN taiga.example_table.updated_at IS 'Дата и время последнего обновления';

-- Функция для автоматического обновления updated_at (опционально)
CREATE OR REPLACE FUNCTION taiga.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at (опционально)
DROP TRIGGER IF EXISTS update_example_table_updated_at ON taiga.example_table;
CREATE TRIGGER update_example_table_updated_at
    BEFORE UPDATE ON taiga.example_table
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();

-- Проверка: показать структуру созданной таблицы
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'taiga' 
  AND table_name = 'example_table'
ORDER BY ordinal_position;

-- Сообщение об успешном создании
DO $$
BEGIN
    RAISE NOTICE '✅ Таблица taiga.example_table успешно создана!';
END $$;


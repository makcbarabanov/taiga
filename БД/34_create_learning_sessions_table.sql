-- Создание таблицы для отслеживания сессий обучения
CREATE TABLE IF NOT EXISTS taiga.learning_sessions (
    id SERIAL PRIMARY KEY,
    session_date DATE NOT NULL, -- Дата обучения (дата сессии, не системная дата)
    questions_count INTEGER NOT NULL DEFAULT 0, -- Общее количество вопросов
    unique_questions_count INTEGER NOT NULL DEFAULT 0, -- Количество уникальных (новых) вопросов
    correct_answers_count INTEGER NOT NULL DEFAULT 0, -- Количество ответов "да", "верно", "100%" (без корректировки)
    other_answers_count INTEGER NOT NULL DEFAULT 0, -- Количество прочих ответов (с корректировкой)
    conversion_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN questions_count > 0 THEN 
                ROUND((correct_answers_count::DECIMAL / questions_count * 100), 2)
            ELSE 0
        END
    ) STORED, -- Конверсия обучения (%)
    learned_new TEXT, -- Чему новому обучился (текстовое поле)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE taiga.learning_sessions IS 'Таблица для отслеживания сессий обучения системы классификации расходов';
COMMENT ON COLUMN taiga.learning_sessions.session_date IS 'Дата обучения (дата сессии, не системная дата)';
COMMENT ON COLUMN taiga.learning_sessions.questions_count IS 'Общее количество вопросов в сессии';
COMMENT ON COLUMN taiga.learning_sessions.unique_questions_count IS 'Количество уникальных (новых) вопросов';
COMMENT ON COLUMN taiga.learning_sessions.correct_answers_count IS 'Количество ответов "да", "верно", "100%" (без корректировки)';
COMMENT ON COLUMN taiga.learning_sessions.other_answers_count IS 'Количество прочих ответов (с корректировкой)';
COMMENT ON COLUMN taiga.learning_sessions.conversion_rate IS 'Конверсия обучения (%) - количество ответов, на которые ответили однозначно "да", "верно" или "100%"';
COMMENT ON COLUMN taiga.learning_sessions.learned_new IS 'Чему новому обучился (текстовое поле)';

CREATE INDEX IF NOT EXISTS idx_learning_sessions_date ON taiga.learning_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_created_at ON taiga.learning_sessions(created_at DESC);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_learning_sessions_updated_at
    BEFORE UPDATE ON taiga.learning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_updated_at_column();


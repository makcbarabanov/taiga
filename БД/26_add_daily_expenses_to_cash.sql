-- ===========================================
-- ДОБАВЛЕНИЕ КОЛОНКИ "РАСХОД ЗА ДЕНЬ" В ТАБЛИЦУ CASH
-- ===========================================

SET search_path TO taiga, public;

-- Добавляем колонку daily_expenses (расход за день)
ALTER TABLE taiga.cash 
ADD COLUMN IF NOT EXISTS daily_expenses DECIMAL(12, 2) DEFAULT 0;

COMMENT ON COLUMN taiga.cash.daily_expenses IS 'Сумма расходов за конкретный день';

-- Создаём функцию для расчёта расхода за день
CREATE OR REPLACE FUNCTION taiga.calculate_daily_expenses(target_date DATE)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
    daily_total DECIMAL(12, 2) := 0;
BEGIN
    -- Суммируем все расходы за указанную дату
    SELECT COALESCE(SUM(amount), 0) INTO daily_total
    FROM taiga.expenses
    WHERE date = target_date;
    
    RETURN daily_total;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION taiga.calculate_daily_expenses(DATE) IS 'Рассчитывает сумму расходов за конкретный день';

-- Обновляем существующие записи (заполняем daily_expenses для всех записей)
UPDATE taiga.cash
SET daily_expenses = taiga.calculate_daily_expenses(date)
WHERE daily_expenses IS NULL OR daily_expenses = 0;

-- Создаём функцию для автоматического обновления daily_expenses при изменении расходов
CREATE OR REPLACE FUNCTION taiga.update_cash_daily_expenses()
RETURNS TRIGGER AS $$
DECLARE
    expense_date DATE;
BEGIN
    -- Определяем дату расхода
    IF TG_OP = 'DELETE' THEN
        expense_date := OLD.date;
    ELSE
        expense_date := NEW.date;
    END IF;
    
    -- Обновляем daily_expenses для этой даты
    UPDATE taiga.cash
    SET daily_expenses = taiga.calculate_daily_expenses(expense_date)
    WHERE date = expense_date;
    
    -- Если запись за эту дату не существует, создаём её (только для INSERT/UPDATE)
    IF TG_OP != 'DELETE' AND NOT EXISTS (SELECT 1 FROM taiga.cash WHERE date = expense_date) THEN
        INSERT INTO taiga.cash (date, calculated_amount, daily_expenses)
        VALUES (
            expense_date,
            taiga.calculate_current_cash(),
            taiga.calculate_daily_expenses(expense_date)
        )
        ON CONFLICT (date) DO UPDATE
        SET daily_expenses = taiga.calculate_daily_expenses(expense_date);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаём триггер для автоматического обновления daily_expenses
DROP TRIGGER IF EXISTS trigger_update_cash_daily_expenses ON taiga.expenses;
CREATE TRIGGER trigger_update_cash_daily_expenses
    AFTER INSERT OR UPDATE OR DELETE ON taiga.expenses
    FOR EACH ROW
    EXECUTE FUNCTION taiga.update_cash_daily_expenses();

-- Сообщение об успешном выполнении
DO $$
BEGIN
    RAISE NOTICE '✅ Колонка daily_expenses успешно добавлена в таблицу cash!';
END $$;






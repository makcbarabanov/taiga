-- ===========================================
-- ФУНКЦИЯ ДЛЯ РАСЧЁТА КАССЫ
-- ===========================================
-- Касса = Сумма всех доходов - Сумма всех расходов
-- ===========================================

SET search_path TO taiga, public;

-- 1. Создаём функцию для расчёта текущей кассы
CREATE OR REPLACE FUNCTION taiga.calculate_current_cash()
RETURNS DECIMAL(12, 2) AS $$
DECLARE
    total_income DECIMAL(12, 2) := 0;
    total_expenses DECIMAL(12, 2) := 0;
    cash_amount DECIMAL(12, 2) := 0;
BEGIN
    -- Суммируем все доходы
    SELECT COALESCE(SUM(amount), 0) INTO total_income
    FROM taiga.income;
    
    -- Суммируем все расходы
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM taiga.expenses;
    
    -- Касса = Доходы - Расходы
    cash_amount := total_income - total_expenses;
    
    RETURN cash_amount;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION taiga.calculate_current_cash() IS 'Рассчитывает текущую кассу: сумма всех доходов минус сумма всех расходов';

-- 2. Создаём функцию для автоматического создания/обновления записи кассы на сегодня
CREATE OR REPLACE FUNCTION taiga.update_today_cash_record()
RETURNS VOID AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    calculated_cash DECIMAL(12, 2);
BEGIN
    -- Рассчитываем текущую кассу
    calculated_cash := taiga.calculate_current_cash();
    
    -- Проверяем, есть ли запись на сегодня
    IF EXISTS (SELECT 1 FROM taiga.cash WHERE date = today_date) THEN
        -- Обновляем расчётную сумму
        UPDATE taiga.cash
        SET calculated_amount = calculated_cash,
            difference = COALESCE(actual_amount, 0) - calculated_cash,
            updated_at = NOW()
        WHERE date = today_date;
    ELSE
        -- Создаём новую запись
        INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference)
        VALUES (today_date, calculated_cash, NULL, NULL)
        ON CONFLICT (date) DO UPDATE
        SET calculated_amount = calculated_cash,
            difference = COALESCE(actual_amount, 0) - calculated_cash,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION taiga.update_today_cash_record() IS 'Создаёт или обновляет запись кассы на текущую дату';

-- 3. Создаём триггерную функцию для автоматического обновления кассы при изменении доходов/расходов
CREATE OR REPLACE FUNCTION taiga.trigger_update_cash()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем запись кассы на сегодня после изменения доходов или расходов
    PERFORM taiga.update_today_cash_record();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION taiga.trigger_update_cash() IS 'Автоматически обновляет кассу при изменении доходов или расходов';

-- 4. Создаём триггеры на таблицах income и expenses
DROP TRIGGER IF EXISTS trigger_update_cash_on_income ON taiga.income;
CREATE TRIGGER trigger_update_cash_on_income
    AFTER INSERT OR UPDATE OR DELETE ON taiga.income
    FOR EACH ROW
    EXECUTE FUNCTION taiga.trigger_update_cash();

DROP TRIGGER IF EXISTS trigger_update_cash_on_expenses ON taiga.expenses;
CREATE TRIGGER trigger_update_cash_on_expenses
    AFTER INSERT OR UPDATE OR DELETE ON taiga.expenses
    FOR EACH ROW
    EXECUTE FUNCTION taiga.trigger_update_cash();

-- 5. Создаём начальную запись на сегодня (если её нет)
DO $$
BEGIN
    PERFORM taiga.update_today_cash_record();
    RAISE NOTICE '✅ Функции и триггеры для кассы созданы';
    RAISE NOTICE '✅ Запись кассы на сегодня создана/обновлена';
END $$;


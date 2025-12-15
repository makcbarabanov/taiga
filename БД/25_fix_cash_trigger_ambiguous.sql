-- ===========================================
-- ИСПРАВЛЕНИЕ ОШИБКИ В ТРИГГЕРЕ КАССЫ
-- ===========================================
-- Исправляем ambiguous column reference "actual_amount"
-- ===========================================

SET search_path TO taiga, public;

-- Исправляем функцию update_today_cash_record
CREATE OR REPLACE FUNCTION taiga.update_today_cash_record()
RETURNS VOID AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    calculated_cash DECIMAL(12, 2);
    existing_actual_amount DECIMAL(12, 2);
BEGIN
    -- Рассчитываем текущую кассу
    calculated_cash := taiga.calculate_current_cash();
    
    -- Получаем фактическую сумму, если запись существует
    SELECT actual_amount INTO existing_actual_amount
    FROM taiga.cash
    WHERE date = today_date;
    
    -- Проверяем, есть ли запись на сегодня
    IF existing_actual_amount IS NOT NULL OR EXISTS (SELECT 1 FROM taiga.cash WHERE date = today_date) THEN
        -- Обновляем расчётную сумму
        UPDATE taiga.cash
        SET calculated_amount = calculated_cash,
            difference = COALESCE(existing_actual_amount, 0) - calculated_cash,
            updated_at = NOW()
        WHERE date = today_date;
    ELSE
        -- Создаём новую запись
        INSERT INTO taiga.cash (date, calculated_amount, actual_amount, difference)
        VALUES (today_date, calculated_cash, NULL, NULL)
        ON CONFLICT (date) DO UPDATE
        SET calculated_amount = calculated_cash,
            difference = COALESCE(taiga.cash.actual_amount, 0) - calculated_cash,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION taiga.update_today_cash_record() IS 'Создаёт или обновляет запись кассы на текущую дату (исправлена ошибка ambiguous column)';

-- Сообщение
DO $$
BEGIN
    RAISE NOTICE '✅ Функция update_today_cash_record исправлена';
END $$;






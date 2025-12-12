-- ===========================================
-- ДОБАВЛЕНИЕ КОММЕНТАРИЕВ К ПОЛЯМ ТАБЛИЦЫ cash
-- ===========================================

SET search_path TO taiga, public;

-- Комментарии к полям таблицы cash
COMMENT ON COLUMN taiga.cash.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN taiga.cash.date IS 'Дата сверки кассы (одна запись на дату)';
COMMENT ON COLUMN taiga.cash.calculated_amount IS 'Расчётная сумма: доходы минус расходы плюс начальный остаток на эту дату';
COMMENT ON COLUMN taiga.cash.actual_amount IS 'Фактический остаток денежных средств в кассе (вводится вручную при сверке)';
COMMENT ON COLUMN taiga.cash.difference IS 'Разница между фактическим и расчётным остатком (actual_amount - calculated_amount). Используется для выявления расхождений';
COMMENT ON COLUMN taiga.cash.initial_balance IS 'Начальный остаток средств в кассе на начало периода (по умолчанию 0)';
COMMENT ON COLUMN taiga.cash.notes IS 'Примечания и комментарии к записи о сверке кассы';
COMMENT ON COLUMN taiga.cash.created_at IS 'Дата и время создания записи';
COMMENT ON COLUMN taiga.cash.updated_at IS 'Дата и время последнего обновления записи';

-- Проверка
DO $$
BEGIN
    RAISE NOTICE '✅ Комментарии добавлены к полям таблицы cash';
END $$;


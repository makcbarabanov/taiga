#!/bin/bash
# Скрипт для проверки логов PostgreSQL на сервере БД
# Запустите этот скрипт на сервере 83.217.220.97

echo "🔍 Поиск логов PostgreSQL с DELETE запросами..."
echo ""

# Находим директорию с логами
LOG_DIRS=(
    "/var/lib/postgresql/*/data/pg_log"
    "/var/log/postgresql"
    "/var/lib/pgsql/*/data/pg_log"
    "/usr/local/pgsql/data/pg_log"
)

FOUND_LOGS=false

for dir in "${LOG_DIRS[@]}"; do
    if ls $dir/*.log 1> /dev/null 2>&1; then
        echo "✅ Найдены логи в: $dir"
        FOUND_LOGS=true
        
        # Ищем DELETE запросы
        echo ""
        echo "📋 Последние DELETE запросы к таблице expenses:"
        grep -h "DELETE FROM taiga.expenses" $dir/*.log | tail -50
        
        # Ищем последние логи
        echo ""
        echo "📁 Последние 5 лог-файлов:"
        ls -lt $dir/*.log | head -5
        
        break
    fi
done

if [ "$FOUND_LOGS" = false ]; then
    echo "❌ Логи не найдены в стандартных местах"
    echo "Попробуйте найти вручную:"
    echo "  find / -name '*.log' -path '*/postgresql/*' 2>/dev/null"
fi














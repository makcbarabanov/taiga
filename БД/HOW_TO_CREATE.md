# 📝 Как создать схему taiga в DBeaver

## Способ 1: Выполнить объединённый скрипт (рекомендуется)

1. **Откройте DBeaver**
2. **Подключитесь к базе данных:**
   - Хост: `83.217.220.97`
   - Порт: `5432`
   - База: `default_db`
   - Пользователь: `marabot`
   - Пароль: `2nix8#mN&Er5tR`

3. **Откройте SQL-скрипт:**
   - В DBeaver: `Файл` → `Открыть SQL-скрипт`
   - Или: `Ctrl+Alt+X` (SQL Editor)
   - Выберите файл: `БД/create_all.sql`

4. **Выполните скрипт:**
   - Нажмите `Ctrl+Enter` или кнопку "Execute SQL Script" (▶️)
   - Или: `Alt+X`

5. **Проверьте результат:**
   - В навигаторе слева обновите схему (правый клик → `Обновить`)
   - Должна появиться схема `taiga` с таблицами

## Способ 2: Выполнить скрипты по отдельности

Если объединённый скрипт не работает, выполните скрипты по порядку:

1. `01_create_schema.sql` - создание схемы
2. `02_create_directories.sql` - справочники
3. `03_create_main_tables.sql` - основные таблицы
4. `04_create_client_tables.sql` - таблицы для клиентов

## Проверка создания

После выполнения скрипта выполните в SQL-редакторе:

```sql
-- Проверить, что схема создана
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'taiga';

-- Посмотреть все таблицы в схеме taiga
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'taiga'
ORDER BY table_name;
```

Должны увидеть все таблицы:
- clients
- shops
- tools
- expense_categories
- units
- projects
- income
- expenses
- cash
- project_statistics
- project_works
- project_materials_estimate
- project_journal
- material_mapping

## Если что-то пошло не так

1. **Проверьте подключение к БД**
2. **Убедитесь, что используете правильного пользователя** (`marabot`)
3. **Проверьте, что схема `taiga` не существует** (если существует, можно удалить: `DROP SCHEMA taiga CASCADE;`)
4. **Посмотрите вкладку "Лог" в DBeaver** - там будут ошибки, если они есть

---

**После создания схемы обновите навигатор в DBeaver (F5) и схема `taiga` появится!** ✅




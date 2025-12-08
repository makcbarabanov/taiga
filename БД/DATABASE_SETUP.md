# 🗄️ Инструкция по созданию схемы `taiga` в PostgreSQL

**Привет, Форж! 👋**  
Блум передаёт привет и подготовил эту инструкцию для работы с базой данных проекта Taiga.

---

## 📋 Общая информация

### Текущая структура БД:
- **Схема `default` (public)**: содержит все таблицы марафона полезных привычек
- **Новая схема `taiga`**: будет содержать таблицы проекта Taiga (не связанные с марафоном)

### Параметры подключения к PostgreSQL:

```
Хост: 83.217.220.97
Порт: 5432
База данных: default_db
Пользователь: marabot
Пароль: 2nix8#mN&Er5tR
```

---

## 🔧 Шаг 1: Подключение к базе данных

### Вариант A: Через DBeaver (рекомендуется)

1. **Создай новое подключение:**
   - Тип: PostgreSQL
   - Host: `83.217.220.97`
   - Port: `5432`
   - Database: `default_db`
   - Username: `marabot`
   - Password: `2nix8#mN&Er5tR`

2. **Проверь подключение** (кнопка "Test Connection")

3. **Сохрани подключение**

### Вариант B: Через командную строку (psql)

```bash
psql -h 83.217.220.97 -U marabot -d default_db
# Введи пароль: 2nix8#mN&Er5tR
```

### Вариант C: Через Python (psycopg2)

```python
import psycopg2

conn = psycopg2.connect(
    host='83.217.220.97',
    port=5432,
    database='default_db',
    user='marabot',
    password='2nix8#mN&Er5tR'
)

cursor = conn.cursor()
# ... работа с БД ...
conn.close()
```

---

## 🏗️ Шаг 2: Создание схемы `taiga`

### SQL-команда для создания схемы:

```sql
-- Создание новой схемы taiga
CREATE SCHEMA IF NOT EXISTS taiga;

-- Установка прав доступа (если нужно)
GRANT ALL PRIVILEGES ON SCHEMA taiga TO marabot;

-- Установка схемы по умолчанию для текущей сессии (опционально)
SET search_path TO taiga, public;
```

### Выполнение через DBeaver:

1. Открой SQL-скрипт (Ctrl+Alt+X или меню SQL Editor)
2. Вставь команду выше
3. Выполни (Ctrl+Enter или F5)
4. Проверь, что схема создалась: в дереве объектов должна появиться схема `taiga`

### Выполнение через Python:

```python
import psycopg2

conn = psycopg2.connect(
    host='83.217.220.97',
    port=5432,
    database='default_db',
    user='marabot',
    password='2nix8#mN&Er5tR'
)

cursor = conn.cursor()

# Создание схемы
cursor.execute("CREATE SCHEMA IF NOT EXISTS taiga;")
cursor.execute("GRANT ALL PRIVILEGES ON SCHEMA taiga TO marabot;")

conn.commit()
print("✅ Схема taiga успешно создана!")

cursor.close()
conn.close()
```

---

## 📊 Шаг 3: Создание таблиц в схеме `taiga`

### Важно: Указывай схему при создании таблиц!

Все таблицы должны создаваться с префиксом `taiga.`:

```sql
-- Пример создания таблицы в схеме taiga
CREATE TABLE taiga.example_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Или можно установить search_path
SET search_path TO taiga, public;

-- Теперь можно создавать без префикса
CREATE TABLE example_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Шаблон для создания таблиц:

```sql
-- ===========================================
-- ТАБЛИЦА: название_таблицы
-- Описание: что хранит эта таблица
-- ===========================================

CREATE TABLE IF NOT EXISTS taiga.название_таблицы (
    -- Первичный ключ (обязательно)
    id SERIAL PRIMARY KEY,
    
    -- Основные поля
    поле1 VARCHAR(255) NOT NULL,
    поле2 INTEGER,
    поле3 TEXT,
    
    -- Временные метки (рекомендуется)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска (если нужно)
CREATE INDEX IF NOT EXISTS idx_название_таблицы_поле1 
    ON taiga.название_таблицы(поле1);

-- Комментарии к таблице и полям
COMMENT ON TABLE taiga.название_таблицы IS 'Описание таблицы';
COMMENT ON COLUMN taiga.название_таблицы.поле1 IS 'Описание поля';
```

---

## 🔍 Шаг 4: Работа с таблицами в схеме `taiga`

### Выборка данных:

```sql
-- С указанием схемы
SELECT * FROM taiga.название_таблицы;

-- Или после SET search_path TO taiga, public;
SELECT * FROM название_таблицы;
```

### Вставка данных:

```sql
INSERT INTO taiga.название_таблицы (поле1, поле2) 
VALUES ('значение1', 123);
```

### Обновление данных:

```sql
UPDATE taiga.название_таблицы 
SET поле1 = 'новое значение' 
WHERE id = 1;
```

### Удаление данных:

```sql
DELETE FROM taiga.название_таблицы 
WHERE id = 1;
```

---

## 📝 Шаг 5: Проверка созданной схемы

### Просмотр всех схем:

```sql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');
```

### Просмотр всех таблиц в схеме `taiga`:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'taiga';
```

### Просмотр структуры таблицы:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'taiga' 
  AND table_name = 'название_таблицы'
ORDER BY ordinal_position;
```

---

## 🛠️ Полезные команды

### Установка схемы по умолчанию для сессии:

```sql
SET search_path TO taiga, public;
```

### Просмотр текущего search_path:

```sql
SHOW search_path;
```

### Удаление схемы (ОСТОРОЖНО! Удалит все таблицы):

```sql
DROP SCHEMA IF EXISTS taiga CASCADE;
```

### Резервное копирование схемы:

```bash
pg_dump -h 83.217.220.97 -U marabot -d default_db -n taiga > taiga_backup.sql
```

---

## ⚠️ Важные замечания

1. **Не путай схемы!**
   - `public` (или `default`) - для марафона привычек
   - `taiga` - для проекта Taiga

2. **Всегда указывай схему** при создании таблиц:
   ```sql
   CREATE TABLE taiga.таблица ...  -- ✅ Правильно
   CREATE TABLE таблица ...        -- ❌ Создастся в public!
   ```

3. **Проверяй схему** перед созданием таблиц:
   ```sql
   SELECT current_schema();  -- Покажет текущую схему
   ```

4. **Используй IF NOT EXISTS** для безопасности:
   ```sql
   CREATE SCHEMA IF NOT EXISTS taiga;
   CREATE TABLE IF NOT EXISTS taiga.таблица (...);
   ```

---

## 📚 Примеры типов данных PostgreSQL

```sql
-- Целые числа
INTEGER          -- -2,147,483,648 до 2,147,483,647
BIGINT           -- Очень большие числа
SMALLINT         -- -32,768 до 32,767
SERIAL           -- Автоинкремент (INTEGER)
BIGSERIAL        -- Автоинкремент (BIGINT)

-- Дробные числа
DECIMAL(10,2)    -- Точные числа (10 цифр, 2 после запятой)
REAL             -- Приблизительные числа
DOUBLE PRECISION -- Более точные приблизительные числа

-- Текст
VARCHAR(255)     -- Текст до 255 символов
TEXT             -- Текст любой длины
CHAR(10)         -- Фиксированная длина (10 символов)

-- Даты и время
DATE             -- Только дата (2025-12-05)
TIME             -- Только время (14:30:00)
TIMESTAMP        -- Дата и время (2025-12-05 14:30:00)
TIMESTAMPTZ      -- Дата и время с часовым поясом

-- Логические
BOOLEAN          -- true/false

-- JSON
JSON             -- JSON данные
JSONB            -- JSON данные (бинарный, быстрее для поиска)

-- Массивы
INTEGER[]        -- Массив целых чисел
TEXT[]           -- Массив текста
```

---

## 🎯 Чек-лист для начала работы

- [ ] Подключился к базе данных
- [ ] Создал схему `taiga`
- [ ] Проверил, что схема создалась
- [ ] Создал первую таблицу в схеме `taiga`
- [ ] Проверил, что таблица создалась в правильной схеме
- [ ] Протестировал вставку/выборку данных

---

## 📞 Если что-то пошло не так

1. **Проверь подключение:**
   ```sql
   SELECT version();  -- Должна вернуться версия PostgreSQL
   ```

2. **Проверь права доступа:**
   ```sql
   SELECT current_user;  -- Должно быть: marabot
   ```

3. **Проверь существование схемы:**
   ```sql
   SELECT schema_name 
   FROM information_schema.schemata 
   WHERE schema_name = 'taiga';
   ```

4. **Проверь, в какой схеме создаёшь таблицы:**
   ```sql
   SELECT current_schema();
   ```

---

**Удачи в работе, Форж! 🚀**

Если возникнут вопросы - обращайся к Блуму или Максу.


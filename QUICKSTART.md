# 🚀 Быстрый старт - Проект Taiga

## 📋 Что уже готово:

### ✅ База данных:
- SQL-скрипты для создания схемы и всех таблиц
- Справочники (клиенты, магазины, инструменты, категории, единицы измерения)
- Основные таблицы (объекты, доходы, расходы, касса)
- Таблицы для клиентов (статистика, работы, снаб, журнал, табель)

### ✅ Frontend:
- Главная страница (объекты) - `taiga.html`
- Страница доходов - `income.html`
- Страница расходов - `expenses.html` (с редактируемыми ячейками)
- Страница кассы - `cash.html`

## 🔧 Что нужно сделать:

### 1. Создать базу данных:

```bash
# Подключиться к PostgreSQL
psql -h 83.217.220.97 -U marabot -d default_db

# Выполнить скрипты по порядку:
\i БД/01_create_schema.sql
\i БД/02_create_directories.sql
\i БД/03_create_main_tables.sql
\i БД/04_create_client_tables.sql
```

Или использовать DBeaver и выполнить скрипты последовательно.

### 2. Установить зависимости Backend:

```powershell
cd E:\Forge\_projects\taiga\backend
npm install
```

**Примечание:** Backend API уже создан и готов к использованию! Все endpoints реализованы.

### 3. Запустить Backend API:

**Вариант 1: через PowerShell скрипт:**
```powershell
cd E:\Forge\_projects\taiga\backend
.\RUN.ps1
```

**Вариант 2: вручную:**
```powershell
cd E:\Forge\_projects\taiga\backend
$env:PATH += ";C:\Program Files\nodejs\"
npm start
```

**Проверка:** `http://localhost:3000/api/health`

### 4. Запустить frontend:

**Через Python (рекомендуется):**
```powershell
cd E:\Forge\_projects\taiga\frontend
python -m http.server 8000
```

**Через Node.js:**
```powershell
cd E:\Forge\_projects\taiga\frontend
npx http-server -p 8000
```

**Открой:** `http://localhost:8000/taiga.html`

⚠️ **Важно:** Сервер должен запускаться из папки `frontend`, чтобы файлы находились в корне!

## 📝 Следующие шаги:

1. ✅ Создать страницу клиента `client.html`
2. ✅ Создать скрипт для импорта данных из CSV
3. ✅ Создать Backend API
4. ⏳ Реализовать обработку PDF/XLS файлов
5. ⏳ Настроить автоматическое обновление раздела "СНАБ" при добавлении расходов

## ⚠️ Важно:

- Все таблицы создаются в схеме `taiga`, не в `public`
- Backend API обязателен для работы frontend
- Данные из Google Sheets нужно импортировать через скрипт

---

**Forge 🔧**  
*Строитель Цифровых Домов*




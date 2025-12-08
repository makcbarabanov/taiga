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

### 2. Создать Backend API:

Нужно создать API сервер (Node.js/Python/другой), который будет:
- Подключаться к PostgreSQL
- Предоставлять REST API для всех операций
- Обрабатывать запросы от frontend

**Примерные endpoints:**
- `GET /api/projects` - список объектов
- `POST /api/projects` - создать объект
- `GET /api/clients` - список клиентов
- `POST /api/clients` - создать клиента
- `GET /api/income` - список доходов
- `POST /api/income` - создать доход
- `GET /api/expenses` - список расходов
- `POST /api/expenses` - создать расход
- И т.д.

### 3. Настроить API URL:

В файле `frontend/assets/js/api.js` изменить:
```javascript
const API_BASE_URL = 'http://localhost:3000/api'; // На реальный URL
```

### 4. Запустить frontend:

Можно использовать любой локальный сервер:
```bash
# Python
cd frontend
python -m http.server 8000

# Node.js
npx http-server frontend -p 8000
```

Открыть в браузере: `http://localhost:8000/taiga.html`

## 📝 Следующие шаги:

1. ✅ Создать страницу клиента `client-feruz.html`
2. ✅ Создать скрипт для импорта данных из CSV
3. ⏳ Создать Backend API
4. ⏳ Реализовать обработку PDF/XLS файлов
5. ⏳ Настроить автоматическое обновление раздела "СНАБ" при добавлении расходов

## ⚠️ Важно:

- Все таблицы создаются в схеме `taiga`, не в `public`
- Backend API обязателен для работы frontend
- Данные из Google Sheets нужно импортировать через скрипт

---

**Forge 🔧**  
*Строитель Цифровых Домов*



# 🚀 Taiga Backend API

Backend API для системы финансового учёта Taiga на Node.js + Express + PostgreSQL.

## 📋 Требования

- Node.js 14+ 
- PostgreSQL (уже настроен на сервере)
- npm или yarn

## 🔧 Установка

1. **Установите зависимости:**
```bash
cd backend
npm install
```

2. **Настройте переменные окружения:**
```bash
cp .env.example .env
```

Отредактируйте `.env` файл (или оставьте значения по умолчанию):
```
DB_HOST=83.217.220.97
DB_PORT=5432
DB_NAME=default_db
DB_USER=marabot
DB_PASSWORD=2nix8#mN&Er5tR
DB_SCHEMA=taiga
PORT=3000
```

## 🚀 Запуск

**Режим разработки (с автоперезагрузкой):**
```bash
npm run dev
```

**Продакшн:**
```bash
npm start
```

Сервер запустится на `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - проверка работы API

### Клиенты
- `GET /api/clients` - список всех клиентов
- `GET /api/clients/:id` - получить клиента по ID
- `POST /api/clients` - создать клиента
- `PUT /api/clients/:id` - обновить клиента
- `DELETE /api/clients/:id` - удалить клиента

### Проекты (Объекты)
- `GET /api/projects` - список всех проектов
- `GET /api/projects/:id` - получить проект по ID
- `POST /api/projects` - создать проект
- `PUT /api/projects/:id` - обновить проект
- `DELETE /api/projects/:id` - удалить проект

### Доходы
- `GET /api/income` - список всех доходов
- `GET /api/income?project_id=1` - доходы по проекту
- `GET /api/income/:id` - получить доход по ID
- `POST /api/income` - создать доход
- `PUT /api/income/:id` - обновить доход
- `DELETE /api/income/:id` - удалить доход

### Расходы
- `GET /api/expenses` - список всех расходов
- `GET /api/expenses?project_id=1` - расходы по проекту
- `GET /api/expenses?category_id=1` - расходы по категории
- `GET /api/expenses/:id` - получить расход по ID
- `POST /api/expenses` - создать расход
- `PUT /api/expenses/:id` - обновить расход
- `DELETE /api/expenses/:id` - удалить расход

### Касса
- `GET /api/cash` - список всех записей кассы
- `GET /api/cash?date=2025-12-07` - запись за дату
- `GET /api/cash/:id` - получить запись по ID
- `POST /api/cash` - создать запись
- `PUT /api/cash/:id` - обновить запись
- `DELETE /api/cash/:id` - удалить запись

### Справочники
- `GET /api/units` - единицы измерения
- `GET /api/expense-categories` - категории расходов
- `GET /api/shops` - магазины
- `GET /api/tools` - инструменты

### Проекты клиентов
- `GET /api/project-statistics?project_id=1` - статистика по дням
- `GET /api/project-works?project_id=1` - опись работ
- `GET /api/project-materials-estimate?project_id=1` - ведомость материалов (смета)
- `GET /api/project-journal?project_id=1` - журнал работ
- `GET /api/project-timesheet?project_id=1` - табель (read-only)

Все endpoints поддерживают CRUD операции (кроме табеля - только чтение).

## 🔒 Безопасность

⚠️ **Важно:** В продакшне необходимо:
- Использовать переменные окружения для паролей
- Добавить аутентификацию (JWT токены)
- Настроить CORS для конкретных доменов
- Добавить валидацию данных

## 📝 Примеры запросов

**Создать клиента:**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Иванов Иван", "phone": "+79001234567"}'
```

**Получить все проекты:**
```bash
curl http://localhost:3000/api/projects
```

**Создать доход:**
```bash
curl -X POST http://localhost:3000/api/income \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "date": "2025-12-07", "amount": 100000, "year": 2025, "month": 12}'
```

---

**Forge 🔧**  
*Строитель Цифровых Домов*



# 🚀 Быстрый запуск Backend API

## Шаг 1: Установка зависимостей

```bash
cd backend
npm install
```

## Шаг 2: Настройка переменных окружения

Создайте файл `.env` в папке `backend`:

```env
DB_HOST=83.217.220.97
DB_PORT=5432
DB_NAME=default_db
DB_USER=marabot
DB_PASSWORD=2nix8#mN&Er5tR
DB_SCHEMA=taiga
PORT=3000
NODE_ENV=development
```

## Шаг 3: Запуск

**Режим разработки (с автоперезагрузкой):**
```bash
npm run dev
```

**Продакшн:**
```bash
npm start
```

## Шаг 4: Проверка

Откройте в браузере: `http://localhost:3000/api/health`

Должен вернуться ответ:
```json
{
  "status": "ok",
  "message": "Taiga API is running"
}
```

## Готово! 🎉

Теперь Backend API работает и готов принимать запросы от frontend.

---

**Примечание:** Если используете `nodemon` для разработки, установите его глобально:
```bash
npm install -g nodemon
```

Или используйте `npm run dev` (nodemon должен быть в devDependencies).



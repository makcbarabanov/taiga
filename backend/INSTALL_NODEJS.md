# 📦 Установка Node.js

Node.js не установлен на вашем компьютере. Нужно его установить для работы Backend API.

## Способ 1: Официальный установщик (рекомендуется)

1. **Скачайте Node.js:**
   - Перейдите на https://nodejs.org/
   - Скачайте LTS версию (рекомендуется)
   - Выберите Windows Installer (.msi)

2. **Установите:**
   - Запустите скачанный файл
   - Следуйте инструкциям установщика
   - **Важно:** Убедитесь, что галочка "Add to PATH" отмечена

3. **Проверьте установку:**
   - Закройте и откройте PowerShell заново
   - Выполните:
     ```powershell
     node --version
     npm --version
     ```
   - Должны увидеть версии (например, v20.10.0 и 10.2.3)

## Способ 2: Через Chocolatey (если установлен)

```powershell
choco install nodejs
```

## Способ 3: Через winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## После установки

1. **Закройте и откройте PowerShell заново** (чтобы обновился PATH)

2. **Перейдите в папку backend:**
   ```powershell
   cd E:\Forge\_projects\taiga\backend
   ```

3. **Установите зависимости:**
   ```powershell
   npm install
   ```

4. **Создайте файл `.env`:**
   - Скопируйте `.env.example` в `.env`
   - Или создайте вручную (см. `START.md`)

5. **Запустите сервер:**
   ```powershell
   npm run dev
   ```

## Проверка

После запуска откройте в браузере:
`http://localhost:3000/api/health`

Должен вернуться ответ:
```json
{
  "status": "ok",
  "message": "Taiga API is running"
}
```

---

**Примечание:** Если после установки команды `node` и `npm` всё ещё не работают, перезагрузите компьютер или добавьте путь к Node.js в PATH вручную.



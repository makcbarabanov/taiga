# ⚡ Быстрое решение

## Проблема: `npm` не распознан

**Решение:** Установите Node.js

### Самый быстрый способ:

1. **Скачайте и установите Node.js:**
   - https://nodejs.org/
   - Выберите LTS версию
   - Скачайте Windows Installer (.msi)
   - Установите (всё по умолчанию)

2. **Перезапустите PowerShell** (закройте и откройте заново)

3. **Проверьте:**
   ```powershell
   node --version
   npm --version
   ```

4. **Установите зависимости:**
   ```powershell
   cd E:\Forge\_projects\taiga\backend
   npm install
   ```

5. **Создайте `.env` файл** (см. `START.md`)

6. **Запустите:**
   ```powershell
   npm run dev
   ```

---

**Время установки:** ~5 минут



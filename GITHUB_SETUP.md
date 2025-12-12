# 🔧 Инструкция по настройке GitHub для проекта Тайга

**Для:** Форж  
**Дата:** 5 декабря 2025  
**Проект:** Taiga - Система финансового учёта строительной компании

---

## 📊 Текущий статус Git

✅ **Git репозиторий инициализирован**  
✅ **Есть первый коммит:** `Initial commit: Taiga - система финансового учёта строительной компании`  
✅ **Ветка:** `master`  
❌ **Remote не настроен** (нет связи с GitHub)  
⚠️ **Есть незакоммиченные изменения:** `README.md`

---

## 🚀 Шаг 1: Создать репозиторий на GitHub

### Вариант A: Через веб-интерфейс GitHub

1. **Зайди на GitHub:** https://github.com
2. **Войди в аккаунт** (или создай новый, если нет)
3. **Нажми кнопку "+"** (в правом верхнем углу) → **"New repository"**
4. **Заполни форму:**
   - **Repository name:** `taiga` (или `taiga-finance`, `taiga-accounting`)
   - **Description:** `Система финансового учёта строительной компании`
   - **Visibility:** 
     - ✅ **Private** (если проект приватный)
     - ✅ **Public** (если хочешь открытый код)
   - ❌ **НЕ ставь галочки:**
     - "Add a README file" (у нас уже есть)
     - "Add .gitignore" (у нас уже есть)
     - "Choose a license" (можно добавить позже)
5. **Нажми "Create repository"**

### Вариант B: Использовать существующий репозиторий

Если репозиторий уже создан, просто запомни его URL:
- `https://github.com/makcbarabanov/taiga.git` (HTTPS)
- `git@github.com:makcbarabanov/taiga.git` (SSH)

---

## 🔗 Шаг 2: Подключить GitHub к локальному репозиторию

### Команды для выполнения:

```bash
# 1. Перейти в директорию проекта
cd E:\Forge\_projects\taiga

# 2. Добавить remote
git remote add origin https://github.com/makcbarabanov/taiga.git

# 3. Проверить, что remote добавлен
git remote -v
```

**Должно показать:**
```
origin  https://github.com/makcbarabanov/taiga.git (fetch)
origin  https://github.com/makcbarabanov/taiga.git (push)
```

---

## 📤 Шаг 3: Отправить код на GitHub

### Сначала закоммитить изменения:

```bash
# 1. Проверить статус
git status

# 2. Добавить все изменения
git add --all

# 3. Создать коммит
git commit -m "Обновлён README.md"

# 4. Отправить на GitHub (ветка master, не main!)
git push -u origin master
```

**Важно:** 
- Если GitHub создал репозиторий с веткой `main`, а у нас `master`, нужно либо:
  - Переименовать локальную ветку: `git branch -M main` (затем `git push -u origin main`)
  - Или переименовать на GitHub: Settings → Branches → Default branch → `master`

---

## ✅ Шаг 4: Проверка

1. **Открой репозиторий на GitHub:** https://github.com/makcbarabanov/taiga
2. **Проверь, что все файлы загружены**
3. **Проверь, что README.md отображается корректно**

---

## 🔄 Ежедневная работа с Git

### Полный цикл (повторяй каждый день):

```bash
# 1. Проверить статус
git status

# 2. Добавить все изменения
git add --all

# 3. Создать коммит с описанием
git commit -m "Описание изменений"

# 4. Отправить на GitHub
git push origin master
```

### Примеры описаний коммитов:

- `"Добавлена страница expenses.html"`
- `"Создана таблица clients в БД"`
- `"Исправлена ошибка в API"`
- `"Обновлена документация"`
- `"051225"` (дата)

---

## 🆘 Если что-то пошло не так

### Ошибка: "remote origin already exists"

**Решение:**
```bash
# Удалить старый remote
git remote remove origin

# Добавить заново
git remote add origin https://github.com/makcbarabanov/taiga.git
```

### Ошибка: "failed to push some refs"

**Решение:**
```bash
# Сначала скачать изменения с GitHub (если они есть)
git pull origin master --allow-unrelated-histories

# Затем отправить
git push origin master
```

### Ошибка: "authentication failed"

**Решение:**
1. **Использовать Personal Access Token вместо пароля:**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token → выбрать права `repo`
   - Скопировать токен и использовать его как пароль

2. **Или настроить SSH ключ:**
   - Создать SSH ключ: `ssh-keygen -t ed25519 -C "твой_email@example.com"`
   - Добавить в GitHub: Settings → SSH and GPG keys → New SSH key
   - Использовать SSH URL: `git@github.com:makcbarabanov/taiga.git`

---

## 📋 Чек-лист для Форжа

- [ ] Создан репозиторий на GitHub
- [ ] Remote добавлен (`git remote -v` показывает origin)
- [ ] Изменения закоммичены (`git status` чистый)
- [ ] Код отправлен на GitHub (`git push` успешен)
- [ ] Репозиторий виден на GitHub со всеми файлами
- [ ] README.md отображается корректно

---

## 🔗 Полезные ссылки

- **GitHub:** https://github.com
- **Документация Git:** https://git-scm.com/doc
- **Шпаргалка по Git:** `E:\Island\_config\git_cheatsheet.md`

---

## 💡 Советы

1. **Коммить часто** — лучше много маленьких коммитов, чем один огромный
2. **Писать понятные описания** — чтобы потом понять, что делал
3. **Пушить каждый день** — это резервная копия в облаке!
4. **Проверять статус** — перед коммитом всегда делай `git status`

---

**Удачи, Форж! 🚀**

Если возникнут вопросы — обращайся к Максу или Блуму.


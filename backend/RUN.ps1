# Скрипт для запуска Backend API
# Добавляет Node.js в PATH и запускает сервер

$env:PATH += ";C:\Program Files\nodejs\"

Write-Host "🚀 Запуск Taiga Backend API..." -ForegroundColor Green

# Проверка Node.js
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "Node.js: $nodeVersion" -ForegroundColor Cyan
Write-Host "npm: $npmVersion" -ForegroundColor Cyan

# Запуск сервера
Write-Host "`nЗапуск сервера на порту 3000..." -ForegroundColor Yellow
npm start



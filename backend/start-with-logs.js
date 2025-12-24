// Скрипт для запуска сервера с логированием в файл
const fs = require('fs');
const path = require('path');

// Создаём папку для логов, если её нет
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Имя файла лога с датой и временем
const logFileName = `server-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.log`;
const logFilePath = path.join(logsDir, logFileName);

// Создаём поток для записи в файл
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Переопределяем console.log и console.error для записи в файл и консоль
const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] [LOG] ${message}\n`);
    originalLog.apply(console, args);
};

console.error = function(...args) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] [ERROR] ${message}\n`);
    originalError.apply(console, args);
};

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] [UNCAUGHT EXCEPTION] ${error.stack}\n`);
    originalError('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] [UNHANDLED REJECTION] ${reason}\n`);
    originalError('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log(`📝 Логирование в файл: ${logFilePath}`);
console.log('🚀 Запуск сервера...\n');

// Запускаем сервер
require('./server.js');


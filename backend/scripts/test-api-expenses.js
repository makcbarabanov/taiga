// Проверка API расходов
const http = require('http');

http.get('http://localhost:3000/api/expenses', (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const expenses = JSON.parse(data);
            const today = expenses.filter(e => e.date === '2025-12-10');
            
            console.log(`Всего расходов в базе: ${expenses.length}`);
            console.log(`Расходов за 10.12.2025: ${today.length}\n`);
            
            console.log('Расходы за 10.12.2025 (отсортированные по ID DESC):');
            today.sort((a, b) => b.id - a.id);
            today.forEach((e, i) => {
                console.log(`${i+1}. ID:${e.id} | ${e.subcategory || 'пусто'} | ${e.amount}₽`);
            });
            
            // Проверяем расход на связь
            const connection = today.find(e => e.subcategory === 'связь');
            if (connection) {
                console.log(`\n✅ Расход на связь найден: ID ${connection.id}, сумма ${connection.amount}₽`);
            } else {
                console.log('\n❌ Расход на связь НЕ найден в ответе API!');
            }
        } catch (error) {
            console.error('Ошибка парсинга:', error.message);
        }
    });
}).on('error', (e) => {
    console.error('Ошибка запроса:', e.message);
    console.log('Убедитесь, что бэкенд запущен на порту 3000');
});


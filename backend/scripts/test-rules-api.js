// ===========================================
// Тест API для правил
// ===========================================

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/rules',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Статус: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            const rules = JSON.parse(data);
            console.log(`✅ API работает! Найдено правил: ${rules.length}`);
            rules.forEach(rule => {
                console.log(`  - ${rule.section}: ${rule.title}`);
            });
        } else {
            console.log(`❌ Ошибка: ${res.statusCode}`);
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Ошибка запроса:', error.message);
});

req.end();




// ===========================================
// Страница - Касса
// ===========================================

let cashHistory = [];
let initialBalance = 0; // Начальный остаток (динамический)

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    setupTodayDate();
    await loadCashHistory();
    await calculateTodayCash();
});

// Установка сегодняшней даты
function setupTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('today-date').value = today;
}

// Загрузка истории кассы
async function loadCashHistory() {
    try {
        const tbody = document.getElementById('cash-tbody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Загрузка...</td></tr>';
        
        cashHistory = await cashAPI.getAll();
        renderCashHistory();
    } catch (error) {
        console.error('Ошибка загрузки истории кассы:', error);
        document.getElementById('cash-tbody').innerHTML = 
            '<tr><td colspan="6" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

// Отображение истории кассы
function renderCashHistory() {
    const tbody = document.getElementById('cash-tbody');
    
    if (cashHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>Нет записей</p></tr>';
        return;
    }
    
    // Сортируем по дате (новые сверху)
    const sorted = [...cashHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(item => {
        const diffClass = parseFloat(item.difference) >= 0 ? 'positive' : 'negative';
        return `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${formatNumber(item.calculated_amount)} ₽</td>
                <td>${formatNumber(item.actual_amount)} ₽</td>
                <td class="${diffClass}">${formatNumber(item.difference)} ₽</td>
                <td>${formatNumber(item.initial_balance)} ₽</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteCashRecord(${item.id})">Удалить</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Расчёт сегодняшней кассы
async function calculateTodayCash() {
    try {
        // Получаем все доходы
        const income = await incomeAPI.getAll();
        const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        // Получаем все расходы
        const expenses = await expensesAPI.getAll();
        const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        // Получаем начальный остаток (из последней записи кассы или из настроек)
        const lastCashRecord = cashHistory.length > 0 
            ? cashHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            : null;
        
        initialBalance = lastCashRecord ? parseFloat(lastCashRecord.initial_balance) || 0 : 0;
        document.getElementById('today-initial').value = initialBalance;
        
        // Расчётная сумма = доходы - расходы + начальный остаток
        const calculated = totalIncome - totalExpenses + initialBalance;
        
        document.getElementById('calculated-amount').textContent = formatNumber(calculated) + ' ₽';
        
        // Если есть запись за сегодня, показываем факт
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = cashHistory.find(item => item.date === today);
        
        if (todayRecord) {
            document.getElementById('today-actual').value = todayRecord.actual_amount || '';
            updateDifference(calculated, parseFloat(todayRecord.actual_amount) || 0);
        }
    } catch (error) {
        console.error('Ошибка расчёта кассы:', error);
    }
}

// Обновление разницы
function updateDifference(calculated, actual) {
    const difference = actual - calculated;
    const diffElement = document.getElementById('difference');
    diffElement.textContent = formatNumber(difference) + ' ₽';
    diffElement.className = difference >= 0 ? 'positive' : 'negative';
    
    document.getElementById('actual-amount').textContent = formatNumber(actual) + ' ₽';
}

// Сохранение сегодняшней кассы
async function saveTodayCash() {
    const date = document.getElementById('today-date').value;
    const actual = parseFloat(document.getElementById('today-actual').value);
    const initial = parseFloat(document.getElementById('today-initial').value) || 0;
    
    if (!date || isNaN(actual)) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    // Пересчитываем расчётную сумму
    const income = await incomeAPI.getAll();
    const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    const expenses = await expensesAPI.getAll();
    const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    const calculated = totalIncome - totalExpenses + initial;
    const difference = actual - calculated;
    
    // Проверяем, есть ли уже запись за эту дату
    const existingRecord = cashHistory.find(item => item.date === date);
    
    const data = {
        date: date,
        calculated_amount: calculated,
        actual_amount: actual,
        difference: difference,
        initial_balance: initial
    };
    
    try {
        if (existingRecord) {
            await cashAPI.update(existingRecord.id, data);
        } else {
            await cashAPI.create(data);
        }
        
        await loadCashHistory();
        await calculateTodayCash();
        alert('Данные кассы сохранены!');
    } catch (error) {
        console.error('Ошибка сохранения кассы:', error);
        alert('Ошибка сохранения данных кассы');
    }
}

// Удаление записи кассы
async function deleteCashRecord(id) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
        return;
    }
    
    try {
        await cashAPI.delete(id);
        await loadCashHistory();
        await calculateTodayCash();
        alert('Запись успешно удалена!');
    } catch (error) {
        console.error('Ошибка удаления записи:', error);
        alert('Ошибка удаления записи');
    }
}

// Обновление разницы при изменении фактического остатка
document.getElementById('today-actual').addEventListener('input', function() {
    const calculated = parseFloat(document.getElementById('calculated-amount').textContent.replace(/\s/g, '').replace('₽', '')) || 0;
    const actual = parseFloat(this.value) || 0;
    updateDifference(calculated, actual);
});



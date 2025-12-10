// ===========================================
// Страница - Касса
// ===========================================

let cashHistory = [];

// Получение даты сегодня в локальном часовом поясе (не UTC)
function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadCashHistory();
    // НЕ создаём запись автоматически - только при сохранении фактической суммы
});

// Создание или обновление записи кассы за текущую дату
// ФУНКЦИЯ НЕ ИСПОЛЬЗУЕТСЯ - записи создаются только при сохранении фактической суммы
async function ensureTodayCashRecord() {
    // Функция оставлена для совместимости, но не выполняет никаких действий
    // Записи кассы создаются только при сохранении фактической суммы пользователем
    return;
}

// Глобальная функция для обновления кассы (вызывается из других страниц)
// НЕ создаёт запись автоматически - только обновляет навигацию
window.updateTodayCash = async function() {
    if (typeof updateCashInNavigation === 'function') {
        updateCashInNavigation();
    }
    // Перезагружаем историю на странице кассы, если мы там
    if (document.getElementById('cash-tbody')) {
        await loadCashHistory();
    }
};

// Загрузка истории кассы
async function loadCashHistory() {
    try {
        const tbody = document.getElementById('cash-tbody');
        if (!tbody) {
            console.error('Элемент cash-tbody не найден');
            return;
        }
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Загрузка...</td></tr>';
        
        cashHistory = await cashAPI.getAll();
        await renderCashHistory();
        
        // Обновляем кассу в навигации после загрузки данных
        if (typeof updateCashInNavigation === 'function') {
            await updateCashInNavigation();
        }
    } catch (error) {
        console.error('Ошибка загрузки истории кассы:', error);
        const tbody = document.getElementById('cash-tbody');
        if (tbody) {
            tbody.innerHTML = 
                '<tr><td colspan="5" class="empty-state">Ошибка загрузки данных: ' + error.message + '</td></tr>';
        }
    }
}

// Форматирование числа без десятичных
function formatCashNumber(num) {
    if (num === null || num === undefined) return '0';
    const n = Math.round(parseFloat(num));
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(n);
}

// Отображение истории кассы
async function renderCashHistory() {
    const tbody = document.getElementById('cash-tbody');
    
    if (!tbody) {
        console.error('Элемент cash-tbody не найден в renderCashHistory');
        return;
    }
    
    // Проверяем, есть ли запись за сегодня
    const today = getTodayDateString();
    
    const todayRecord = cashHistory.find(item => {
        // Преобразуем дату в локальное время
        let itemDate = '';
        if (item.date instanceof Date) {
            const d = item.date;
            itemDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } else if (item.date) {
            // Если это строка, создаём Date объект и используем локальную дату
            const d = new Date(item.date);
            itemDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        
        return itemDate === today;
    });
    
    // Вычисляем расчётную сумму для сегодня
    let todayCalculated = 0;
    if (!todayRecord) {
        // Если записи за сегодня нет, вычисляем расчётную сумму
        try {
            const income = await incomeAPI.getAll();
            const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            
            const expenses = await expensesAPI.getAll();
            const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            
            todayCalculated = totalIncome - totalExpenses;
        } catch (error) {
            console.error('Ошибка вычисления расчётной суммы:', error);
        }
    }
    
    if (!cashHistory || cashHistory.length === 0) {
        // Если нет записей, показываем только строку для создания новой записи за сегодня
        const todayFormatted = new Date(today).toLocaleDateString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        tbody.innerHTML = `
            <tr data-id="new-${Date.now()}">
                <td>${todayFormatted}</td>
                <td>${formatCashNumber(todayCalculated)} ₽</td>
                <td>
                    <input 
                        type="text" 
                        class="editable-cash-amount" 
                        value="" 
                        data-id="new-${Date.now()}"
                        data-calculated="${todayCalculated}"
                        onkeypress="if(event.key==='Enter') { event.preventDefault(); document.getElementById('save-btn-new-${Date.now()}').click(); }"
                        placeholder="Введите фактическую сумму"
                    />
                </td>
                <td class="negative" id="diff-new-${Date.now()}">${formatCashNumber(-todayCalculated)} ₽</td>
                <td>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button 
                            class="btn btn-success" 
                            id="save-btn-new-${Date.now()}"
                            onclick="saveCashRecord('new-${Date.now()}')"
                            title="Принять изменения"
                            style="padding: 5px 10px; min-width: 30px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 16px;"
                        >✓</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Сортируем по дате (новые сверху)
    const sorted = [...cashHistory].sort((a, b) => {
        try {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        } catch (e) {
            return 0;
        }
    });
    
    let html = '';
    
    // Если записи за сегодня нет, добавляем строку для создания
    if (!todayRecord) {
        const todayFormatted = new Date(today).toLocaleDateString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
               const newId = `new-${Date.now()}`;
               html += `
                   <tr data-id="${newId}" class="cash-today">
                <td>${todayFormatted}</td>
                <td>${formatCashNumber(todayCalculated)} ₽</td>
                <td>
                    <input 
                        type="text" 
                        class="editable-cash-amount" 
                        value="" 
                        data-id="${newId}"
                        data-calculated="${todayCalculated}"
                        onkeypress="if(event.key==='Enter') { event.preventDefault(); document.getElementById('save-btn-${newId}').click(); }"
                        placeholder="Введите фактическую сумму"
                    />
                </td>
                <td class="negative" id="diff-${newId}">${formatCashNumber(-todayCalculated)} ₽</td>
                <td>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button 
                            class="btn btn-success" 
                            id="save-btn-${newId}"
                            onclick="saveCashRecord('${newId}')"
                            title="Принять изменения"
                            style="padding: 5px 10px; min-width: 30px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 16px;"
                        >✓</button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    // Добавляем существующие записи
    html += sorted.map(item => {
        try {
            const calculated = parseFloat(item.calculated_amount) || 0;
            const actualAmount = parseFloat(item.actual_amount) || 0;
            const difference = actualAmount - calculated;
            const diffClass = difference >= 0 ? 'positive' : 'negative';
            
            // Форматирование даты
            let formattedDate = '-';
            let isToday = false;
            if (item.date) {
                try {
                    const date = new Date(item.date);
                    formattedDate = date.toLocaleDateString('ru-RU', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    });
                    
                    // Проверяем, является ли дата сегодняшней
                    const today = getTodayDateString();
                    let itemDate = '';
                    if (item.date instanceof Date) {
                        const d = item.date;
                        itemDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    } else if (item.date) {
                        const d = new Date(item.date);
                        itemDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    }
                    isToday = itemDate === today;
                } catch (e) {
                    formattedDate = item.date;
                }
            }
            
            const rowClass = isToday ? 'cash-today' : 'cash-past';
            
            return `
                <tr data-id="${item.id}" class="${rowClass}">
                    <td>${formattedDate}</td>
                    <td>${formatCashNumber(calculated)} ₽</td>
                    <td>
                        <input 
                            type="text" 
                            class="editable-cash-amount" 
                            value="${actualAmount > 0 ? formatCashNumber(actualAmount) : ''}" 
                            data-id="${item.id}"
                            data-calculated="${calculated}"
                            data-original="${actualAmount > 0 ? actualAmount : ''}"
                            onkeypress="if(event.key==='Enter') { event.preventDefault(); document.getElementById('save-btn-${item.id}').click(); }"
                            placeholder="0"
                        />
                    </td>
                    <td class="${diffClass}" id="diff-${item.id}">${formatCashNumber(difference)} ₽</td>
                    <td>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <button 
                                class="btn btn-success" 
                                id="save-btn-${item.id}"
                                onclick="saveCashRecord(${item.id})"
                                title="Принять изменения"
                                style="padding: 5px 10px; min-width: 30px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 16px;"
                            >✓</button>
                            <button 
                                class="btn btn-danger" 
                                onclick="deleteCashRecord(${item.id})"
                                title="Удалить строку"
                                style="padding: 5px 10px; min-width: 30px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 16px;"
                            >✕</button>
                        </div>
                    </td>
                </tr>
            `;
        } catch (error) {
            console.error('Ошибка рендеринга строки:', error, item);
            return '';
        }
    }).join('');
    
    tbody.innerHTML = html;
}


// Сохранение записи кассы (вызывается при нажатии на галку)
window.saveCashRecord = async function(id) {
    const input = document.querySelector(`input[data-id="${id}"]`);
    if (!input) {
        console.error('Input не найден для записи:', id);
        return;
    }
    
    const newValue = input.value;
    if (!newValue || newValue.trim() === '') {
        alert('Введите фактическую сумму');
        return;
    }
    
    const calculated = parseFloat(input.getAttribute('data-calculated')) || 0;
    
    // Если id начинается с "new-", это новая запись
    if (id.toString().startsWith('new-')) {
        await createNewCashRecord(newValue, calculated);
    } else {
        await updateActualAmount(id, newValue, calculated);
    }
};

// Создание новой записи кассы
async function createNewCashRecord(actualValue, calculated) {
    const input = document.querySelector(`input[data-id^="new-"]`);
    if (!input) {
        console.error('Input для новой записи не найден');
        return;
    }
    
    const today = getTodayDateString();
    
    const cleanedValue = actualValue.toString().replace(/\s/g, '').replace(',', '.');
    const actual = cleanedValue ? parseFloat(cleanedValue) : null;
    
    if (actual === null || isNaN(actual)) {
        alert('Введите корректную сумму');
        return;
    }
    
    // Пересчитываем calculated_amount для сегодня
    const income = await incomeAPI.getAll();
    const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    const expenses = await expensesAPI.getAll();
    const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    const calculatedAmount = totalIncome - totalExpenses;
    const difference = actual - calculatedAmount;
    
    const data = {
        date: today,
        calculated_amount: calculatedAmount,
        actual_amount: actual,
        difference: difference,
        initial_balance: 0
    };
    
    console.log('Создаём новую запись кассы:', data);
    
    try {
            await cashAPI.create(data);
        // Перезагружаем историю
        await loadCashHistory();
        if (typeof updateCashInNavigation === 'function') {
            updateCashInNavigation();
        }
    } catch (error) {
        console.error('Ошибка создания записи:', error);
        alert('Ошибка создания записи: ' + error.message);
    }
}

// Обновление фактического остатка из таблицы
async function updateActualAmount(id, newValue, calculated) {
    // Парсим значение, убирая пробелы и запятые
    const cleanedValue = newValue.toString().replace(/\s/g, '').replace(',', '.');
    const actual = cleanedValue ? parseFloat(cleanedValue) : null;
    
    const record = cashHistory.find(item => item.id === id);
    
    if (!record) {
        console.error('Запись не найдена:', id);
        return;
    }
    
    const today = getTodayDateString();
    
    // Получаем дату записи в локальном времени
    let recordDate = '';
    if (record.date instanceof Date) {
        const d = record.date;
        recordDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (record.date) {
        // Преобразуем строку в Date и используем локальную дату
        const d = new Date(record.date);
        recordDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    
    const isToday = recordDate === today;
    
    // Если это запись за сегодня, пересчитываем calculated_amount
    if (isToday) {
        const income = await incomeAPI.getAll();
        const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        const expenses = await expensesAPI.getAll();
        const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        calculated = totalIncome - totalExpenses;
    } else {
    // Если calculated не передан, берём из record
    if (calculated === undefined || calculated === null) {
        calculated = parseFloat(record.calculated_amount) || 0;
        }
    }
    
    const actualAmount = actual !== null ? actual : 0;
    const difference = actualAmount - calculated;
    
    // Обновляем разницу сразу в интерфейсе
    const diffElement = document.getElementById(`diff-${id}`);
    if (diffElement) {
        diffElement.textContent = formatCashNumber(difference) + ' ₽';
        diffElement.className = difference >= 0 ? 'positive' : 'negative';
    }
    
    // Обновляем calculated_amount в таблице, если это сегодня
    if (isToday) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            const calculatedCell = row.cells[1]; // Колонка "Касса"
            if (calculatedCell) {
                calculatedCell.textContent = formatCashNumber(calculated) + ' ₽';
            }
        }
    }
    
    // recordDate уже в формате YYYY-MM-DD
    const data = {
        date: recordDate, // Важно: используем дату из существующей записи, не меняем её
        calculated_amount: calculated,
        actual_amount: actual !== null ? actual : null,
        difference: difference,
        initial_balance: parseFloat(record.initial_balance) || 0
    };
    
    try {
        // Обновляем существующую запись по ID
        await cashAPI.update(id, data);
        
        // Перезагружаем историю, чтобы обновить отображение
        await loadCashHistory();
        if (typeof updateCashInNavigation === 'function') {
            updateCashInNavigation();
        }
    } catch (error) {
        console.error('Ошибка обновления:', error);
        alert('Ошибка обновления данных: ' + error.message);
        await loadCashHistory(); // Восстанавливаем исходные данные
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
        if (typeof updateCashInNavigation === 'function') {
            updateCashInNavigation();
        }
        alert('Запись успешно удалена!');
    } catch (error) {
        console.error('Ошибка удаления записи:', error);
        alert('Ошибка удаления записи');
    }
}

// Стили для редактируемого поля
const style = document.createElement('style');
style.textContent = `
    .editable-cash-amount {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        text-align: right;
    }
    .editable-cash-amount:focus {
        border-color: var(--secondary-color);
        outline: none;
    }
`;
document.head.appendChild(style);




// ===========================================
// Обновление навигации с актуальной суммой кассы
// ===========================================

// Форматирование суммы кассы (без значка рубля, только число)
function formatCashNumber(num) {
    if (num === null || num === undefined) return '0';
    const n = Math.round(parseFloat(num));
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(n);
}

// Загрузка и обновление суммы кассы в навигации (доступна глобально)
window.updateCashInNavigation = async function() {
    try {
        const cashLink = document.getElementById('cash-nav-link');
        if (!cashLink) return;

        // Вычисляем сумму кассы: доходы - расходы
        const income = await incomeAPI.getAll();
        const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        const expenses = await expensesAPI.getAll();
        const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        const calculated = totalIncome - totalExpenses;
        
        // Обновляем текст ссылки на сумму без значка рубля
        cashLink.textContent = formatCashNumber(calculated);
        
        // Проверяем разницу с фактической суммой за сегодня
        // Получаем дату в локальном часовом поясе (не UTC)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayLocal = `${year}-${month}-${day}`;
        const cashRecords = await cashAPI.getAll();
        
        // Ищем запись за сегодня, сравнивая даты как строки
        const todayRecord = cashRecords.find(item => {
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
            return itemDate === todayLocal;
        });
        
        if (todayRecord) {
            // Если actual_amount null или undefined, считаем что не совпадает (красный)
            let actualAmount = null;
            if (todayRecord.actual_amount !== null && todayRecord.actual_amount !== undefined) {
                // Парсим значение, убирая пробелы и форматирование
                const value = String(todayRecord.actual_amount).replace(/\s/g, '').replace(',', '.');
                actualAmount = parseFloat(value);
                if (isNaN(actualAmount)) {
                    actualAmount = null;
                }
            }
            
            if (actualAmount === null) {
                // Если actual_amount не заполнен - красный цвет
                cashLink.classList.add('cash-mismatch');
                cashLink.classList.remove('cash-match');
            } else {
                // Округляем оба значения для сравнения
                const calculatedRounded = Math.round(calculated);
                const actualRounded = Math.round(actualAmount);
                const difference = Math.abs(actualRounded - calculatedRounded);
                
                // Если разница равна 0 - зелёный цвет, иначе красный
                if (difference === 0) {
                    cashLink.classList.add('cash-match');
                    cashLink.classList.remove('cash-mismatch');
                } else {
                    cashLink.classList.add('cash-mismatch');
                    cashLink.classList.remove('cash-match');
                }
            }
        } else {
            // Если записи за сегодня нет, считаем что не совпадает (красный)
            cashLink.classList.add('cash-mismatch');
            cashLink.classList.remove('cash-match');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки кассы:', error);
        // В случае ошибки оставляем текст "Касса"
        const cashLink = document.getElementById('cash-nav-link');
        if (cashLink) {
            cashLink.textContent = 'Касса';
            cashLink.classList.remove('cash-match', 'cash-mismatch');
        }
    }
};

// Загрузка и обновление суммы расходов в навигации (доступна глобально)
window.updateExpensesInNavigation = async function() {
    try {
        const expensesLink = document.getElementById('expenses-nav-link');
        if (!expensesLink) return;

        const expenses = await expensesAPI.getAll();
        const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        // Находим элемент для суммы расходов
        let amountSpan = expensesLink.querySelector('.expenses-amount');
        if (!amountSpan) {
            // Добавляем пробел перед суммой
            expensesLink.appendChild(document.createTextNode(' '));
            amountSpan = document.createElement('span');
            amountSpan.className = 'expenses-amount';
            expensesLink.appendChild(amountSpan);
        }
        
        amountSpan.textContent = formatCashNumber(totalExpenses);
        
    } catch (error) {
        console.error('Ошибка загрузки суммы расходов:', error);
    }
};

// Обновление кассы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateCashInNavigation();
});

// Обновление кассы при возврате на страницу (если пользователь вернулся с другой страницы)
window.addEventListener('focus', () => {
    updateCashInNavigation();
});


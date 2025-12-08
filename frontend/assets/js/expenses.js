// ===========================================
// Страница - Расходы (с редактируемыми ячейками)
// ===========================================

let expenses = [];
let projects = [];
let clients = [];
let categories = [];
let shops = [];
let units = [];
let changedCells = new Map(); // Хранит изменённые ячейки

// Форматирование числа без .00 (для количества)
function formatNumberInput(num) {
    if (num === null || num === undefined || num === '') return '';
    const n = parseFloat(num);
    if (isNaN(n)) return '';
    // Если число целое, возвращаем без .00
    if (n % 1 === 0) return n.toString();
    return n.toString();
}

// Форматирование цены с разделителями тысяч (для отображения)
function formatPrice(num) {
    if (num === null || num === undefined) return '0';
    const n = parseFloat(num);
    if (isNaN(n)) return '0';
    // Форматируем с разделителями тысяч, без .00 если целое
    if (n % 1 === 0) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(n);
    }
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n);
}

// Форматирование цены для input (с разделителями тысяч)
function formatPriceInput(num) {
    if (num === null || num === undefined || num === '') return '';
    const n = parseFloat(num);
    if (isNaN(n)) return '';
    // Форматируем с разделителями тысяч
    if (n % 1 === 0) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(n);
    }
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n);
}

// Парсинг цены из input (убираем пробелы)
function parsePriceInput(value) {
    if (!value) return null;
    const cleaned = value.toString().replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

// Форматирование цены при потере фокуса
function formatPriceOnBlur(input) {
    const value = parsePriceInput(input.value);
    if (value !== null) {
        input.value = formatPriceInput(value);
    }
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    await loadClients();
    await loadCategories();
    await loadShops();
    await loadUnits();
    await loadExpenses();
});

// Загрузка проектов
async function loadProjects() {
    try {
        projects = await projectsAPI.getAll();
        populateProjectFilter();
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
    }
}

// Загрузка клиентов
async function loadClients() {
    try {
        clients = await clientsAPI.getAll();
    } catch (error) {
        console.error('Ошибка загрузки клиентов:', error);
    }
}

// Загрузка категорий
async function loadCategories() {
    try {
        categories = await api.get('/expense-categories');
        populateCategoryFilter();
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

// Загрузка магазинов
async function loadShops() {
    try {
        shops = await api.get('/shops');
    } catch (error) {
        console.error('Ошибка загрузки магазинов:', error);
    }
}

// Загрузка единиц измерения
async function loadUnits() {
    try {
        units = await api.get('/units');
    } catch (error) {
        console.error('Ошибка загрузки единиц измерения:', error);
    }
}

// Загрузка расходов
async function loadExpenses() {
    try {
        const tbody = document.getElementById('expenses-tbody');
        tbody.innerHTML = '<tr><td colspan="13" class="loading">Загрузка...</td></tr>';
        
        expenses = await expensesAPI.getAll();
        renderExpenses();
        updateSummary();
    } catch (error) {
        console.error('Ошибка загрузки расходов:', error);
        document.getElementById('expenses-tbody').innerHTML = 
            '<tr><td colspan="12" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

// Отображение расходов
function renderExpenses(filteredExpenses = null) {
    const tbody = document.getElementById('expenses-tbody');
    const data = filteredExpenses || expenses;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="empty-state"><p>Нет расходов</p><p>Добавьте первую строку</p></td></tr>';
        return;
    }
    
    // Используем порядковый номер начиная с 1
    tbody.innerHTML = data.map((expense, index) => {
        const project = projects.find(p => p.id === expense.project_id);
        const projectName = project ? project.name : 'Неизвестно';
        const client = project ? clients.find(c => c.id === project.client_id) : null;
        const clientName = client ? client.name : 'Неизвестно';
        const category = categories.find(c => c.id === expense.category_id);
        const categoryName = category ? category.name : 'Неизвестно';
        const shop = expense.shop_id ? shops.find(s => s.id === expense.shop_id) : null;
        const shopName = shop ? shop.name : '';
        const unit = expense.unit_id ? units.find(u => u.id === expense.unit_id) : null;
        const unitName = unit ? unit.short_name || unit.name : '';
        
        // Форматируем дату для input type="date" (YYYY-MM-DD)
        let dateValue = '';
        if (expense.date) {
            if (typeof expense.date === 'string') {
                // Если дата в формате "2023-12-06T00:00:00.000Z" или "2023-12-06"
                const dateStr = expense.date.split('T')[0];
                // Проверяем, что дата валидна
                if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateValue = dateStr;
                }
            } else if (expense.date instanceof Date) {
                dateValue = expense.date.toISOString().split('T')[0];
            }
        }
        
        return `
            <tr data-id="${expense.id}">
                <td class="col-id">${index + 1}</td>
                <td><input type="date" class="editable-cell" data-field="date" data-id="${expense.id}" value="${dateValue}"></td>
                <td>
                    <select class="editable-cell" data-field="category_id" data-id="${expense.id}">
                        ${categories.map(c => `<option value="${c.id}" ${c.id === expense.category_id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </td>
                <td class="col-subcategory"><textarea class="editable-cell" data-field="subcategory" data-id="${expense.id}" rows="2">${expense.subcategory || ''}</textarea></td>
                <td class="col-unit">
                    <select class="editable-cell" data-field="unit_id" data-id="${expense.id}">
                        <option value="">-</option>
                        ${units.map(u => `<option value="${u.id}" ${u.id === expense.unit_id ? 'selected' : ''}>${u.short_name || u.name}</option>`).join('')}
                    </select>
                </td>
                <td class="col-quantity"><input type="number" class="editable-cell" data-field="quantity" data-id="${expense.id}" step="0.01" value="${formatNumberInput(expense.quantity)}" onchange="calculateAmount(${expense.id})"></td>
                <td class="col-price"><input type="text" class="editable-cell" data-field="price" data-id="${expense.id}" value="${formatPriceInput(expense.price)}" onchange="calculateAmount(${expense.id})" onblur="formatPriceOnBlur(this)"></td>
                <td class="col-amount"><span class="amount-cell" data-id="${expense.id}">${formatPrice(expense.amount)}</span> ₽</td>
                <td class="col-client" data-client-name="${clientName}">${clientName}</td>
                <td class="col-project">
                    <select class="editable-cell" data-field="project_id" data-id="${expense.id}" onchange="updateClientNameInRow(this)">
                        ${projects.map(p => {
                            const projClient = clients.find(c => c.id === p.client_id);
                            const projClientName = projClient ? projClient.name : '';
                            return `<option value="${p.id}" data-client="${projClientName}" ${p.id === expense.project_id ? 'selected' : ''}>${p.name}</option>`;
                        }).join('')}
                    </select>
                </td>
                <td class="col-shop">
                    <select class="editable-cell" data-field="shop_id" data-id="${expense.id}">
                        <option value="">-</option>
                        ${shops.map(s => `<option value="${s.id}" ${s.id === expense.shop_id ? 'selected' : ''}>${s.name}</option>`).join('')}
                    </select>
                </td>
                <td class="col-comment"><input type="text" class="editable-cell" data-field="comment" data-id="${expense.id}" value="${expense.comment || ''}"></td>
            </tr>
        `;
    }).join('');
    
    // Добавляем обработчики событий для редактируемых ячеек
    setupEditableCells();
}

// Настройка редактируемых ячеек
function setupEditableCells() {
    const cells = document.querySelectorAll('.editable-cell');
    cells.forEach(cell => {
        // Для textarea используем 'input', для остальных 'change'
        const eventType = cell.tagName === 'TEXTAREA' ? 'input' : 'change';
        
        cell.addEventListener(eventType, function() {
            const expenseId = this.dataset.id;
            // Проверяем, это новый расход или существующий
            const isNew = expenseId.toString().startsWith('new-');
            const expenseIdNum = isNew ? expenseId : parseInt(expenseId);
            
            const field = this.dataset.field;
            let value = this.value;
            
            // Для поля price парсим значение
            if (field === 'price') {
                value = parsePriceInput(value);
            } else if (field === 'quantity') {
                value = parseFloat(value) || null;
            }
            
            // Помечаем ячейку как изменённую
            this.classList.add('changed');
            
            // Сохраняем изменение
            if (!changedCells.has(expenseIdNum)) {
                changedCells.set(expenseIdNum, {});
            }
            changedCells.get(expenseIdNum)[field] = value;
        });
    });
}

// Расчёт стоимости (количество * цена)
function calculateAmount(expenseId) {
    const row = document.querySelector(`tr[data-id="${expenseId}"]`);
    const quantityInput = row.querySelector('[data-field="quantity"]');
    const priceInput = row.querySelector('[data-field="price"]');
    
    const quantity = parseFloat(quantityInput.value) || 0;
    const price = parsePriceInput(priceInput.value) || 0;
    const amount = quantity * price;
    
    const amountCell = row.querySelector(`.amount-cell[data-id="${expenseId}"]`);
    amountCell.textContent = formatPrice(amount);
    
    // Форматируем цену при изменении
    if (price > 0) {
        priceInput.value = formatPriceInput(price);
    }
    
    // Обновляем значение в changedCells
    const expenseIdNum = expenseId.toString().startsWith('new-') ? expenseId : parseInt(expenseId);
    if (!changedCells.has(expenseIdNum)) {
        changedCells.set(expenseIdNum, {});
    }
    changedCells.get(expenseIdNum).amount = amount;
    changedCells.get(expenseIdNum).quantity = quantity;
    changedCells.get(expenseIdNum).price = price;
}

// Заполнение фильтров
function populateProjectFilter() {
    const select = document.getElementById('filter-project');
    select.innerHTML = '<option value="">Все объекты</option>' +
        projects.map(project => {
            const client = clients.find(c => c.id === project.client_id);
            const clientName = client ? client.name : 'Неизвестно';
            return `<option value="${project.id}">${clientName} - ${project.name}</option>`;
        }).join('');
}

function populateCategoryFilter() {
    const select = document.getElementById('filter-category');
    select.innerHTML = '<option value="">Все категории</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

// Обновление итогов
function updateSummary(filteredExpenses = null) {
    const data = filteredExpenses || expenses;
    const total = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    document.getElementById('total-expenses').textContent = formatPrice(total) + ' ₽';
}

// Фильтрация расходов
function filterExpenses() {
    const projectId = document.getElementById('filter-project').value;
    const categoryId = document.getElementById('filter-category').value;
    const month = document.getElementById('filter-month').value;
    
    let filtered = expenses;
    
    if (projectId) {
        filtered = filtered.filter(item => item.project_id === parseInt(projectId));
    }
    
    if (categoryId) {
        filtered = filtered.filter(item => item.category_id === parseInt(categoryId));
    }
    
    if (month) {
        const [year, monthNum] = month.split('-');
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getFullYear() === parseInt(year) && 
                   (itemDate.getMonth() + 1) === parseInt(monthNum);
        });
    }
    
    renderExpenses(filtered);
    updateSummary(filtered);
}

// Добавление новой строки
function addNewRow() {
    const tbody = document.getElementById('expenses-tbody');
    const today = new Date().toISOString().split('T')[0];
    
    const newId = `new-${Date.now()}`;
    const newRow = `
        <tr data-id="${newId}">
            <td class="col-id">-</td>
            <td><input type="date" class="editable-cell" data-field="date" data-id="${newId}" value="${today}"></td>
            <td>
                <select class="editable-cell" data-field="category_id" data-id="${newId}">
                    ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </td>
            <td class="col-subcategory"><textarea class="editable-cell" data-field="subcategory" data-id="${newId}" rows="2"></textarea></td>
            <td class="col-unit">
                <select class="editable-cell" data-field="unit_id" data-id="${newId}">
                    <option value="">-</option>
                    ${units.map(u => `<option value="${u.id}">${u.short_name || u.name}</option>`).join('')}
                </select>
            </td>
            <td class="col-quantity"><input type="number" class="editable-cell" data-field="quantity" data-id="${newId}" step="0.01"></td>
            <td class="col-price"><input type="text" class="editable-cell" data-field="price" data-id="${newId}" onchange="calculateAmount('${newId}')" onblur="formatPriceOnBlur(this)"></td>
            <td class="col-amount"><span class="amount-cell" data-id="${newId}">0</span> ₽</td>
            <td class="col-client">-</td>
            <td class="col-project">
                <select class="editable-cell" data-field="project_id" data-id="${newId}" onchange="updateClientName(this)">
                    <option value="">Выберите объект</option>
                    ${projects.map(p => {
                        const client = clients.find(c => c.id === p.client_id);
                        const clientName = client ? client.name : '';
                        return `<option value="${p.id}" data-client="${clientName}">${p.name}</option>`;
                    }).join('')}
                </select>
            </td>
            <td class="col-shop">
                <select class="editable-cell" data-field="shop_id" data-id="${newId}">
                    <option value="">-</option>
                    ${shops.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                </select>
            </td>
            <td class="col-comment"><input type="text" class="editable-cell" data-field="comment" data-id="${newId}"></td>
        </tr>
    `;
    
    tbody.insertAdjacentHTML('beforeend', newRow);
    setupEditableCells();
}

// Сохранение всех изменений
async function saveAllChanges() {
    if (changedCells.size === 0) {
        alert('Нет изменений для сохранения');
        return;
    }
    
    const savePromises = [];
    
    for (const [expenseId, changes] of changedCells.entries()) {
        if (expenseId.toString().startsWith('new-')) {
            // Создание нового расхода
            const row = document.querySelector(`tr[data-id="${expenseId}"]`);
            const date = row.querySelector('[data-field="date"]').value;
            const dateObj = new Date(date);
            
            const quantity = parseFloat(row.querySelector('[data-field="quantity"]').value) || 0;
            const price = parsePriceInput(row.querySelector('[data-field="price"]').value) || 0;
            const amount = quantity * price;
            
            const data = {
                project_id: parseInt(row.querySelector('[data-field="project_id"]').value),
                date: date,
                month: dateObj.getMonth() + 1,
                year: dateObj.getFullYear(),
                category_id: parseInt(row.querySelector('[data-field="category_id"]').value),
                subcategory: row.querySelector('[data-field="subcategory"]').value || null,
                unit_id: row.querySelector('[data-field="unit_id"]').value ? parseInt(row.querySelector('[data-field="unit_id"]').value) : null,
                quantity: quantity || null,
                price: price || null,
                amount: amount,
                shop_id: row.querySelector('[data-field="shop_id"]').value ? parseInt(row.querySelector('[data-field="shop_id"]').value) : null,
                comment: row.querySelector('[data-field="comment"]').value || null
            };
            
            savePromises.push(expensesAPI.create(data));
        } else {
            // Обновление существующего расхода
            savePromises.push(expensesAPI.update(expenseId, changes));
        }
    }
    
    try {
        await Promise.all(savePromises);
        changedCells.clear();
        showSaveIndicator();
        await loadExpenses();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка сохранения изменений');
    }
}

// Показать индикатор сохранения
function showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator show';
    indicator.textContent = '✅ Изменения сохранены!';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.remove();
    }, 2000);
}

// Обновление имени клиента при выборе проекта
function updateClientName(selectElement) {
    const row = selectElement.closest('tr');
    const clientCell = row.cells[8]; // Колонка "Клиент" (после Стоимость)
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const clientName = selectedOption.getAttribute('data-client') || '-';
    clientCell.textContent = clientName;
    clientCell.setAttribute('data-client-name', clientName);
}

// Обновление имени клиента в существующей строке
function updateClientNameInRow(selectElement) {
    const row = selectElement.closest('tr');
    const clientCell = row.cells[8]; // Колонка "Клиент" (после Стоимость)
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const clientName = selectedOption.getAttribute('data-client') || '-';
    clientCell.textContent = clientName;
    clientCell.setAttribute('data-client-name', clientName);
}

// Удаление расхода (убрано из интерфейса, но функция оставлена для возможного использования)
async function deleteExpense(id) {
    if (!confirm('Вы уверены, что хотите удалить этот расход?')) {
        return;
    }
    
    try {
        await expensesAPI.delete(id);
        await loadExpenses();
        alert('Расход успешно удалён!');
    } catch (error) {
        console.error('Ошибка удаления расхода:', error);
        alert('Ошибка удаления расхода');
    }
}

// Модальное окно: Загрузка файла
function openUploadModal() {
    document.getElementById('upload-modal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
    document.getElementById('upload-form').reset();
}

// Обработка загрузки файла
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('upload-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Выберите файл');
        return;
    }
    
    // TODO: Реализовать обработку PDF/XLS файлов
    alert('Обработка файлов будет реализована позже');
    closeUploadModal();
});


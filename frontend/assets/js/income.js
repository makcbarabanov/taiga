// ===========================================
// Страница - Доходы
// ===========================================

let income = [];
let projects = [];
let clients = [];

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    await loadClients();
    await loadIncome();
    setupDateDefault();
});

// Установка текущей даты по умолчанию
function setupDateDefault() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('income-date').value = today;
}

// Загрузка проектов
async function loadProjects() {
    try {
        projects = await projectsAPI.getAll();
        populateProjectSelects();
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

// Загрузка доходов
async function loadIncome() {
    try {
        const tbody = document.getElementById('income-tbody');
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Загрузка...</td></tr>';
        
        income = await incomeAPI.getAll();
        renderIncome();
        updateSummary();
    } catch (error) {
        console.error('Ошибка загрузки доходов:', error);
        document.getElementById('income-tbody').innerHTML = 
            '<tr><td colspan="8" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

// Отображение доходов
function renderIncome(filteredIncome = null) {
    const tbody = document.getElementById('income-tbody');
    const data = filteredIncome || income;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>Нет доходов</p><p>Добавьте первый доход</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => {
        const project = projects.find(p => p.id === item.project_id);
        const client = project ? clients.find(c => c.id === project.client_id) : null;
        const clientName = client ? client.name : 'Неизвестно';
        const projectName = project ? project.name : 'Неизвестно';
        
        return `
            <tr>
                <td>${item.id}</td>
                <td>${formatDate(item.date)}</td>
                <td>${clientName}</td>
                <td>${projectName}</td>
                <td>${formatNumber(item.amount)} ₽</td>
                <td>${item.wallet || '-'}</td>
                <td>${item.comment || '-'}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteIncome(${item.id})">Удалить</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Заполнение select проектов
function populateProjectSelects() {
    const select = document.getElementById('income-project');
    const filterSelect = document.getElementById('filter-project');
    
    const options = '<option value="">Выберите объект</option>' +
        projects.map(project => {
            const client = clients.find(c => c.id === project.client_id);
            const clientName = client ? client.name : 'Неизвестно';
            return `<option value="${project.id}">${clientName} - ${project.name}</option>`;
        }).join('');
    
    select.innerHTML = options;
    filterSelect.innerHTML = '<option value="">Все объекты</option>' + 
        projects.map(project => {
            const client = clients.find(c => c.id === project.client_id);
            const clientName = client ? client.name : 'Неизвестно';
            return `<option value="${project.id}">${clientName} - ${project.name}</option>`;
        }).join('');
}

// Обновление итогов
function updateSummary(filteredIncome = null) {
    const data = filteredIncome || income;
    const total = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    document.getElementById('total-income').textContent = formatNumber(total) + ' ₽';
}

// Фильтрация доходов
function filterIncome() {
    const projectId = document.getElementById('filter-project').value;
    const month = document.getElementById('filter-month').value;
    
    let filtered = income;
    
    if (projectId) {
        filtered = filtered.filter(item => item.project_id === parseInt(projectId));
    }
    
    if (month) {
        const [year, monthNum] = month.split('-');
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getFullYear() === parseInt(year) && 
                   (itemDate.getMonth() + 1) === parseInt(monthNum);
        });
    }
    
    renderIncome(filtered);
    updateSummary(filtered);
}

// Модальное окно: Добавить доход
function openAddIncomeModal() {
    document.getElementById('add-income-modal').style.display = 'block';
}

function closeAddIncomeModal() {
    document.getElementById('add-income-modal').style.display = 'none';
    document.getElementById('add-income-form').reset();
    setupDateDefault();
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('add-income-modal');
    if (event.target === modal) {
        closeAddIncomeModal();
    }
}

// Обработка формы: Добавить доход
document.getElementById('add-income-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const date = new Date(formData.get('date'));
    
    const data = {
        project_id: parseInt(formData.get('project_id')),
        date: formData.get('date'),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        amount: parseFloat(formData.get('amount')),
        wallet: formData.get('wallet') || null,
        comment: formData.get('comment') || null
    };
    
    try {
        await incomeAPI.create(data);
        closeAddIncomeModal();
        await loadIncome();
        alert('Доход успешно добавлен!');
    } catch (error) {
        console.error('Ошибка добавления дохода:', error);
        alert('Ошибка добавления дохода');
    }
});

// Удаление дохода
async function deleteIncome(id) {
    if (!confirm('Вы уверены, что хотите удалить этот доход?')) {
        return;
    }
    
    try {
        await incomeAPI.delete(id);
        await loadIncome();
        alert('Доход успешно удалён!');
    } catch (error) {
        console.error('Ошибка удаления дохода:', error);
        alert('Ошибка удаления дохода');
    }
}



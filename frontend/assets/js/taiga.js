// ===========================================
// Главная страница - Объекты
// ===========================================

let clients = [];
let projects = [];

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadClients();
    await loadProjects();
});

// Загрузка клиентов
async function loadClients() {
    try {
        clients = await clientsAPI.getAll();
        populateClientSelect();
    } catch (error) {
        console.error('Ошибка загрузки клиентов:', error);
        // TODO: показать сообщение об ошибке пользователю
    }
}

// Загрузка проектов
async function loadProjects() {
    try {
        const tbody = document.getElementById('projects-tbody');
        tbody.innerHTML = '<tr><td colspan="13" class="loading">Загрузка...</td></tr>';
        
        projects = await projectsAPI.getAll();
        renderProjects();
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        document.getElementById('projects-tbody').innerHTML = 
            '<tr><td colspan="13" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

// Отображение проектов
function renderProjects() {
    const tbody = document.getElementById('projects-tbody');
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" class="empty-state"><p>Нет объектов</p><p>Добавьте первый объект</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = projects.map(project => {
        const client = clients.find(c => c.id === project.client_id);
        const clientName = client ? client.name : 'Неизвестно';
        
        return `
            <tr>
                <td>${project.id}</td>
                <td>${clientName}</td>
                <td><a href="client.html?id=${project.id}">${project.name}</a></td>
                <td><span class="status-badge ${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span></td>
                <td>${formatDate(project.start_date)}</td>
                <td>${formatDate(project.end_date)}</td>
                <td>${formatNumber(project.planned_profit)}</td>
                <td>${formatNumber(project.actual_profit)}</td>
                <td>${formatNumber(project.planned_income)}</td>
                <td>${formatNumber(project.actual_income)}</td>
                <td>${formatNumber(project.planned_expense)}</td>
                <td>${formatNumber(project.actual_expense)}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteProject(${project.id})">Удалить</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Заполнение select клиентов
function populateClientSelect() {
    const select = document.getElementById('project-client');
    select.innerHTML = '<option value="">Выберите клиента</option>' +
        clients.map(client => 
            `<option value="${client.id}">${client.name}</option>`
        ).join('');
}

// Модальное окно: Добавить объект
function openAddProjectModal() {
    document.getElementById('add-project-modal').style.display = 'block';
}

function closeAddProjectModal() {
    document.getElementById('add-project-modal').style.display = 'none';
    document.getElementById('add-project-form').reset();
}

// Модальное окно: Добавить клиента
function openAddClientModal() {
    document.getElementById('add-client-modal').style.display = 'block';
}

function closeAddClientModal() {
    document.getElementById('add-client-modal').style.display = 'none';
    document.getElementById('add-client-form').reset();
}

// Закрытие модальных окон при клике вне их
window.onclick = function(event) {
    const projectModal = document.getElementById('add-project-modal');
    const clientModal = document.getElementById('add-client-modal');
    
    if (event.target === projectModal) {
        closeAddProjectModal();
    }
    if (event.target === clientModal) {
        closeAddClientModal();
    }
}

// Обработка формы: Добавить объект
document.getElementById('add-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        client_id: parseInt(formData.get('client_id')),
        name: formData.get('name'),
        status: formData.get('status') || 'В работе',
        start_date: formData.get('start_date') || null,
        end_date: formData.get('end_date') || null,
        planned_profit: parseFloat(formData.get('planned_profit')) || null,
        notes: formData.get('notes') || null
    };
    
    try {
        await projectsAPI.create(data);
        closeAddProjectModal();
        await loadProjects();
        alert('Объект успешно добавлен!');
    } catch (error) {
        console.error('Ошибка добавления объекта:', error);
        alert('Ошибка добавления объекта');
    }
});

// Обработка формы: Добавить клиента
document.getElementById('add-client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone') || null,
        email: formData.get('email') || null,
        address: formData.get('address') || null,
        notes: formData.get('notes') || null
    };
    
    try {
        await clientsAPI.create(data);
        closeAddClientModal();
        await loadClients();
        await loadProjects();
        alert('Клиент успешно добавлен!');
    } catch (error) {
        console.error('Ошибка добавления клиента:', error);
        alert('Ошибка добавления клиента');
    }
});

// Удаление проекта
async function deleteProject(id) {
    if (!confirm('Вы уверены, что хотите удалить этот объект?')) {
        return;
    }
    
    try {
        await projectsAPI.delete(id);
        await loadProjects();
        alert('Объект успешно удалён!');
    } catch (error) {
        console.error('Ошибка удаления объекта:', error);
        alert('Ошибка удаления объекта');
    }
}



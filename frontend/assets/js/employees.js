// ===========================================
// Страница - Справочник сотрудников
// ===========================================

let employees = [];

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof employeesAPI === 'undefined') {
        console.error('employeesAPI не определён. Убедитесь, что api.js загружен перед employees.js');
        document.getElementById('employees-tbody').innerHTML = 
            '<tr><td colspan="9" class="empty-state">Ошибка: employeesAPI не определён. Обновите страницу (Ctrl+F5 для очистки кэша).</td></tr>';
        return;
    }
    await loadEmployees();
});

// Загрузка сотрудников
async function loadEmployees() {
    try {
        const tbody = document.getElementById('employees-tbody');
        tbody.innerHTML = '<tr><td colspan="9" class="loading">Загрузка...</td></tr>';
        
        if (typeof employeesAPI === 'undefined') {
            throw new Error('employeesAPI не определён. Проверьте, что api.js загружен.');
        }
        
        employees = await employeesAPI.getAll();
        console.log('Загружено сотрудников:', employees.length);
        
        renderEmployees();
    } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
        document.getElementById('employees-tbody').innerHTML = 
            '<tr><td colspan="9" class="empty-state">Ошибка загрузки данных: ' + error.message + '</td></tr>';
    }
}

// Отображение сотрудников
function renderEmployees() {
    const tbody = document.getElementById('employees-tbody');
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Нет сотрудников</td></tr>';
        return;
    }
    
    // Фильтруем сотрудников в зависимости от настройки
    // Показываем только активных (Работает, Кандидат, Запас, Консультант, Подрядчик, Временный)
    // если чекбокс выключен
    const showDismissed = document.getElementById('show-dismissed') ? document.getElementById('show-dismissed').checked : true;
    const filteredEmployees = showDismissed 
        ? employees 
        : employees.filter(emp => emp.status !== 'Уволен' && emp.status !== 'Не указан');
    
    if (filteredEmployees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Нет сотрудников</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredEmployees.map((employee, index) => {
        // Формируем ФИО
        const fullName = [
            employee.last_name || '',
            employee.first_name || '',
            employee.middle_name || ''
        ].filter(Boolean).join(' ') || '-';
        
        // Форматируем телефоны
        let phoneDisplay = '-';
        if (employee.phone_numbers && Array.isArray(employee.phone_numbers) && employee.phone_numbers.length > 0) {
            phoneDisplay = employee.phone_numbers.map(p => escapeHtml(p)).join('<br>');
        }
        
        // Форматируем даты
        const hireDate = employee.hire_date ? formatDate(employee.hire_date) : '-';
        const dismissalDate = employee.dismissal_date ? formatDate(employee.dismissal_date) : '-';
        
        // Статус с цветом
        let statusClass = '';
        if (employee.status === 'Работает') {
            statusClass = 'status-active';
        } else if (employee.status === 'Уволен') {
            statusClass = 'status-inactive';
        } else if (employee.status === 'Кандидат') {
            statusClass = 'status-candidate';
        } else if (employee.status === 'Запас') {
            statusClass = 'status-reserve';
        } else if (employee.status === 'Консультант') {
            statusClass = 'status-consultant';
        } else if (employee.status === 'Подрядчик') {
            statusClass = 'status-contractor';
        } else if (employee.status === 'Временный') {
            statusClass = 'status-temporary';
        }
        
        return `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(fullName)}</strong></td>
            <td>${escapeHtml(employee.alias || '-')}</td>
            <td>${escapeHtml(employee.position || '-')}</td>
            <td class="phone-cell">${phoneDisplay}</td>
            <td>${escapeHtml(employee.employment_type || '-')}</td>
            <td><span class="status-badge ${statusClass}">${escapeHtml(employee.status || 'Не указан')}</span></td>
            <td style="white-space: nowrap;">${hireDate}</td>
            <td style="white-space: nowrap;">${dismissalDate}</td>
            <td class="actions-cell">
                <button 
                    onclick="editEmployee(${employee.id})"
                    title="Редактировать"
                    class="action-btn edit-btn"
                >✏️</button>
                <button 
                    onclick="deleteEmployee(${employee.id})"
                    title="Удалить"
                    class="action-btn delete-btn"
                >✕</button>
            </td>
        </tr>
    `;
    }).join('');
}

// Экранирование HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Открытие модального окна для добавления
function openAddEmployeeModal() {
    document.getElementById('employee-modal-title').textContent = 'Добавить сотрудника';
    document.getElementById('add-employee-form').reset();
    document.getElementById('employee-id').value = '';
    document.getElementById('add-employee-modal').style.display = 'block';
}

// Закрытие модального окна
function closeAddEmployeeModal() {
    document.getElementById('add-employee-modal').style.display = 'none';
    document.getElementById('add-employee-form').reset();
    document.getElementById('employee-id').value = '';
}

// Редактирование сотрудника
async function editEmployee(id) {
    try {
        const employee = await employeesAPI.getById(id);
        
        document.getElementById('employee-modal-title').textContent = 'Редактировать сотрудника';
        document.getElementById('employee-id').value = employee.id;
        document.getElementById('employee-last-name').value = employee.last_name || '';
        document.getElementById('employee-first-name').value = employee.first_name || '';
        document.getElementById('employee-middle-name').value = employee.middle_name || '';
        document.getElementById('employee-position').value = employee.position || '';
        document.getElementById('employee-phone-numbers').value = 
            employee.phone_numbers && Array.isArray(employee.phone_numbers) 
                ? employee.phone_numbers.join(', ') 
                : '';
        document.getElementById('employee-employment-type').value = employee.employment_type || 'постоянно';
        document.getElementById('employee-hire-date').value = employee.hire_date || '';
        document.getElementById('employee-dismissal-date').value = employee.dismissal_date || '';
        document.getElementById('employee-status').value = employee.status || 'Не указан';
        document.getElementById('employee-address-actual').value = employee.address_actual || '';
        document.getElementById('employee-address-registration').value = employee.address_registration || '';
        document.getElementById('employee-comment').value = employee.comment || '';
        
        document.getElementById('add-employee-modal').style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки сотрудника:', error);
        alert('Ошибка загрузки данных сотрудника');
    }
}

// Удаление сотрудника
async function deleteEmployee(id) {
    const employee = employees.find(e => e.id === id);
    const fullName = employee 
        ? [employee.last_name, employee.first_name, employee.middle_name].filter(Boolean).join(' ')
        : 'этого сотрудника';
    
    if (!confirm(`Вы уверены, что хотите удалить ${fullName}?`)) {
        return;
    }
    
    try {
        await employeesAPI.delete(id);
        await loadEmployees();
    } catch (error) {
        console.error('Ошибка удаления сотрудника:', error);
        alert('Ошибка удаления сотрудника');
    }
}

// Обработка формы добавления/редактирования
document.getElementById('add-employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const employeeId = formData.get('id');
    
    // Парсим телефоны из строки в массив
    const phoneNumbersStr = formData.get('phone_numbers') || '';
    const phoneNumbers = phoneNumbersStr
        .split(',')
        .map(p => p.trim())
        .filter(p => p);
    
    const data = {
        last_name: formData.get('last_name') || null,
        first_name: formData.get('first_name'),
        middle_name: formData.get('middle_name') || null,
        position: formData.get('position') || null,
        phone_numbers: phoneNumbers,
        employment_type: formData.get('employment_type') || 'постоянно',
        hire_date: formData.get('hire_date') || null,
        dismissal_date: formData.get('dismissal_date') || null,
        status: formData.get('status') || 'Не указан',
        address_actual: formData.get('address_actual') || null,
        address_registration: formData.get('address_registration') || null,
        comment: formData.get('comment') || null
    };
    
    try {
        if (employeeId) {
            await employeesAPI.update(employeeId, data);
        } else {
            await employeesAPI.create(data);
        }
        
        closeAddEmployeeModal();
        await loadEmployees();
    } catch (error) {
        console.error('Ошибка сохранения сотрудника:', error);
        alert('Ошибка сохранения сотрудника: ' + (error.message || 'Неизвестная ошибка'));
    }
});

// Переключение отображения уволенных сотрудников
function toggleDismissedEmployees() {
    renderEmployees();
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('add-employee-modal');
    if (event.target === modal) {
        closeAddEmployeeModal();
    }
};


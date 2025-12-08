// ===========================================
// Страница клиента - все вкладки
// ===========================================

let currentProjectId = null;
let currentProject = null;
let units = [];
let works = [];

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID проекта из URL
    const urlParams = new URLSearchParams(window.location.search);
    currentProjectId = urlParams.get('id');
    
    if (!currentProjectId) {
        alert('Не указан ID проекта');
        window.location.href = 'taiga.html';
        return;
    }
    
    await loadUnits();
    await loadProject();
    await loadAllTabs();
});

// Загрузка единиц измерения
async function loadUnits() {
    try {
        units = await api.get('/units');
    } catch (error) {
        console.error('Ошибка загрузки единиц измерения:', error);
    }
}

// Загрузка информации о проекте
async function loadProject() {
    try {
        currentProject = await projectsAPI.getById(currentProjectId);
        const clients = await clientsAPI.getAll();
        const client = clients.find(c => c.id === currentProject.client_id);
        
        document.getElementById('project-title').textContent = currentProject.name;
        document.getElementById('project-client').textContent = `Клиент: ${client ? client.name : 'Неизвестно'}`;
        document.getElementById('project-status').textContent = `Статус: ${currentProject.status}`;
    } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
    }
}

// Загрузка всех вкладок
async function loadAllTabs() {
    await loadStatistics();
    await loadWorks();
    await loadMaterials();
    await loadJournal();
    await loadTimesheet();
}

// ===========================================
// ВКЛАДКА: СТАТИСТИКА
// ===========================================

async function loadStatistics() {
    try {
        const stats = await projectStatisticsAPI.getByProject(currentProjectId);
        renderStatistics(stats);
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        document.getElementById('stat-tbody').innerHTML = 
            '<tr><td colspan="5" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

function renderStatistics(stats) {
    const tbody = document.getElementById('stat-tbody');
    
    if (stats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>Нет данных</p></td></tr>';
        return;
    }
    
    // Сортируем по дате (новые сверху)
    const sorted = [...stats].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(stat => {
        const diff = (parseFloat(stat.actual_percent) || 0) - (parseFloat(stat.planned_percent) || 0);
        const diffClass = diff >= 0 ? 'positive' : 'negative';
        const diffSign = diff >= 0 ? '+' : '';
        
        return `
            <tr>
                <td>${formatDate(stat.date)}</td>
                <td>${formatNumber(stat.planned_percent)}%</td>
                <td>${formatNumber(stat.actual_percent)}%</td>
                <td class="${diffClass}">${diffSign}${formatNumber(diff)}%</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteStat(${stat.id})">Удалить</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===========================================
// ВКЛАДКА: РАБОТЫ
// ===========================================

async function loadWorks() {
    try {
        works = await projectWorksAPI.getByProject(currentProjectId);
        renderWorks(works);
    } catch (error) {
        console.error('Ошибка загрузки работ:', error);
        document.getElementById('works-tbody').innerHTML = 
            '<tr><td colspan="10" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

function renderWorks(worksList) {
    const tbody = document.getElementById('works-tbody');
    
    if (worksList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-state"><p>Нет работ</p></td></tr>';
        return;
    }
    
    // Группируем по разделам
    const grouped = {};
    worksList.forEach(work => {
        const section = work.section || 'Общие';
        if (!grouped[section]) {
            grouped[section] = [];
        }
        grouped[section].push(work);
    });
    
    let html = '';
    Object.keys(grouped).forEach(section => {
        html += `<tr class="section-header"><td colspan="10"><strong>${section}</strong></td></tr>`;
        grouped[section].forEach(work => {
            const unit = work.unit_id ? units.find(u => u.id === work.unit_id) : null;
            const unitName = unit ? (unit.short_name || unit.name) : '-';
            const progress = parseFloat(work.progress_percent) || 0;
            const progressClass = progress >= 100 ? 'success' : progress >= 50 ? 'warning' : 'danger';
            
            html += `
                <tr>
                    <td></td>
                    <td>${work.work_name}</td>
                    <td>${unitName}</td>
                    <td>${formatNumber(work.quantity)}</td>
                    <td>${formatNumber(work.price_per_unit)} ₽</td>
                    <td>${formatNumber(work.total_cost)} ₽</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill ${progressClass}" style="width: ${progress}%">
                                ${progress}%
                            </div>
                        </div>
                    </td>
                    <td>${formatNumber(work.completed_quantity)}</td>
                    <td><span class="status-badge ${work.status.toLowerCase().replace(' ', '-')}">${work.status}</span></td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteWork(${work.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
    });
    
    tbody.innerHTML = html;
}

// ===========================================
// ВКЛАДКА: СНАБ (МАТЕРИАЛЫ)
// ===========================================

async function loadMaterials() {
    try {
        // Загружаем смету материалов
        const estimate = await projectMaterialsAPI.getByProject(currentProjectId);
        
        // Загружаем фактические расходы (материалы)
        const allExpenses = await expensesAPI.getByProject(currentProjectId);
        const expenses = allExpenses.filter(e => {
            // Фильтруем по категории "Мат" (нужно будет получить ID категории)
            return true; // TODO: правильная фильтрация
        });
        
        renderMaterials(estimate, expenses);
        updateMaterialsSummary(estimate, expenses);
    } catch (error) {
        console.error('Ошибка загрузки материалов:', error);
        document.getElementById('materials-tbody').innerHTML = 
            '<tr><td colspan="11" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

function renderMaterials(estimate, expenses) {
    const tbody = document.getElementById('materials-tbody');
    
    if (estimate.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="empty-state"><p>Нет материалов в смете</p></td></tr>';
        return;
    }
    
    // Группируем расходы по названию материала
    const expensesByMaterial = {};
    expenses.forEach(exp => {
        const key = exp.subcategory || '';
        if (!expensesByMaterial[key]) {
            expensesByMaterial[key] = [];
        }
        expensesByMaterial[key].push(exp);
    });
    
    // Группируем по категориям
    const grouped = {};
    estimate.forEach(mat => {
        const category = mat.category || 'Общие';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(mat);
    });
    
    let html = '';
    Object.keys(grouped).forEach(category => {
        html += `<tr class="section-header"><td colspan="11"><strong>${category}</strong></td></tr>`;
        grouped[category].forEach(mat => {
            const unit = mat.unit_id ? units.find(u => u.id === mat.unit_id) : null;
            const unitName = unit ? (unit.short_name || unit.name) : '-';
            
            // Находим фактические данные
            const factExpenses = expensesByMaterial[mat.material_name] || [];
            const factQuantity = factExpenses.reduce((sum, e) => sum + (parseFloat(e.quantity) || 0), 0);
            const factAmount = factExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
            const factPrice = factQuantity > 0 ? factAmount / factQuantity : 0;
            
            const diff = (parseFloat(mat.planned_cost) || 0) - factAmount;
            const diffClass = diff >= 0 ? 'positive' : 'negative';
            
            html += `
                <tr>
                    <td></td>
                    <td>${mat.material_name}</td>
                    <td>${unitName}</td>
                    <td>${formatNumber(mat.planned_quantity)}</td>
                    <td>${formatNumber(mat.planned_price)} ₽</td>
                    <td>${formatNumber(mat.planned_cost)} ₽</td>
                    <td>${formatNumber(factQuantity)}</td>
                    <td>${factQuantity > 0 ? formatNumber(factPrice) + ' ₽' : '-'}</td>
                    <td>${factAmount > 0 ? formatNumber(factAmount) + ' ₽' : '-'}</td>
                    <td class="${diffClass}">${formatNumber(diff)} ₽</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteMaterial(${mat.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
    });
    
    tbody.innerHTML = html;
}

function updateMaterialsSummary(estimate, expenses) {
    const totalMaterials = estimate.length;
    const plannedCost = estimate.reduce((sum, m) => sum + (parseFloat(m.planned_cost) || 0), 0);
    
    const factExpenses = expenses.filter(e => e.category_id && 
        (e.category_id === estimate.find(m => m.category === 'Мат')?.category_id || 
         e.subcategory && estimate.some(m => m.material_name === e.subcategory)));
    
    const purchasedCount = new Set(factExpenses.map(e => e.subcategory)).size;
    const factAmount = factExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    const supplyPercent = totalMaterials > 0 ? (purchasedCount / totalMaterials * 100) : 0;
    const savings = plannedCost - factAmount;
    const remaining = plannedCost - factAmount;
    
    document.getElementById('total-materials').textContent = totalMaterials;
    document.getElementById('planned-cost').textContent = formatNumber(plannedCost) + ' ₽';
    document.getElementById('purchased-count').textContent = purchasedCount;
    document.getElementById('supply-percent').textContent = formatNumber(supplyPercent) + '%';
    document.getElementById('savings').textContent = formatNumber(savings) + ' ₽';
    document.getElementById('remaining').textContent = formatNumber(remaining) + ' ₽';
}

// ===========================================
// ВКЛАДКА: ЖУРНАЛ
// ===========================================

async function loadJournal() {
    try {
        const journal = await projectJournalAPI.getByProject(currentProjectId);
        renderJournal(journal);
    } catch (error) {
        console.error('Ошибка загрузки журнала:', error);
        document.getElementById('journal-tbody').innerHTML = 
            '<tr><td colspan="7" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

function renderJournal(journal) {
    const tbody = document.getElementById('journal-tbody');
    
    if (journal.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>Нет записей</p></td></tr>';
        return;
    }
    
    // Сортируем по дате (новые сверху)
    const sorted = [...journal].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(entry => {
        const work = entry.work_id ? works.find(w => w.id === entry.work_id) : null;
        const workName = work ? work.work_name : '-';
        const unit = work && work.unit_id ? units.find(u => u.id === work.unit_id) : null;
        const unitName = unit ? (unit.short_name || unit.name) : '';
        
        return `
            <tr>
                <td>${formatDate(entry.date)}</td>
                <td>${entry.worker_name || '-'}</td>
                <td>${workName}</td>
                <td>${formatNumber(entry.hours)}</td>
                <td>${formatNumber(entry.quantity_completed)} ${unitName}</td>
                <td>${entry.notes || '-'}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteJournalEntry(${entry.id})">Удалить</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===========================================
// ВКЛАДКА: ТАБЕЛЬ
// ===========================================

async function loadTimesheet() {
    try {
        const timesheet = await projectTimesheetAPI.getByProject(currentProjectId);
        renderTimesheet(timesheet);
    } catch (error) {
        console.error('Ошибка загрузки табеля:', error);
        document.getElementById('timesheet-tbody').innerHTML = 
            '<tr><td colspan="6" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

function renderTimesheet(timesheet) {
    const tbody = document.getElementById('timesheet-tbody');
    
    if (timesheet.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>Нет данных</p></td></tr>';
        return;
    }
    
    // Сортируем по дате (новые сверху)
    const sorted = [...timesheet].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(entry => `
        <tr>
            <td>${formatDate(entry.date)}</td>
            <td>${entry.worker_name || '-'}</td>
            <td>${entry.work_name || '-'}</td>
            <td>${formatNumber(entry.hours)}</td>
            <td>${formatNumber(entry.quantity_completed)}</td>
            <td>${entry.unit_name || '-'}</td>
        </tr>
    `).join('');
}

// ===========================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ===========================================

function showTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс у всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Активируем кнопку
    event.target.classList.add('active');
}

// ===========================================
// МОДАЛЬНЫЕ ОКНА (заглушки)
// ===========================================

function openAddStatModal() {
    alert('Модальное окно добавления статистики будет реализовано');
}

function openAddWorkModal() {
    alert('Модальное окно добавления работы будет реализовано');
}

function openAddMaterialModal() {
    alert('Модальное окно добавления материала будет реализовано');
}

function openAddJournalModal() {
    alert('Модальное окно добавления записи в журнал будет реализовано');
}

// ===========================================
// УДАЛЕНИЕ
// ===========================================

async function deleteStat(id) {
    if (!confirm('Удалить запись?')) return;
    try {
        await projectStatisticsAPI.delete(id);
        await loadStatistics();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления');
    }
}

async function deleteWork(id) {
    if (!confirm('Удалить работу?')) return;
    try {
        await projectWorksAPI.delete(id);
        await loadWorks();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления');
    }
}

async function deleteMaterial(id) {
    if (!confirm('Удалить материал?')) return;
    try {
        await projectMaterialsAPI.delete(id);
        await loadMaterials();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления');
    }
}

async function deleteJournalEntry(id) {
    if (!confirm('Удалить запись?')) return;
    try {
        await projectJournalAPI.delete(id);
        await loadJournal();
        await loadTimesheet(); // Обновляем табель
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления');
    }
}


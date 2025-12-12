// ===========================================
// Страница клиента - все вкладки
// ===========================================

let currentProjectId = null;
let currentProject = null;
let currentClient = null;
let units = [];
let works = [];
let employees = [];

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
    await loadEmployees();
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

// Загрузка сотрудников
async function loadEmployees() {
    try {
        employees = await employeesAPI.getAll({ status: 'Работает' });
    } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
    }
}

// Загрузка информации о проекте
async function loadProject() {
    try {
        currentProject = await projectsAPI.getById(currentProjectId);
        const clients = await clientsAPI.getAll();
        currentClient = clients.find(c => c.id === currentProject.client_id);
        
        // Обновляем заголовок "Опись работ"
        updateWorksHeader();
    } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
    }
}

// Обновление заголовка "Опись работ"
function updateWorksHeader() {
    const headerText = document.getElementById('works-header-text');
    if (headerText && currentClient && currentProject) {
        headerText.textContent = `Опись работ клиента ${currentClient.name}, по объекту ${currentProject.name}. Статус ${currentProject.status.toLowerCase()}.`;
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
        console.log('Загружено работ:', works.length);
        if (works.length > 0) {
            console.log('Первая работа:', JSON.stringify(works[0], null, 2));
            console.log('work_name:', works[0].work_name);
            console.log('section_name:', works[0].section_name);
            console.log('work_type_name:', works[0].work_type_name);
        }
        renderWorks(works);
        
        // Обновляем заголовок на случай, если данные проекта загрузились позже
        updateWorksHeader();
    } catch (error) {
        console.error('Ошибка загрузки работ:', error);
        document.getElementById('works-tbody').innerHTML = 
            '<tr><td colspan="5" class="empty-state">Ошибка загрузки данных: ' + error.message + '</td></tr>';
    }
}

function renderWorks(worksList) {
    const tbody = document.getElementById('works-tbody');
    
    if (!worksList || worksList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>Нет работ</p></td></tr>';
        return;
    }
    
    console.log('Отладочная информация о работах:', worksList.slice(0, 3));
    console.log('Ключи первой работы:', Object.keys(worksList[0]));
    
    // Группируем по разделам
    const grouped = {};
    worksList.forEach(work => {
        // Используем section_name из нового представления
        const section = work.section_name || work.section_alias || work.section || 'Общие';
        if (!grouped[section]) {
            grouped[section] = [];
        }
        grouped[section].push(work);
    });
    
    let html = '';
    // Сортируем разделы для правильного отображения
    const sortedSections = Object.keys(grouped).sort();
    
    sortedSections.forEach(section => {
        html += `<tr class="section-header"><td colspan="5"><strong>${section}</strong></td></tr>`;
        grouped[section].forEach(work => {
            // Используем данные из представления
            const unitName = work.unit_short_name || work.unit_name || '-';
            const progress = parseFloat(work.progress_percent) || 0;
            const progressClass = progress >= 100 ? 'success' : progress >= 50 ? 'warning' : 'danger';
            // Выделяем слабокрасным, если quantity = 0
            const rowClass = (parseFloat(work.quantity) || 0) === 0 ? 'quantity-zero' : '';
            
            // Формируем название работы: сначала из представления, потом вручную
            let workName = work.work_name;
            if (!workName || workName === 'null' || workName === null) {
                if (work.section_name && work.work_type_name) {
                    workName = work.section_name + ' - ' + work.work_type_name;
                } else if (work.work_type_name) {
                    workName = work.work_type_name;
                } else {
                    workName = 'Нет названия';
                }
            }
            
            // Убираем категории из наименования (например, "Вентиляция - Приточные клапаны" → "Приточные клапаны")
            // Если есть " - ", берём только часть после последнего " - "
            if (workName && workName.includes(' - ')) {
                const parts = workName.split(' - ');
                // Если частей больше 1, берём последнюю часть
                if (parts.length > 1) {
                    workName = parts[parts.length - 1].trim();
                }
            }
            
            html += `
                <tr class="${rowClass}">
                    <td>${work.section_alias || work.section_name || ''}</td>
                    <td>${workName}</td>
                    <td>${unitName}</td>
                    <td>${formatNumber(work.quantity)}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill ${progressClass}" style="width: ${progress}%">
                                ${progress}%
                            </div>
                        </div>
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
            '<tr><td colspan="9" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

function renderJournal(journal) {
    const tbody = document.getElementById('journal-tbody');
    
    if (journal.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>Нет записей</p></td></tr>';
        return;
    }
    
    // Сортируем по дате и времени (новые сверху)
    const sorted = [...journal].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateB - dateA !== 0) return dateB - dateA;
        // Если даты равны, сортируем по времени начала
        if (a.time_start && b.time_start) {
            return b.time_start.localeCompare(a.time_start);
        }
        return 0;
    });
    
    tbody.innerHTML = sorted.map(entry => {
        const work = entry.work_id ? works.find(w => w.id === entry.work_id) : null;
        const workName = work ? work.work_name : '-';
        const unit = work && work.unit_id ? units.find(u => u.id === work.unit_id) : null;
        const unitName = unit ? (unit.short_name || unit.name) : '';
        
        // Форматируем время
        const timeStr = entry.time_start && entry.time_end 
            ? `${entry.time_start.substring(0, 5)} - ${entry.time_end.substring(0, 5)}`
            : '-';
        
        // Форматируем часы (без десятичных)
        const hoursStr = entry.hours ? Math.round(parseFloat(entry.hours)).toString() : '-';
        
        // Форматируем сотрудников
        let employeesList = '-';
        // Проверяем, что employees существует
        if (entry.employees !== null && entry.employees !== undefined) {
            // Если это строка, пытаемся распарсить
            let employeesArray = entry.employees;
            if (typeof entry.employees === 'string') {
                try {
                    employeesArray = JSON.parse(entry.employees);
                } catch (e) {
                    console.warn('Ошибка парсинга employees:', e);
                    employeesArray = [];
                }
            }
            // Если это массив и не пустой
            if (Array.isArray(employeesArray) && employeesArray.length > 0) {
                employeesList = employeesArray.map(e => {
                    if (!e) return '';
                    // Используем full_name если есть
                    if (e.full_name && e.full_name.trim()) {
                        return e.full_name.trim();
                    }
                    // Иначе собираем из частей
                    const parts = [e.last_name, e.first_name, e.middle_name].filter(x => x && x.trim());
                    return parts.length > 0 ? parts.join(' ').trim() : 'Без имени';
                }).filter(x => x).join(', ');
            }
        }
        
        // Если есть примечания с подрядчиком, добавляем в сотрудники
        if (entry.notes && entry.notes.includes('Подрядчик')) {
            const contractorName = entry.notes.replace('Подрядчик', '').trim();
            if (employeesList === '-') {
                employeesList = contractorName;
            } else {
                employeesList += ', ' + contractorName;
            }
        }
        
        // Выполнено (только число)
        const completedStr = entry.quantity_completed ? formatNumber(entry.quantity_completed) : '-';
        
        // Единица измерения
        const unitDisplay = unitName || '-';
        
        // Вычисляем остаток (только число)
        let remaining = '-';
        if (work && work.quantity !== null && work.quantity !== undefined) {
            const total = parseFloat(work.quantity) || 0;
            const workCompleted = parseFloat(work.completed_quantity) || 0;
            const remainingTotal = total - workCompleted;
            remaining = formatNumber(remainingTotal);
        }
        
        return `
            <tr>
                <td>${formatDate(entry.date)}</td>
                <td>${timeStr}</td>
                <td>${hoursStr}</td>
                <td>${employeesList}</td>
                <td>${workName}</td>
                <td>${completedStr}</td>
                <td>${unitDisplay}</td>
                <td>${remaining}</td>
                <td>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button 
                            class="btn btn-success" 
                            onclick="openEditJournalModal(${entry.id})"
                            title="Редактировать"
                            style="padding: 4px 8px; background: none; color: #27ae60; border: none; cursor: pointer; font-size: 18px; transition: all 0.2s;"
                            onmouseover="this.style.opacity='0.7'; this.style.transform='scale(1.1)'"
                            onmouseout="this.style.opacity='1'; this.style.transform='scale(1)'"
                        >✓</button>
                        <button 
                            class="btn btn-danger" 
                            onclick="deleteJournalEntry(${entry.id})"
                            title="Удалить"
                            style="padding: 4px 8px; background: none; color: #e74c3c; border: none; cursor: pointer; font-size: 18px; transition: all 0.2s;"
                            onmouseover="this.style.opacity='0.7'; this.style.transform='scale(1.1)'"
                            onmouseout="this.style.opacity='1'; this.style.transform='scale(1)'"
                        >✕</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===========================================
// ВКЛАДКА: ТАБЕЛЬ
// ===========================================

let expenseCategories = [];

async function loadTimesheet() {
    try {
        // Загружаем категории расходов, если ещё не загружены
        if (expenseCategories.length === 0) {
            expenseCategories = await api.get('/expense-categories');
        }
        
        // Загружаем журнал и расходы
        const [journal, expenses] = await Promise.all([
            projectJournalAPI.getByProject(currentProjectId),
            expensesAPI.getByProject(currentProjectId)
        ]);
        renderTimesheet(journal, expenses);
    } catch (error) {
        console.error('Ошибка загрузки табеля:', error);
        document.getElementById('timesheet-tbody').innerHTML = 
            '<tr><td colspan="100" class="empty-state">Ошибка загрузки данных</td></tr>';
    }
}

function renderTimesheet(journal, expenses) {
    const thead = document.getElementById('timesheet-thead');
    const tbody = document.getElementById('timesheet-tbody');
    
    if (!journal || journal.length === 0) {
        thead.innerHTML = '<tr><td colspan="100" class="empty-state">Нет данных</td></tr>';
        tbody.innerHTML = '';
        return;
    }
    
    // Форматируем часы без десятичных
    function formatHours(hours) {
        if (hours === null || hours === undefined || hours === 0) return '0';
        return Math.round(parseFloat(hours)).toString();
    }
    
    // Форматируем часы с десятичными (для отображения)
    function formatHoursDecimal(hours) {
        if (hours === null || hours === undefined || hours === 0) return '0';
        const h = parseFloat(hours);
        return h % 1 === 0 ? h.toString() : h.toFixed(1).replace('.', ',');
    }
    
    // Получаем все уникальные даты из журнала
    const allDates = new Set();
    journal.forEach(entry => {
        if (entry.date) {
            const date = new Date(entry.date);
            allDates.add(date.toISOString().split('T')[0]);
        }
    });
    
    // Сортируем даты
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    
    // Функция для получения дня недели
    function getDayOfWeek(dateStr) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const date = new Date(dateStr);
        return days[date.getDay()];
    }
    
    // Функция для форматирования даты
    function formatDateShort(dateStr) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}.${date.getFullYear()}`;
    }
    
    // Агрегируем данные по сотрудникам
    const employeeData = {};
    const contractorData = {};
    
    journal.forEach(entry => {
        const dateStr = entry.date ? new Date(entry.date).toISOString().split('T')[0] : null;
        if (!dateStr) return;
        
        const hours = parseFloat(entry.hours) || 0;
        
        // Обрабатываем сотрудников
        if (entry.employees && Array.isArray(entry.employees) && entry.employees.length > 0) {
            entry.employees.forEach(emp => {
                const empName = emp.full_name || `${emp.last_name || ''} ${emp.first_name || ''} ${emp.middle_name || ''}`.trim();
                if (!empName) return;
                
                if (!employeeData[empName]) {
                    employeeData[empName] = {
                        name: empName,
                        shifts: new Set(),
                        totalHours: 0,
                        hoursByDate: {}
                    };
                }
                
                employeeData[empName].shifts.add(dateStr);
                employeeData[empName].totalHours += hours;
                employeeData[empName].hoursByDate[dateStr] = (employeeData[empName].hoursByDate[dateStr] || 0) + hours;
            });
        }
        
        // Обрабатываем подрядчиков
        if (entry.notes && entry.notes.includes('Подрядчик')) {
            const contractorName = entry.notes.replace('Подрядчик', '').trim();
            if (contractorName) {
                if (!contractorData[contractorName]) {
                    contractorData[contractorName] = {
                        name: contractorName,
                        shifts: new Set(),
                        totalHours: 0,
                        hoursByDate: {}
                    };
                }
                
                contractorData[contractorName].shifts.add(dateStr);
                contractorData[contractorName].totalHours += hours;
                contractorData[contractorName].hoursByDate[dateStr] = (contractorData[contractorName].hoursByDate[dateStr] || 0) + hours;
            }
        }
    });
    
    // Объединяем сотрудников и подрядчиков
    const allWorkers = { ...employeeData, ...contractorData };
    
    // Рассчитываем среднюю ставку для каждого сотрудника
    Object.keys(allWorkers).forEach(workerName => {
        const worker = allWorkers[workerName];
        const shiftsCount = worker.shifts.size;
        
        // Ищем расходы ФОТ для этого сотрудника
        // Находим ID категории ФОТ
        const fotCategory = expenseCategories.find(cat => cat.name === 'ФОТ' || cat.alias === 'ФОТ');
        const fotCategoryId = fotCategory ? fotCategory.id : null;
        
        const fotExpenses = expenses.filter(exp => {
            // Проверяем по category_id
            if (exp.category_id !== fotCategoryId) return false;
            
            const subcategory = (exp.subcategory || '').toLowerCase();
            const workerNameLower = workerName.toLowerCase();
            // Проверяем, содержит ли подкатегория имя сотрудника
            // Ищем по полному имени или по первому слову (имени)
            const firstName = workerNameLower.split(' ')[0];
            return subcategory.includes(workerNameLower) || subcategory.includes(firstName);
        });
        
        const totalFotAmount = fotExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        worker.avgRate = shiftsCount > 0 ? Math.round(totalFotAmount / shiftsCount) : 0;
        worker.shiftsCount = shiftsCount;
    });
    
    // Сортируем сотрудников по имени
    const sortedWorkers = Object.values(allWorkers).sort((a, b) => a.name.localeCompare(b.name));
    
    // Формируем заголовок таблицы
    let headerHTML = `
        <tr>
            <th rowspan="2"></th>
            <th rowspan="2">Смена</th>
            <th rowspan="2">шт</th>
            <th rowspan="2">руб</th>
            <th rowspan="2">Итого</th>
            ${sortedDates.map(date => `<th>${formatDateShort(date)}</th>`).join('')}
        </tr>
        <tr>
            ${sortedDates.map(date => `<th>${getDayOfWeek(date)}</th>`).join('')}
        </tr>
    `;
    thead.innerHTML = headerHTML;
    
    // Формируем строки для каждого сотрудника
    let bodyHTML = '';
    sortedWorkers.forEach(worker => {
        bodyHTML += `
            <tr>
                <td>${worker.name}</td>
                <td>${worker.shiftsCount}</td>
                <td>${worker.shiftsCount}</td>
                <td>${worker.avgRate > 0 ? new Intl.NumberFormat('ru-RU').format(worker.avgRate) : ''}</td>
                <td>${formatHoursDecimal(worker.totalHours)}</td>
                ${sortedDates.map(date => {
                    const hours = worker.hoursByDate[date] || 0;
                    return `<td>${hours > 0 ? formatHoursDecimal(hours) : '0'}</td>`;
                }).join('')}
            </tr>
        `;
    });
    
    tbody.innerHTML = bodyHTML || '<tr><td colspan="100" class="empty-state">Нет данных</td></tr>';
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

// Функция для расчёта часов из времени
function calculateHours(timeStart, timeEnd, breakDuration) {
    if (!timeStart || !timeEnd) return null;
    
    const start = new Date(`2000-01-01T${timeStart}`);
    const end = new Date(`2000-01-01T${timeEnd}`);
    let diff = (end - start) / (1000 * 60 * 60); // разница в часах
    
    if (breakDuration) {
        // breakDuration в формате "HH:MM" или "HH:MM:SS"
        const breakMatch = breakDuration.match(/(\d+):(\d+)/);
        if (breakMatch) {
            const breakHours = parseInt(breakMatch[1]) + parseInt(breakMatch[2]) / 60;
            diff -= breakHours;
        }
    }
    
    return Math.max(0, Math.round(diff * 100) / 100); // округляем до 2 знаков
}

// Открытие модального окна для добавления записи в журнал
function openAddJournalModal() {
    openJournalModal(null);
}

// Открытие модального окна для редактирования записи в журнале
async function openEditJournalModal(id) {
    try {
        const journalEntry = await projectJournalAPI.getById(id);
        if (!journalEntry) {
            alert('Запись не найдена');
            return;
        }
        openJournalModal(journalEntry);
    } catch (error) {
        console.error('Ошибка загрузки записи:', error);
        alert('Ошибка загрузки записи');
    }
}

// Создание/открытие модального окна для журнала
function openJournalModal(entry = null) {
    const isEdit = entry !== null;
    const modalId = 'journal-modal';
    
    // Удаляем существующее модальное окно, если есть
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }
    
    // Получаем список работ для выпадающего списка
    const worksOptions = works.map(w => 
        `<option value="${w.id}" ${entry && entry.work_id === w.id ? 'selected' : ''}>${w.work_name}</option>`
    ).join('');
    
        // Получаем выбранных сотрудников
        const selectedEmployeeIds = entry && entry.employees ? entry.employees.map(e => e.id) : [];
        
        // Извлекаем подрядчика из notes, если есть
        const contractorValue = entry && entry.notes && entry.notes.includes('Подрядчик') 
            ? entry.notes.replace('Подрядчик', '').trim() 
            : '';
        
        // Создаём чекбоксы для сотрудников
        const employeesCheckboxes = employees.map(emp => {
            const fullName = `${emp.last_name || ''} ${emp.first_name || ''} ${emp.middle_name || ''}`.trim();
            const isChecked = selectedEmployeeIds.includes(emp.id);
            return `
            <label style="display: block; margin: 5px 0;">
                <input type="checkbox" name="employees" value="${emp.id}" ${isChecked ? 'checked' : ''}>
                ${fullName}
            </label>
        `;
        }).join('');
    
    // Форматируем дату для input[type="date"]
    const dateValue = entry ? entry.date : new Date().toISOString().split('T')[0];
    
    const modalHTML = `
        <div id="${modalId}" class="modal-overlay" onclick="if(event.target.id === '${modalId}') closeJournalModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${isEdit ? 'Редактировать запись' : 'Добавить запись в журнал'}</h2>
                    <button class="modal-close" onclick="closeJournalModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="journal-form">
                        <div class="form-group">
                            <label>Дата *</label>
                            <input type="date" name="date" value="${dateValue}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Время начала</label>
                                <input type="time" name="time_start" value="${entry ? (entry.time_start || '') : ''}">
                            </div>
                            <div class="form-group">
                                <label>Время окончания</label>
                                <input type="time" name="time_end" value="${entry ? (entry.time_end || '') : ''}">
                            </div>
                            <div class="form-group">
                                <label>Перерыв (чч:мм)</label>
                                <input type="text" name="break_duration" placeholder="1:00" value="${entry && entry.break_duration ? (entry.break_duration.match(/(\d+):(\d+)/) ? entry.break_duration.match(/(\d+):(\d+)/)[0] : '') : ''}">
                            </div>
                            <div class="form-group">
                                <label>Часов (автоматически)</label>
                                <input type="number" step="0.01" name="hours" id="journal-hours" value="${entry ? (entry.hours || '') : ''}" readonly>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Сотрудники (или укажите подрядчика ниже)</label>
                            <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                                ${employeesCheckboxes}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Работа *</label>
                            <select name="work_id" required>
                                <option value="">Выберите работу</option>
                                ${worksOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Выполнено (количество)</label>
                            <input type="number" step="0.01" name="quantity_completed" value="${entry ? (entry.quantity_completed || '') : ''}">
                        </div>
                        
                        <div class="form-group">
                            <label>Подрядчик (если работа выполнена подрядчиком, укажите название)</label>
                            <input type="text" name="contractor" placeholder="Например: МетроСваи" value="${entry && entry.notes && entry.notes.includes('Подрядчик') ? entry.notes.replace('Подрядчик', '').trim() : ''}">
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeJournalModal()">Отмена</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Добавить'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHTML;
    
    // Добавляем обработчики для автоматического расчёта часов
    const timeStartInput = document.querySelector(`#${modalId} input[name="time_start"]`);
    const timeEndInput = document.querySelector(`#${modalId} input[name="time_end"]`);
    const breakDurationInput = document.querySelector(`#${modalId} input[name="break_duration"]`);
    const hoursInput = document.getElementById('journal-hours');
    
    function updateHours() {
        const timeStart = timeStartInput.value;
        const timeEnd = timeEndInput.value;
        const breakDuration = breakDurationInput.value;
        
        if (timeStart && timeEnd) {
            const hours = calculateHours(timeStart, timeEnd, breakDuration);
            hoursInput.value = hours !== null ? hours.toFixed(2) : '';
        } else {
            hoursInput.value = '';
        }
    }
    
    timeStartInput.addEventListener('change', updateHours);
    timeEndInput.addEventListener('change', updateHours);
    breakDurationInput.addEventListener('input', updateHours);
    
    // Обработчик отправки формы
    document.getElementById('journal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveJournalEntry(entry);
    });
}

// Закрытие модального окна журнала
function closeJournalModal() {
    const modal = document.getElementById('journal-modal');
    if (modal) {
        modal.remove();
    }
}

// Сохранение записи в журнале
async function saveJournalEntry(entry = null) {
    try {
        const form = document.getElementById('journal-form');
        const formData = new FormData(form);
        
        // Получаем выбранных сотрудников
        const selectedEmployees = Array.from(form.querySelectorAll('input[name="employees"]:checked'))
            .map(cb => parseInt(cb.value));
        
        // Получаем подрядчика
        const contractor = formData.get('contractor')?.trim();
        
        // Проверяем: либо сотрудники, либо подрядчик
        if (selectedEmployees.length === 0 && !contractor) {
            alert('Выберите хотя бы одного сотрудника или укажите подрядчика');
            return;
        }
        
        // Формируем notes: если указан подрядчик, добавляем "Подрядчик [название]"
        const notes = contractor ? `Подрядчик ${contractor}` : null;
        
        const data = {
            project_id: currentProjectId,
            date: formData.get('date'),
            time_start: formData.get('time_start') || null,
            time_end: formData.get('time_end') || null,
            break_duration: formData.get('break_duration') || null,
            hours: formData.get('hours') ? parseFloat(formData.get('hours')) : null,
            work_id: parseInt(formData.get('work_id')),
            quantity_completed: formData.get('quantity_completed') ? parseFloat(formData.get('quantity_completed')) : null,
            notes: notes,
            employee_ids: selectedEmployees
        };
        
        if (entry) {
            // Обновление
            await projectJournalAPI.update(entry.id, data);
        } else {
            // Создание
            await projectJournalAPI.create(data);
        }
        
        closeJournalModal();
        await loadJournal();
        await loadWorks(); // Обновляем работы, чтобы обновился прогресс
        await loadTimesheet(); // Обновляем табель
    } catch (error) {
        console.error('Ошибка сохранения записи:', error);
        alert('Ошибка сохранения записи: ' + error.message);
    }
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


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
        // Загружаем всех сотрудников (без фильтра по статусу)
        employees = await employeesAPI.getAll();
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
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><p>Нет работ</p></td></tr>';
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
    // Сортируем разделы по минимальному sort_order в разделе
    const sortedSections = Object.keys(grouped).sort((a, b) => {
        const minOrderA = Math.min(...grouped[a].map(w => parseFloat(w.sort_order) || 9999));
        const minOrderB = Math.min(...grouped[b].map(w => parseFloat(w.sort_order) || 9999));
        return minOrderA - minOrderB;
    });
    
    sortedSections.forEach(section => {
        html += `<tr class="section-header"><td colspan="4"><strong>${section}</strong></td></tr>`;
        // Сортируем работы внутри раздела по sort_order
        const sortedWorks = grouped[section].sort((a, b) => {
            const orderA = parseFloat(a.sort_order) || 9999;
            const orderB = parseFloat(b.sort_order) || 9999;
            return orderA - orderB;
        });
        sortedWorks.forEach(work => {
            // Используем данные из представления
            const unitName = work.unit_short_name || work.unit_name || '-';
            let progress = parseFloat(work.progress_percent) || 0;
            // Ограничиваем прогресс максимумом 100% для корректного отображения
            progress = Math.min(progress, 100);
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
            
            // Создаём стиль для прогресс-бара в строке
            const progressStyle = `background: linear-gradient(to right, #d4edda ${progress}%, transparent ${progress}%);`;
            
            html += `
                <tr class="${rowClass} work-progress-row" style="${progressStyle}">
                    <td>${work.section_alias || work.section_name || ''}</td>
                    <td>${workName}</td>
                    <td>${unitName}</td>
                    <td>${formatNumber(work.quantity)}</td>
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
        tbody.innerHTML = '<tr><td colspan="12" class="empty-state"><p>Нет материалов в смете</p></td></tr>';
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
        html += `<tr class="section-header"><td colspan="12"><strong>${category}</strong></td></tr>`;
        grouped[category].forEach(mat => {
            const unit = mat.unit_id ? units.find(u => u.id === mat.unit_id) : null;
            const unitName = unit ? (unit.short_name || unit.name) : '-';
            
            // Находим фактические данные
            const factExpenses = expensesByMaterial[mat.material_name] || [];
            const factQuantity = factExpenses.reduce((sum, e) => sum + (parseFloat(e.quantity) || 0), 0);
            const factAmount = factExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
            const factPrice = factQuantity > 0 ? factAmount / factQuantity : 0;
            
            // Разница в количестве (докупить)
            const plannedQty = parseFloat(mat.planned_quantity) || 0;
            const remainingQty = plannedQty - factQuantity;
            const remainingQtyClass = remainingQty > 0 ? 'positive' : (remainingQty < 0 ? 'negative' : '');
            
            // Стоимость дозакупа = ещё.кол-во * смета.цена
            const plannedPrice = parseFloat(mat.planned_price) || 0;
            const remainingCost = remainingQty > 0 ? remainingQty * plannedPrice : 0;
            const remainingCostClass = remainingQty > 0 ? 'positive' : (remainingQty < 0 ? 'negative' : '');
            
            // Выгода рассчитывается только если количество сметы и факта совпадают (докупить = 0)
            const canCalculateSavings = Math.abs(remainingQty) < 0.01; // Учитываем погрешность округления
            let savings = 0;
            let savingsClass = '';
            if (canCalculateSavings && factQuantity > 0) {
                savings = (parseFloat(mat.planned_cost) || 0) - factAmount;
                savingsClass = savings >= 0 ? 'positive' : 'negative';
            }
            
            html += `
                <tr>
                    <td>${mat.material_name}</td>
                    <td>${unitName}</td>
                    <td>${formatNumber(mat.planned_quantity)}</td>
                    <td>${formatNumber(mat.planned_price)}</td>
                    <td>${formatNumber(mat.planned_cost)}</td>
                    <td>${formatNumber(factQuantity)}</td>
                    <td>${factQuantity > 0 ? formatNumber(factPrice) : '-'}</td>
                    <td>${factAmount > 0 ? formatNumber(factAmount) : '-'}</td>
                    <td class="${remainingQtyClass}">${formatNumber(remainingQty)}</td>
                    <td class="${remainingCostClass}">${remainingQty > 0 ? formatNumber(remainingCost) : '-'}</td>
                    <td class="${savingsClass}">${canCalculateSavings && factQuantity > 0 ? formatNumber(savings) : '-'}</td>
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" onclick="editMaterial(${mat.id})" title="Редактировать">✏️</button>
                        <button class="action-btn delete-btn" onclick="deleteMaterial(${mat.id})" title="Удалить">✕</button>
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
    document.getElementById('planned-cost').textContent = formatNumber(plannedCost);
    document.getElementById('purchased-count').textContent = purchasedCount;
    document.getElementById('supply-percent').textContent = formatNumber(supplyPercent) + '%';
    document.getElementById('savings').textContent = formatNumber(savings);
    document.getElementById('remaining').textContent = formatNumber(remaining);
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
                <td class="actions-cell">
                    <button 
                        onclick="openEditJournalModal(${entry.id})"
                        title="Редактировать"
                        class="action-btn edit-btn"
                    >✏️</button>
                    <button 
                        onclick="deleteJournalEntry(${entry.id})"
                        title="Удалить"
                        class="action-btn delete-btn"
                    >✕</button>
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
    
    // Функция для нормализации даты (с учётом локального часового пояса)
    function normalizeDate(dateValue) {
        if (!dateValue) return null;
        
        // Всегда парсим через Date, чтобы получить правильную локальную дату
        // Это важно, так как даты из БД могут быть в UTC (например, "2025-12-11T21:00:00.000Z"),
        // а нам нужна локальная дата (например, "2025-12-12" для UTC+3)
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;
        
        // Используем локальные методы для получения правильной даты в локальном часовом поясе
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Получаем все уникальные даты из журнала
    const allDates = new Set();
    const dateDebug = [];
    journal.forEach((entry, index) => {
        if (entry.date) {
            const originalDate = entry.date;
            const dateStr = normalizeDate(entry.date);
            dateDebug.push({
                index,
                original: originalDate,
                normalized: dateStr,
                employees: entry.employees ? entry.employees.map(e => e.full_name || `${e.last_name} ${e.first_name}`.trim()).join(', ') : 'нет',
                contractor: entry.notes && entry.notes.includes('Подрядчик') ? entry.notes.replace('Подрядчик', '').trim() : null
            });
            if (dateStr) {
                allDates.add(dateStr);
            } else {
                console.warn('Не удалось нормализовать дату:', originalDate, entry);
            }
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
        // Обрабатываем дату через функцию нормализации
        const dateStr = normalizeDate(entry.date);
        if (!dateStr) return;
        
        // Часы могут быть null/undefined, но запись всё равно должна учитываться как смена
        const hours = entry.hours !== null && entry.hours !== undefined ? parseFloat(entry.hours) : 0;
        
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
                
                // Добавляем смену (даже если hours = 0)
                employeeData[empName].shifts.add(dateStr);
                employeeData[empName].totalHours += hours;
                // Если для этой даты уже есть часы, суммируем; иначе устанавливаем
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
                
                // Добавляем смену (даже если hours = 0)
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
                    const hours = worker.hoursByDate[date];
                    // Если есть запись для этой даты (даже с 0 часов), показываем часы, иначе 0
                    if (hours !== undefined && hours !== null) {
                        return `<td>${hours > 0 ? formatHoursDecimal(hours) : '0'}</td>`;
                    } else {
                        return `<td>0</td>`;
                    }
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
        
        // Определяем цвета статусов
        const statusColors = {
            'Работает': '#5cb85c',
            'Уволен': '#d9534f',
            'Кандидат': '#f0ad4e',
            'Запас': '#5bc0de',
            'Консультант': '#9b59b6',
            'Подрядчик': '#e67e22',
            'Временный': '#95a5a6',
            'Не указан': '#95a5a6'
        };
        
        // Получаем уникальные статусы из списка сотрудников
        const uniqueStatuses = [...new Set(employees.map(emp => emp.status || 'Не указан'))].sort();
        
        // Создаём фильтр статусов
        const statusFilterHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                <button type="button" class="status-filter-btn" data-status="all" style="padding: 6px 12px; border: 2px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                    Все
                </button>
                ${uniqueStatuses.map(status => {
                    const color = statusColors[status] || '#95a5a6';
                    const isDefault = status === 'Работает' || status === 'Подрядчик';
                    const size = isDefault ? '24px' : '12px';
                    return `
                        <div style="width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin: 0 2px;">
                            <button type="button" 
                                    class="status-filter-btn ${isDefault ? 'active' : ''}" 
                                    data-status="${status}"
                                    title="${status}"
                                    style="width: ${size}; height: ${size}; border-radius: 50%; border: 2px solid ${color}; background: ${color}; cursor: pointer; transition: all 0.2s; flex-shrink: 0;">
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Функция для фильтрации сотрудников
        function filterEmployeesByStatus(selectedStatuses) {
            if (selectedStatuses.includes('all')) {
                return employees;
            }
            return employees.filter(emp => selectedStatuses.includes(emp.status || 'Не указан'));
        }
        
        // Начальные выбранные статусы (по умолчанию)
        let selectedStatuses = ['Работает', 'Подрядчик'];
        
        // Функция для рендеринга списка сотрудников
        function renderEmployeesList(filteredEmployees) {
            if (filteredEmployees.length === 0) {
                return '<div style="padding: 20px; text-align: center; color: #999;">Нет сотрудников с выбранными статусами</div>';
            }
            return filteredEmployees.map((emp, index) => {
                const fullName = `${emp.last_name || ''} ${emp.first_name || ''} ${emp.middle_name || ''}`.trim();
                const isChecked = selectedEmployeeIds.includes(emp.id);
                const isLast = index === filteredEmployees.length - 1;
                return `
                <label style="display: flex; align-items: center; gap: 10px; padding: 10px 4px; ${!isLast ? 'border-bottom: 1px solid #e8e8e8;' : ''} cursor: pointer; transition: background 0.2s;">
                    <input type="checkbox" name="employees" value="${emp.id}" ${isChecked ? 'checked' : ''} style="margin: 0; cursor: pointer; width: 18px; height: 18px; flex-shrink: 0;">
                    <span style="flex: 1; user-select: none;">${fullName}</span>
                </label>
            `;
            }).join('');
        }
        
        // Изначально отфильтрованный список
        let filteredEmployees = filterEmployeesByStatus(selectedStatuses);
        let employeesCheckboxes = renderEmployeesList(filteredEmployees);
    
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
                            ${statusFilterHTML}
                            <div id="employees-list-container" style="max-height: 200px; overflow-y: auto; border: 2px solid #e0e0e0; padding: 4px 8px; border-radius: 8px; background: white;">
                                ${employeesCheckboxes}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Работа *</label>
                            <select name="work_id" id="journal-work-select" required>
                                <option value="">Выберите работу</option>
                                ${worksOptions}
                            </select>
                            <div id="work-quantity-hint" style="margin-top: 8px; padding: 8px; background-color: #f0f0f0; border-radius: 4px; font-size: 13px; display: none;">
                                <div><strong>Информация о работе:</strong></div>
                                <div id="work-quantity-info"></div>
                            </div>
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
    
    // Обработчик изменения выбора работы - показываем подсказку с количеством
    const workSelect = document.getElementById('journal-work-select');
    const workHint = document.getElementById('work-quantity-hint');
    const workInfo = document.getElementById('work-quantity-info');
    
    workSelect.addEventListener('change', () => {
        const selectedWorkId = parseInt(workSelect.value);
        if (selectedWorkId && works.length > 0) {
            const selectedWork = works.find(w => w.id === selectedWorkId);
            if (selectedWork) {
                const plannedQty = parseFloat(selectedWork.quantity) || 0;
                const completedQty = parseFloat(selectedWork.completed_quantity) || 0;
                const remainingQty = plannedQty - completedQty;
                const unitName = selectedWork.unit_short_name || selectedWork.unit_name || '';
                
                let infoHTML = '';
                if (plannedQty > 0) {
                    infoHTML = `
                        <div style="margin-top: 4px;">Всего в смете: <strong>${formatNumber(plannedQty)} ${unitName}</strong></div>
                        <div style="margin-top: 4px;">Уже выполнено: <strong>${formatNumber(completedQty)} ${unitName}</strong></div>
                        <div style="margin-top: 4px; color: ${remainingQty > 0 ? '#d9534f' : '#5cb85c'};">
                            Осталось: <strong>${formatNumber(remainingQty)} ${unitName}</strong>
                        </div>
                    `;
                } else {
                    infoHTML = '<div style="color: #d9534f;">⚠️ Количество в смете не указано</div>';
                }
                
                workInfo.innerHTML = infoHTML;
                workHint.style.display = 'block';
            } else {
                workHint.style.display = 'none';
            }
        } else {
            workHint.style.display = 'none';
        }
    });
    
    // Если редактируем запись, сразу показываем подсказку
    if (entry && entry.work_id) {
        workSelect.dispatchEvent(new Event('change'));
    }
    
    // Обработчики для фильтра статусов сотрудников
    const statusFilterBtns = document.querySelectorAll(`#${modalId} .status-filter-btn`);
    const employeesListContainer = document.getElementById('employees-list-container');
    
    // Сохраняем функции и переменные для использования в обработчиках
    const currentSelectedStatuses = { value: [...selectedStatuses] };
    
    statusFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const status = this.getAttribute('data-status');
            const statusColorsMap = {
                'Работает': '#5cb85c',
                'Уволен': '#d9534f',
                'Кандидат': '#f0ad4e',
                'Запас': '#5bc0de',
                'Консультант': '#9b59b6',
                'Подрядчик': '#e67e22',
                'Временный': '#95a5a6',
                'Не указан': '#95a5a6'
            };
            
            function filterEmployeesByStatus(selectedStatuses) {
                if (selectedStatuses.includes('all')) {
                    return employees;
                }
                return employees.filter(emp => selectedStatuses.includes(emp.status || 'Не указан'));
            }
            
            function renderEmployeesList(filteredEmployees) {
                if (filteredEmployees.length === 0) {
                    return '<div style="padding: 20px; text-align: center; color: #999;">Нет сотрудников с выбранными статусами</div>';
                }
                return filteredEmployees.map((emp, index) => {
                    const fullName = `${emp.last_name || ''} ${emp.first_name || ''} ${emp.middle_name || ''}`.trim();
                    const isChecked = selectedEmployeeIds.includes(emp.id);
                    const isLast = index === filteredEmployees.length - 1;
                    return `
                    <label style="display: flex; align-items: center; gap: 10px; padding: 10px 4px; ${!isLast ? 'border-bottom: 1px solid #e8e8e8;' : ''} cursor: pointer; transition: background 0.2s;">
                        <input type="checkbox" name="employees" value="${emp.id}" ${isChecked ? 'checked' : ''} style="margin: 0; cursor: pointer; width: 18px; height: 18px; flex-shrink: 0;">
                        <span style="flex: 1; user-select: none;">${fullName}</span>
                    </label>
                `;
                }).join('');
            }
            
            if (status === 'all') {
                // Если нажата кнопка "Все", сбрасываем все фильтры
                currentSelectedStatuses.value = ['all'];
                statusFilterBtns.forEach(b => {
                    if (b.getAttribute('data-status') === 'all') {
                        b.classList.add('active');
                        b.style.borderColor = '#3498db';
                        b.style.background = '#3498db';
                        b.style.color = 'white';
                    } else {
                        b.classList.remove('active');
                        const statusName = b.getAttribute('data-status');
                        const color = statusColorsMap[statusName] || '#95a5a6';
                        b.style.width = '12px';
                        b.style.height = '12px';
                        b.style.borderColor = color;
                        b.style.background = color;
                    }
                });
            } else {
                // Убираем "all" из выбранных, если он был
                if (currentSelectedStatuses.value.includes('all')) {
                    currentSelectedStatuses.value = [];
                    const allBtn = document.querySelector(`#${modalId} .status-filter-btn[data-status="all"]`);
                    if (allBtn) {
                        allBtn.classList.remove('active');
                        allBtn.style.borderColor = '#ddd';
                        allBtn.style.background = 'white';
                        allBtn.style.color = 'inherit';
                    }
                }
                
                // Переключаем статус
                if (currentSelectedStatuses.value.includes(status)) {
                    currentSelectedStatuses.value = currentSelectedStatuses.value.filter(s => s !== status);
                    this.classList.remove('active');
                    const color = statusColorsMap[status] || '#95a5a6';
                    this.style.width = '12px';
                    this.style.height = '12px';
                    this.style.borderColor = color;
                    this.style.background = color;
                } else {
                    currentSelectedStatuses.value.push(status);
                    this.classList.add('active');
                    const color = statusColorsMap[status] || '#95a5a6';
                    this.style.width = '24px';
                    this.style.height = '24px';
                    this.style.borderColor = color;
                    this.style.background = color;
                }
            }
            
            // Если ничего не выбрано, выбираем "Все"
            if (currentSelectedStatuses.value.length === 0) {
                currentSelectedStatuses.value = ['all'];
                const allBtn = document.querySelector(`#${modalId} .status-filter-btn[data-status="all"]`);
                if (allBtn) {
                    allBtn.classList.add('active');
                    allBtn.style.borderColor = '#3498db';
                    allBtn.style.background = '#3498db';
                    allBtn.style.color = 'white';
                }
            }
            
            // Обновляем список сотрудников
            const filtered = filterEmployeesByStatus(currentSelectedStatuses.value);
            employeesListContainer.innerHTML = renderEmployeesList(filtered);
        });
    });
    
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

function editMaterial(id) {
    openAddMaterialModal(id);
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


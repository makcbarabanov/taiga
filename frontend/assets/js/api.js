// ===========================================
// API для работы с базой данных
// ===========================================

const API_BASE_URL = 'http://localhost:3000/api'; // TODO: изменить на реальный URL

// Утилиты для работы с API
const api = {
    // GET запрос
    async get(endpoint) {
        try {
            // Добавляем параметр для обхода кэша браузера
            const cacheBuster = `?_t=${Date.now()}`;
            const url = endpoint.includes('?') 
                ? `${API_BASE_URL}${endpoint}&_t=${Date.now()}`
                : `${API_BASE_URL}${endpoint}${cacheBuster}`;
            const response = await fetch(url, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API GET error:', error);
            throw error;
        }
    },

    // POST запрос
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API POST error:', error);
            throw error;
        }
    },

    // PUT запрос
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API PUT error:', error);
            throw error;
        }
    },

    // DELETE запрос
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API DELETE error:', error);
            throw error;
        }
    }
};

// API методы для проектов
const projectsAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`)
};

// API методы для клиентов
const clientsAPI = {
    getAll: () => api.get('/clients'),
    getById: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.put(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`)
};

// API методы для доходов
const incomeAPI = {
    getAll: () => api.get('/income'),
    getByProject: (projectId) => api.get(`/income?project_id=${projectId}`),
    create: (data) => api.post('/income', data),
    update: (id, data) => api.put(`/income/${id}`, data),
    delete: (id) => api.delete(`/income/${id}`)
};

// API методы для расходов
const expensesAPI = {
    getAll: () => api.get('/expenses'),
    getByProject: (projectId) => api.get(`/expenses?project_id=${projectId}`),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`)
};

// API методы для кассы
const cashAPI = {
    getAll: () => api.get('/cash'),
    getCurrent: () => api.get('/cash/current'),
    getById: (id) => api.get(`/cash/${id}`),
    getByDate: (date) => api.get(`/cash?date=${date}`),
    create: (data) => api.post('/cash', data),
    update: (id, data) => api.put(`/cash/${id}`, data),
    delete: (id) => api.delete(`/cash/${id}`)
};

// Форматирование чисел
// Правило: цифры до 1 - с десятичными долями, от 1 и выше - без десятичных
function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    const absNum = Math.abs(num);
    if (absNum < 1) {
        // Меньше 1 - с десятичными долями
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    } else {
        // От 1 и выше - без десятичных долей
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// API методы для проектов клиентов
const projectStatisticsAPI = {
    getByProject: (projectId) => api.get(`/project-statistics?project_id=${projectId}`),
    create: (data) => api.post('/project-statistics', data),
    update: (id, data) => api.put(`/project-statistics/${id}`, data),
    delete: (id) => api.delete(`/project-statistics/${id}`)
};

const projectWorksAPI = {
    getByProject: (projectId) => api.get(`/project-works?project_id=${projectId}`),
    getById: (id) => api.get(`/project-works/${id}`),
    create: (data) => api.post('/project-works', data),
    update: (id, data) => api.put(`/project-works/${id}`, data),
    delete: (id) => api.delete(`/project-works/${id}`)
};

const projectMaterialsAPI = {
    getByProject: (projectId) => api.get(`/project-materials-estimate?project_id=${projectId}`),
    getById: (id) => api.get(`/project-materials-estimate/${id}`),
    create: (data) => api.post('/project-materials-estimate', data),
    update: (id, data) => api.put(`/project-materials-estimate/${id}`, data),
    delete: (id) => api.delete(`/project-materials-estimate/${id}`)
};

const projectJournalAPI = {
    getByProject: (projectId) => api.get(`/project-journal?project_id=${projectId}`),
    getById: (id) => api.get(`/project-journal/${id}`),
    create: (data) => api.post('/project-journal', data),
    update: (id, data) => api.put(`/project-journal/${id}`, data),
    delete: (id) => api.delete(`/project-journal/${id}`)
};

const projectTimesheetAPI = {
    getByProject: (projectId) => api.get(`/project-timesheet?project_id=${projectId}`)
};

// API методы для магазинов
const shopsAPI = {
    getAll: () => api.get('/shops'),
    getById: (id) => api.get(`/shops/${id}`),
    create: (data) => api.post('/shops', data),
    update: (id, data) => api.put(`/shops/${id}`, data),
    delete: (id) => api.delete(`/shops/${id}`)
};

const employeesAPI = {
    getAll: (params) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get(`/employees${query}`);
    },
    getById: (id) => api.get(`/employees/${id}`),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`)
};

const learningSessionsAPI = {
    async getAll() {
        return api.get('/learning-sessions');
    },
    async create(data) {
        return api.post('/learning-sessions', data);
    },
    async update(id, data) {
        return api.put(`/learning-sessions/${id}`, data);
    }
};

const workResourcesAPI = {
    getById: (id) => api.get(`/work-resources/${id}`),
    getByWork: (workId) => api.get(`/work-resources/work/${workId}`),
    create: (data) => api.post('/work-resources', data),
    update: (id, data) => api.put(`/work-resources/${id}`, data),
    delete: (id) => api.delete(`/work-resources/${id}`),
    getCategories: () => api.get('/work-resources/categories')
};

const rulesAPI = {
    getAll: () => api.get('/rules'),
    getById: (id) => api.get(`/rules/${id}`),
    update: (id, data) => api.put(`/rules/${id}`, data)
};

const listMatAPI = {
    getAll: (params) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get(`/list-mat${query}`);
    },
    getById: (id) => api.get(`/list-mat/${id}`),
    create: (data) => api.post('/list-mat', data)
};


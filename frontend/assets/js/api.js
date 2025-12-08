// ===========================================
// API для работы с базой данных
// ===========================================

const API_BASE_URL = 'http://localhost:3000/api'; // TODO: изменить на реальный URL

// Утилиты для работы с API
const api = {
    // GET запрос
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
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
    getByDate: (date) => api.get(`/cash?date=${date}`),
    create: (data) => api.post('/cash', data),
    update: (id, data) => api.put(`/cash/${id}`, data)
};

// Форматирование чисел
function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
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
    create: (data) => api.post('/project-works', data),
    update: (id, data) => api.put(`/project-works/${id}`, data),
    delete: (id) => api.delete(`/project-works/${id}`)
};

const projectMaterialsAPI = {
    getByProject: (projectId) => api.get(`/project-materials-estimate?project_id=${projectId}`),
    create: (data) => api.post('/project-materials-estimate', data),
    update: (id, data) => api.put(`/project-materials-estimate/${id}`, data),
    delete: (id) => api.delete(`/project-materials-estimate/${id}`)
};

const projectJournalAPI = {
    getByProject: (projectId) => api.get(`/project-journal?project_id=${projectId}`),
    create: (data) => api.post('/project-journal', data),
    update: (id, data) => api.put(`/project-journal/${id}`, data),
    delete: (id) => api.delete(`/project-journal/${id}`)
};

const projectTimesheetAPI = {
    getByProject: (projectId) => api.get(`/project-timesheet?project_id=${projectId}`)
};


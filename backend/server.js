// ===========================================
// Taiga Backend API Server
// ===========================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Routes
app.use('/api/clients', require('./routes/clients'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/income', require('./routes/income'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/cash', require('./routes/cash'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/units', require('./routes/units'));
app.use('/api/expense-categories', require('./routes/expenseCategories'));
app.use('/api/project-statistics', require('./routes/projectStatistics'));
app.use('/api/project-works', require('./routes/projectWorks'));
app.use('/api/project-materials-estimate', require('./routes/projectMaterials'));
app.use('/api/project-journal', require('./routes/projectJournal'));
app.use('/api/project-timesheet', require('./routes/projectTimesheet'));
app.use('/api/db-info', require('./routes/dbInfo'));
app.use('/api/expense-classification', require('./routes/expenseClassification'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/learning-sessions', require('./routes/learningSessions'));
app.use('/api/work-resources', require('./routes/workResources'));
app.use('/api/catalogs', require('./routes/catalogs'));
app.use('/api/list-mat', require('./routes/listMat'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Taiga API is running' });
});

// Root
app.get('/', (req, res) => {
    res.json({ 
        message: 'Taiga Backend API',
        version: '1.0.0',
        endpoints: '/api/health'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Error stack:', err.stack);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('Request body:', req.body);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Taiga Backend API запущен на порту ${PORT}`);
    console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
});



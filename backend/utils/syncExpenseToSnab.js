// ===========================================
// Утилита для синхронизации расходов с СНАБ
// ===========================================

const pool = require('../db');

/**
 * Синхронизирует расход с СНАБ (project_materials_estimate)
 * @param {Object} expense - Объект расхода из БД
 * @returns {Object} - Результат синхронизации { found: boolean, updated: boolean, material_id: number|null }
 */
async function syncExpenseToSnab(expense) {
    try {
        // Получаем категорию расхода
        const categoryResult = await pool.query(
            'SELECT name FROM taiga.cat_expense WHERE id = $1',
            [expense.category_id]
        );
        
        if (categoryResult.rows.length === 0) {
            return { found: false, updated: false, material_id: null, error: 'Category not found' };
        }
        
        const categoryName = categoryResult.rows[0].name;
        
        // Исключаем категории, которые не синхронизируются
        const excludedCategories = ['ТЗР', 'ФОТ', 'МАРЖА'];
        if (excludedCategories.includes(categoryName)) {
            return { found: false, updated: false, material_id: null, skipped: true, reason: 'Category excluded' };
        }
        
        // Проверяем, обязательная ли категория
        const requiredCategories = ['Мат', 'Расход'];
        const optionalCategories = ['Накладные', 'Инструм'];
        const isRequired = requiredCategories.includes(categoryName);
        const isOptional = optionalCategories.includes(categoryName);
        
        if (!isRequired && !isOptional) {
            return { found: false, updated: false, material_id: null, skipped: true, reason: 'Unknown category' };
        }
        
        // Если нет subcategory (названия материала), нечего синхронизировать
        if (!expense.subcategory || !expense.subcategory.trim()) {
            return { found: false, updated: false, material_id: null, error: 'No material name' };
        }
        
        const materialName = expense.subcategory.trim();
        
        // Ищем материал в _list_mat по имени
        let materialFromList = null;
        let listMatResult = await pool.query(
            `SELECT * FROM taiga._list_mat WHERE mat = $1 LIMIT 1`,
            [materialName]
        );
        
        if (listMatResult.rows.length > 0) {
            materialFromList = listMatResult.rows[0];
        } else {
            // Материала нет в справочнике - добавляем автоматически
            // _list_mat - единый справочник всех материалов, работаем только через него
            try {
                const insertResult = await pool.query(
                    `INSERT INTO taiga._list_mat (mat, cat_expense_id, primary_unit)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (mat) DO NOTHING
                     RETURNING *`,
                    [materialName, expense.category_id, expense.unit_id]
                );
                
                if (insertResult.rows.length > 0) {
                    materialFromList = insertResult.rows[0];
                    console.log(`✅ Материал "${materialName}" автоматически добавлен в _list_mat`);
                } else {
                    // Конфликт - материал уже был добавлен параллельно, получаем его
                    listMatResult = await pool.query(
                        `SELECT * FROM taiga._list_mat WHERE mat = $1 LIMIT 1`,
                        [materialName]
                    );
                    if (listMatResult.rows.length > 0) {
                        materialFromList = listMatResult.rows[0];
                    }
                }
            } catch (error) {
                console.error(`Ошибка при добавлении материала "${materialName}" в _list_mat:`, error.message);
                // Продолжаем работу, даже если не удалось добавить
            }
        }
        
        // Ищем материал в СНАБ по project_id и material_name
        const snabResult = await pool.query(
            `SELECT * FROM taiga.project_materials_estimate 
             WHERE project_id = $1 AND material_name = $2`,
            [expense.project_id, materialName]
        );
        
        if (snabResult.rows.length > 0) {
            // Материал найден в СНАБ - обновляем фактические данные
            const snabMaterial = snabResult.rows[0];
            
            // Суммируем количество и стоимость из всех расходов для этого материала
            const expensesSum = await pool.query(
                `SELECT 
                    COALESCE(SUM(quantity), 0) as total_quantity,
                    COALESCE(SUM(amount), 0) as total_cost,
                    CASE 
                        WHEN SUM(quantity) > 0 THEN SUM(amount) / SUM(quantity)
                        ELSE 0
                    END as avg_price
                FROM taiga.expenses
                WHERE project_id = $1 
                    AND subcategory = $2
                    AND category_id = $3`,
                [expense.project_id, materialName, expense.category_id]
            );
            
            const totals = expensesSum.rows[0];
            
            // Обновляем фактические данные в СНАБ
            await pool.query(
                `UPDATE taiga.project_materials_estimate
                 SET fact_quantity = $1,
                     fact_price = $2,
                     fact_cost = $3,
                     material_id = $4
                 WHERE id = $5`,
                [
                    parseFloat(totals.total_quantity) || 0,
                    parseFloat(totals.avg_price) || 0,
                    parseFloat(totals.total_cost) || 0,
                    materialFromList ? materialFromList.id : snabMaterial.material_id,
                    snabMaterial.id
                ]
            );
            
            return {
                found: true,
                updated: true,
                material_id: materialFromList ? materialFromList.id : snabMaterial.material_id,
                snab_id: snabMaterial.id,
                message: 'Материал найден в СНАБ. Фактические данные обновлены.'
            };
        } else {
            // Материал не найден в СНАБ
            if (isRequired) {
                // Для обязательных категорий возвращаем флаг, что нужно задать вопрос
                return {
                    found: false,
                    updated: false,
                    material_id: materialFromList ? materialFromList.id : null,
                    requiresAction: true,
                    category: categoryName,
                    materialName: materialName,
                    materialFromList: materialFromList ? materialFromList.id : null
                };
            } else {
                // Для необязательных категорий - создаём запись в СНАБ, если материал есть в _list_mat
                if (materialFromList) {
                    // Создаём запись в СНАБ
                    const newSnabResult = await pool.query(
                        `INSERT INTO taiga.project_materials_estimate
                         (project_id, category, material_name, unit_id, planned_quantity, planned_price, planned_cost,
                          resource_category_id, material_id, fact_quantity, fact_price, fact_cost)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                         RETURNING *`,
                        [
                            expense.project_id,
                            categoryName,
                            materialName,
                            expense.unit_id,
                            0, // planned_quantity
                            0, // planned_price
                            0, // planned_cost
                            expense.category_id,
                            materialFromList.id,
                            expense.quantity || 0, // fact_quantity
                            expense.price || 0, // fact_price
                            expense.amount || 0 // fact_cost
                        ]
                    );
                    
                    return {
                        found: false,
                        updated: true,
                        created: true,
                        material_id: materialFromList.id,
                        snab_id: newSnabResult.rows[0].id,
                        message: 'Материал добавлен в СНАБ (необязательная категория).'
                    };
                }
                
                // Для необязательных категорий просто пропускаем
                return {
                    found: false,
                    updated: false,
                    material_id: null,
                    skipped: true,
                    reason: 'Optional category, material not in SNAB and not in _list_mat'
                };
            }
        }
    } catch (error) {
        console.error('Error syncing expense to SNAB:', error);
        return {
            found: false,
            updated: false,
            material_id: null,
            error: error.message
        };
    }
}

module.exports = { syncExpenseToSnab };

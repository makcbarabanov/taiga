// ===========================================
// Routes для получения информации о структуре БД
// ===========================================

const express = require('express');
const router = express.Router();
const pool = require('../db');

// Получить список всех таблиц в схеме taiga
router.get('/tables', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                table_name,
                (SELECT COUNT(*) 
                 FROM information_schema.columns 
                 WHERE table_schema = 'taiga' 
                 AND table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'taiga'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: error.message });
    }
});

// Получить информацию о полях конкретной таблицы
router.get('/tables/:tableName/columns', async (req, res) => {
    try {
        const { tableName } = req.params;
        
        // Информация о колонках
        const columns = await pool.query(`
            SELECT 
                c.column_name,
                c.data_type,
                c.character_maximum_length,
                c.is_nullable,
                c.column_default,
                c.ordinal_position,
                col_description(pgc.oid, c.ordinal_position) as column_comment
            FROM information_schema.columns c
            LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
            LEFT JOIN pg_namespace pgn ON pgn.oid = pgc.relnamespace AND pgn.nspname = c.table_schema
            WHERE c.table_schema = 'taiga'
            AND c.table_name = $1
            ORDER BY c.ordinal_position
        `, [tableName]);
        
        // Информация о внешних ключах
        const foreignKeys = await pool.query(`
            SELECT
                kcu.column_name,
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'taiga'
            AND tc.table_name = $1
        `, [tableName]);
        
        // Информация о первичных ключах
        const primaryKeys = await pool.query(`
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'taiga'
            AND tc.table_name = $1
        `, [tableName]);
        
        // Информация об индексах
        const indexes = await pool.query(`
            SELECT
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'taiga'
            AND tablename = $1
        `, [tableName]);
        
        // Примеры данных (первые 3 строки)
        let examples = [];
        try {
            const exampleResult = await pool.query(`
                SELECT * FROM taiga."${tableName}" LIMIT 3
            `);
            examples = exampleResult.rows;
        } catch (err) {
            // Игнорируем ошибки при получении примеров
        }
        
        // Формируем результат
        const pkColumns = primaryKeys.rows.map(pk => pk.column_name);
        const fkMap = {};
        foreignKeys.rows.forEach(fk => {
            fkMap[fk.column_name] = {
                foreign_table: fk.foreign_table_name,
                foreign_column: fk.foreign_column_name,
                constraint: fk.constraint_name
            };
        });
        
        const result = columns.rows.map(col => ({
            column_name: col.column_name,
            data_type: col.data_type,
            max_length: col.character_maximum_length,
            is_nullable: col.is_nullable === 'YES',
            default_value: col.column_default,
            is_primary_key: pkColumns.includes(col.column_name),
            foreign_key: fkMap[col.column_name] || null,
            comment: col.column_comment,
            position: col.ordinal_position
        }));
        
        res.json({
            table_name: tableName,
            columns: result,
            indexes: indexes.rows,
            examples: examples
        });
        
    } catch (error) {
        console.error('Error fetching table info:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


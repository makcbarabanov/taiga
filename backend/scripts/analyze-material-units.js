// ===========================================
// Анализ единиц измерений по группам материалов
// ===========================================

const fs = require('fs');
const path = require('path');

const analysisPath = path.join(__dirname, '../../materials_analysis.json');
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

console.log('📊 Анализ единиц измерений по группам материалов\n');

Object.keys(analysis.groups).forEach(groupName => {
    const materials = analysis.groups[groupName];
    const unitsMap = new Map();
    
    materials.forEach(material => {
        material.units.forEach(unit => {
            const normalizedUnit = unit.toLowerCase().trim();
            if (!unitsMap.has(normalizedUnit)) {
                unitsMap.set(normalizedUnit, {
                    original: unit,
                    count: 0,
                    examples: []
                });
            }
            const unitData = unitsMap.get(normalizedUnit);
            unitData.count++;
            if (unitData.examples.length < 3) {
                unitData.examples.push(material.name);
            }
        });
    });
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 ${groupName} (${materials.length} материалов)`);
    console.log('='.repeat(60));
    
    const sortedUnits = Array.from(unitsMap.entries())
        .sort((a, b) => b[1].count - a[1].count);
    
    sortedUnits.forEach(([unit, data]) => {
        console.log(`\n  ${data.original} (${data.count} материалов)`);
        if (data.examples.length > 0) {
            console.log(`    Примеры: ${data.examples.slice(0, 2).join(', ')}`);
        }
    });
    
    // Определяем тип материала (простой/сложный)
    if (sortedUnits.length === 1) {
        console.log(`\n  ✅ Тип: ПРОСТОЙ (одна единица измерения: ${sortedUnits[0][1].original})`);
    } else if (sortedUnits.length > 1) {
        console.log(`\n  ⚠️  Тип: ТРЕБУЕТ УТОЧНЕНИЯ (${sortedUnits.length} разных единиц)`);
        console.log(`     Возможно, это СЛОЖНЫЙ материал с несколькими единицами`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('✅ Анализ завершён');




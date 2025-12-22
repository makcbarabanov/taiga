# -*- coding: utf-8 -*-
import openpyxl
import sys
import os

file_path = r'E:\Forge\Экспорт\Последовательность_этапов_строительства_каркасного_дома.xlsx'

try:
    wb = openpyxl.load_workbook(file_path)
    ws = wb['Лист1']  # Лист с этапами
    
    print('='*80)
    print('СТРУКТУРА ЭТАПОВ СТРОИТЕЛЬСТВА КАРКАСНОГО ДОМА')
    print('='*80)
    
    stages = []
    current_stage = None
    
    for i, row in enumerate(ws.iter_rows(values_only=True), 1):
        col1 = str(row[0]).strip() if row[0] else ''
        col2 = str(row[1]).strip() if row[1] else ''
        col3 = str(row[2]).strip() if row[2] else ''
        
        if not col1:
            continue
            
        # Определяем, это этап (заголовок) или материал
        if col1.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')) and ':' in col1:
            # Это новый этап
            stage_name = col1.replace(':', '').strip()
            current_stage = {
                'name': stage_name,
                'materials': []
            }
            stages.append(current_stage)
            print(f'\n📋 {stage_name}')
        elif current_stage and col1 and not col1.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
            # Это материал/работа в текущем этапе
            material = {
                'name': col1,
                'description': col2,
                'unit': col3
            }
            current_stage['materials'].append(material)
            print(f'  • {col1} ({col3}) - {col2}')
    
    print('\n' + '='*80)
    print(f'Всего этапов: {len(stages)}')
    total_materials = sum(len(s['materials']) for s in stages)
    print(f'Всего материалов/работ: {total_materials}')
    
except Exception as e:
    print(f'Ошибка: {e}')
    import traceback
    traceback.print_exc()


with open('client.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
print(f'Total lines: {len(lines)}')
print(f'\nLast 10 lines:')
for i, line in enumerate(lines[-10:], start=len(lines)-9):
    print(f'{i}: {repr(line)}')















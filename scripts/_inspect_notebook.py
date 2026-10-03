"""Helper para inspeccionar el notebook antes de editarlo."""
import json
import sys

path = sys.argv[1]
target = sys.argv[2] if len(sys.argv) > 2 else "Optimizacion_de_Carteras"

with open(path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    if cell.get('cell_type') == 'code':
        src = ''.join(cell.get('source', []))
        if target in src or 'PROJECT_ROOT = Path.cwd()' in src:
            print(f'=== Cell index {i} (id={cell.get("id")}) ===')
            print(repr(src))
            print()

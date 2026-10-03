"""
Fix the hardcoded project root path in the notebook cell-setup.

The original logic was:
    PROJECT_ROOT = Path.cwd()
    if not (PROJECT_ROOT / "data" / "synthetic").exists():
        PROJECT_ROOT = Path(r"C:\\Workspace\\Optimizacion_de_Carteras\\modelo_propension")

We replace it with a walk-up search starting from cwd so the notebook works
no matter where it's launched from, as long as the cwd is somewhere inside
the project.
"""
import json
import sys
from pathlib import Path

NOTEBOOK = Path(sys.argv[1])

with NOTEBOOK.open('r', encoding='utf-8') as f:
    nb = json.load(f)

OLD_LINES = [
    '# Paths\n',
    'PROJECT_ROOT = Path.cwd()\n',
    'if not (PROJECT_ROOT / "data" / "synthetic").exists():\n',
    '    PROJECT_ROOT = Path(r"C:\\Workspace\\Optimizacion_de_Carteras\\modelo_propension")\n',
]
OLD_LINES_JOINED = ''.join(OLD_LINES)

NEW_LINES = [
    '# Paths: busca la raiz del proyecto subiendo desde el cwd hasta encontrar\n',
    '# el directorio que contiene data/synthetic. Asi el notebook funciona sin\n',
    '# importar desde donde se ejecute, siempre que sea dentro del proyecto.\n',
    'def _find_project_root(start: Path) -> Path:\n',
    '    for p in (start, *start.parents):\n',
    '        if (p / "data" / "synthetic").exists():\n',
    '            return p\n',
    '    return start\n',
    'PROJECT_ROOT = _find_project_root(Path.cwd())\n',
]
NEW_LINES_JOINED = ''.join(NEW_LINES)

fixed = 0
for i, cell in enumerate(nb['cells']):
    if cell.get('cell_type') != 'code':
        continue
    src_lines = cell.get('source', [])
    src_joined = ''.join(src_lines)
    if OLD_LINES_JOINED not in src_joined:
        continue
    new_src_joined = src_joined.replace(OLD_LINES_JOINED, NEW_LINES_JOINED)
    # Re-split into lines preserving trailing newlines
    new_src_lines = []
    pos = 0
    while pos < len(new_src_joined):
        nl = new_src_joined.find('\n', pos)
        if nl == -1:
            new_src_lines.append(new_src_joined[pos:])
            break
        new_src_lines.append(new_src_joined[pos:nl+1])
        pos = nl + 1
    cell['source'] = new_src_lines
    fixed += 1
    print(f"  fixed cell index {i} (id={cell.get('id')})")

if fixed == 0:
    print(f"  ERROR: no cell matched the expected old pattern in {NOTEBOOK}", file=sys.stderr)
    sys.exit(1)

with NOTEBOOK.open('w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
    f.write('\n')

print(f"OK {NOTEBOOK.name}: {fixed} cell(s) fixed")

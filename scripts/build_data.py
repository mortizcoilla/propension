"""
scripts/build_data.py
=====================

Genera js/data.js (datos embebidos para el dashboard HTML) desde
data/processed/metrics.json. Solo incluye los datos necesarios para
las visualizaciones (no las listas grandes de y_pred_test).

Uso:
    python scripts/build_data.py
"""
from __future__ import annotations

import json
from pathlib import Path

# PROJECT_ROOT se resuelve relativamente a la ubicacion de este script, para que
# el script funcione sin importar donde este clonado el proyecto.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROC_DIR = PROJECT_ROOT / "data" / "processed"
JS_DIR = PROJECT_ROOT / "js"
JS_DIR.mkdir(parents=True, exist_ok=True)

src = json.loads((PROC_DIR / "metrics.json").read_text(encoding="utf-8"))

# Limpiar el JSON para el dashboard: solo lo que las visualizaciones necesitan
data = {
    "metadata": src["metadata"],
    "segments": src["segmentos"],
    "results": {
        cl: {k: v for k, v in r.items() if k not in ("y_pred_test", "y_test_sample")}
        for cl, r in src["results"].items()
    },
    "precision_at_k": src["precision_at_k"],
    "feature_importance": src["feature_importance"],
    "hiperparametros": src["hiperparametros"],
}

# Variable groups (mismo que en el notebook, hardcoded para el dashboard)
GROUPS = {
    "Geografia": ["longitud", "latitud", "distancia_sed", "distancia_set", "distancia_sed_set"],
    "Categoria red": ["id_set", "id_alimentador", "id_sed", "id_llave", "id_marca",
                       "id_ali_sector_zona", "id_distrito"],
    "Cliente": ["tipo_fase_M", "tipo_acomet_S", "potencia", "tiempo_ult_cambio_med"],
    "Inspeccion": ["insp_efectivas", "insp_pendientes", "notificaciones", "notif_causal1",
                   "notif_causal4", "casos_medidor_cambiado", "casos_medidor_manip"],
    "Contexto red": ["efectividad_marca", "insp_por_cuenta_marca", "nro_notif_causal4_sed",
                     "efectividad_distrito", "perc_recup_causal4_marca", "recup_prom_causal4_marca"],
    "Consumo": ["pro_cons_6m", "pro_cons_12m", "std_cons_6m", "ratio_cons_potencia_12m",
                "diff_cons_6m_12m", "min_diff", "consumos_0", "consumos_dimi"],
}
data["groups"] = GROUPS

# Construir matriz de contribucion por grupo y cluster
clusters = list(data["results"].keys())
matrix = []
for cl in clusters:
    fi = {f["feature"]: f["importance"] for f in data["feature_importance"][cl]}
    total = sum(fi.values()) or 1
    row = []
    for gname, feats in GROUPS.items():
        s = sum(fi.get(f, 0) for f in feats)
        row.append(round(s / total * 100, 1))
    matrix.append(row)
data["group_contribution"] = {
    "groups": list(GROUPS.keys()),
    "clusters": [{"id": cl.split(".")[0], "name": cl} for cl in clusters],
    "matrix": matrix,
}

# Generar data.js con IIFE
out = JS_DIR / "data.js"
js_content = (
    "/**\n"
    " * js/data.js\n"
    " * Datos embebidos para el dashboard HTML del modelo de propension.\n"
    " * Generado por scripts/build_data.py desde data/processed/metrics.json.\n"
    " */\n"
    "(function () {\n"
    "  'use strict';\n"
    f"  window.MP = {json.dumps(data, indent=2, ensure_ascii=False)};\n"
    "})();\n"
)
out.write_text(js_content, encoding="utf-8")
print(f"OK {out} ({out.stat().st_size:,} bytes)")

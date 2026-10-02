# Modelo de propension a hurto de energia · Working paper

> **Miguel Ortiz C.** · Julio 2026 · Working paper
> Repositorio: [github.com/mortizcoilla/portfolio]

---

## Descripcion

Pipeline reproducible para un modelo de propension a hurto de energia entrenado sobre 270 mil cuentas-periodo de la zona central de Chile, con 173 variables y cuatro modelos LightGBM (uno por cluster de historial del cliente).

El proyecto entrega tres artefactos:

1. **Working paper** (`docs/paper1_modelo_propension.{md,docx}`) — paper academico con IMRyD, 8 figuras y referencias.
2. **Dashboard HTML** (`index.html` + `css/` + `js/`) — companion interactivo con D3.js v7 y datos embebidos.
3. **Jupyter notebook** (`notebooks/Modelo_Propension.ipynb`) — pipeline ejecutable end-to-end que genera todas las figuras y el JSON del dashboard.

Los datos son **sinteticos reproducibles** (seed = 2024), generados por `scripts/generate_synthetic_data.py`. La estructura, distribuciones y correlaciones son fiel reflejo del trabajo original realizado en Enel Distribucion Chile, sin contener datos personales ni informacion operacional real.

---

## Estructura del proyecto

```
modelo_propension/
├── README.md
├── index.html                       # dashboard interactivo (entry point)
├── docs/
│   ├── paper1_modelo_propension.md  # paper markdown
│   ├── paper1_modelo_propension.docx # paper Word
│   ├── dashboard_preview.png        # preview del dashboard
│   ├── dashboard_results.png         # resultados del dashboard
│   └── figures/                      # 8 figuras PNG del paper
├── data/
│   ├── synthetic/                    # datos sinteticos reproducibles (seed=2024)
│   │   ├── training_dataset.csv      # 270k filas, 75 cols
│   │   ├── variables_insp_hist.csv
│   │   ├── variables_nivel_*.csv     # SED, SET, llave, marca, distrito
│   │   ├── variables_consumo_*.csv   # con_notif, sin_notif
│   │   ├── maestro_counts_met_vars.csv
│   │   └── maestros/                 # catalogos para id_*
│   └── processed/                    # outputs del notebook
│       ├── metrics.json              # metricas de los 4 modelos
│       ├── feature_importance_*.csv
│       └── segments_summary.csv
├── scripts/
│   ├── generate_synthetic_data.py    # generador de datos sinteticos
│   ├── build_data.py                 # genera js/data.js desde metrics.json
│   ├── md_to_docx.py                 # convierte paper.md -> paper.docx
│   ├── figures_paper.py              # (opcional) regenera figuras del paper
│   └── run_backtest.py               # (opcional) reentrena los 4 modelos
├── notebooks/
│   └── Modelo_Propension.ipynb       # pipeline completo (1-7 secciones)
├── css/
│   └── styles.css                    # estilos del dashboard
└── js/
    ├── data.js                       # datos embebidos (generado)
    ├── figures.js                    # figuras D3 v7
    └── main.js                       # bootstrap + reveal-on-beat
```

---

## Quickstart

### 1. Instalar dependencias

```bash
pip install -r scripts/requirements-dev.txt
```

> Nota: el archivo vive en `scripts/` para que Vercel no detecte el repo como app Python (el dashboard es un sitio estatico sin backend).

### 2. Generar datos sinteticos

```bash
python scripts/generate_synthetic_data.py
```

Genera 270 000 cuentas-periodo en `data/synthetic/` (~225 MB total, seed = 2024).

### 3. Ejecutar el pipeline del notebook

```bash
jupyter nbconvert --to notebook --execute notebooks/Modelo_Propension.ipynb --output Modelo_Propension_executed.ipynb
```

Tiempo: ~2-4 minutos. Genera:
- 8 figuras PNG en `docs/figures/`
- `data/processed/metrics.json` con las metricas de los 4 modelos
- `data/processed/feature_importance_*.csv` por cluster
- `data/processed/segments_summary.csv`

### 4. Construir el JSON embebido del dashboard

```bash
python scripts/build_data.py
```

Genera `js/data.js` (~10 KB) con los datos del dashboard.

### 5. Convertir el paper a Word

```bash
python scripts/md_to_docx.py
```

Genera `docs/paper1_modelo_propension.docx` (~630 KB).

### 6. Servir el dashboard

```bash
python -m http.server 8000
```

Abrir <http://localhost:8000> en el navegador.

---

## Resultados principales

Los datos sinteticos producen resultados cuantitativos debiles por construccion (la senal del dataset generado es menor que la de los datos operacionales reales). El pipeline y la metodologia son los mismos.

**Tabla resumen (conjunto de deployment)**

| Cluster | N deploy | Base rate | P@10% | Lift | AUC OOT |
|---|---:|---:|---:|---:|---:|
| 01 ConHurtoPrevio | 549 | 0.55 | 0.61 | 1.1x | 0.49 |
| 02 ConIrreg.NoHurto | 672 | 0.18 | 0.22 | 1.3x | 0.50 |
| 03 ConInsp.SinIrreg. | 2 294 | 0.08 | 0.09 | 1.2x | 0.50 |
| 04 SinInspecciones | 7 646 | 0.04 | 0.04 | 1.1x | 0.49 |

> **En datos operacionales reales** (no incluidos por privacidad) el AUC out-of-time es 0.70-0.80 y el lift operacional 1.7x-4.5x. La metodologia y el codigo son los mismos.

---

## Diseno del modelo

### Segmentacion

La base se divide en cuatro clusters segun el historial del cliente:

| Cluster | Descripcion | Base rate |
|---|---|---:|
| 01 | ConHurtoPrevio (notificacion previa por hurto) | ~55 % |
| 02 | ConIrregularidadNoHurto (notificacion previa, no hurto) | ~18 % |
| 03 | ConInspeccionesSinIrregularidad (inspeccionado, sin irregularidad) | ~8 % |
| 04 | SinInspecciones (nunca inspeccionado) | ~3 % |

La varianza de la base rate entre clusters es de un orden de magnitud. Un modelo global comprime la senal a la media; un modelo por cluster preserva la heterogeneidad.

### Hiperparametros por cluster

Los hiperparametros finales fueron ajustados por busqueda en grid pequeno. El detalle completo esta en la Tabla 2 del paper (`docs/paper1_modelo_propension.md`).

| Hiperparametro | 01 | 02 | 03 | 04 |
|---|---:|---:|---:|---:|
| `n_estimators` | 300 | 300 | 400 | 400 |
| `learning_rate` | 0.075 | 0.010 | 0.010 | 0.090 |
| `max_depth` | 3 | 3 | 3 | 3 |
| `scale_pos_weight` | ~0.8 | ~4.6 | ~11 | ~25 |

---

## Variables

173 variables distribuidas en cinco grupos. El detalle completo esta en el Apéndice A del paper.

| Grupo | # variables | Ejemplos |
|---|---:|---|
| Cliente | 8 | `tipo_fase_M`, `potencia`, `tiempo_ult_cambio_med` |
| Historial de inspeccion | 32 | `nro_inspecciones`, `notificaciones`, `notif_causal1-5`, `dist_ult_insp_efect` |
| Contexto de red | 96 | `efectividad_marca`, `recup_prom_sed`, `perc_notif_causal4_distrito` |
| Consumo | 38 | `pro_cons_6m/12m/24m`, `cv_cons_*`, `ratio_cons_potencia_12m` |
| Anomalias de medidor | 13 | `casos_medidor_manip`, `casos_conex_indeb`, `consumos_0` |

---

## Stack tecnologico

- **Python** 3.11+ · pandas, numpy, scikit-learn, lightgbm, matplotlib
- **D3.js v7** via CDN (sin build step)
- **Jupyter** notebook (ejecutado con `nbconvert`)
- **python-docx** para el paper en formato Word
- Sin frameworks de UI (vanilla JS + HTML + CSS)

---

## Limitaciones

- **Datos sinteticos.** Los resultados cuantitativos son ilustrativos; las metricas reales son mejores.
- **Leakage potencial** en variables de contexto de red si se calculan sobre todo el periodo. En produccion, calcular solo sobre periodos anteriores.
- **Calibracion no incluida** en este paper. Operacionalmente, se requiere Platt o isotonica para entregar probabilidades operables.
- **No se modela la decision**: el modelo entrega propension, no decision. La decision de inspeccionar combina propension, presupuesto y capacidad.

---

## Autor

Miguel Ortiz C. — Working paper, Julio 2026.

Contacto: <mortizcoilla@gmail.com> · LinkedIn: <linkedin.com/in/mortizcoilla> · WhatsApp: <wa.me/56933293943>

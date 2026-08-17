"""
scripts/generate_synthetic_data.py
==================================

Generador de datos sinteticos reproducibles para el modelo de propension a
hurto de energia. Reproduce la estructura logica del dataset original de
Enel Distribucion (cluster, variables de consumo, historial, geografia)
sin usar datos reales ni datos personales.

Vectorizado en numpy/pandas para que se ejecute en pocos segundos.

Uso:
    python scripts/generate_synthetic_data.py

Salidas (en data/synthetic/):
    - training_dataset.csv, variables_*.csv, maestros/*.csv

Reproducibilidad: seed = 2024
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Configuracion
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(r"C:\Workspace\Optimizacion_de_Carteras\modelo_propension")
SYNTH_DIR = PROJECT_ROOT / "data" / "synthetic"
SYNTH_DIR.mkdir(parents=True, exist_ok=True)
(SYNTH_DIR / "maestros").mkdir(parents=True, exist_ok=True)

SEED = 2024
rng = np.random.default_rng(SEED)

PERIODOS = pd.period_range("2019-01", "2020-12", freq="M")
N_PERIODOS = len(PERIODOS)
print(f"Periodos: {N_PERIODOS} ({PERIODOS[0]} a {PERIODOS[-1]})")

CLUSTERS = [
    "01.- ConHurtoPrevio",
    "02.- ConIrregularidadNoHurto",
    "03.- ConInspeccionesSinIrregularidad",
    "04.- SinInspecciones",
]
CLUSTER_WEIGHTS = np.array([0.05, 0.06, 0.20, 0.69])
CLUSTER_BASE_RATE = {
    "01.- ConHurtoPrevio": 0.55,
    "02.- ConIrregularidadNoHurto": 0.18,
    "03.- ConInspeccionesSinIrregularidad": 0.08,
    "04.- SinInspecciones": 0.03,
}

# Universo geografico / electrico
N_DISTRITOS = 12
N_SETS = 80
N_ALIMENTADORES = 240
N_SEDS = 600
N_LLAVES = 4000
N_MARCAS = 6
N_SECTORES = 10
N_ZONAS = 8

POTENCIA_DIST = {"baja": (1.5, 4.5), "media": (5.0, 11.0), "alta": (15.0, 45.0)}
POTENCIA_PROBS = np.array([0.62, 0.30, 0.08])
POTENCIA_PROBS_02 = np.array([0.45, 0.40, 0.15])  # cluster 02 sesgo comercial

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _save(df: pd.DataFrame, name: str) -> None:
    out = SYNTH_DIR / name
    df.to_csv(out, index=False)
    print(f"  {name:<45s} {len(df):>10,} filas, {df.shape[1]:>3d} cols")


def _maestro(values, name):
    df = pd.DataFrame({name: sorted(set(values))})
    df[f"id_{name}"] = df.reset_index().index
    df.to_csv(SYNTH_DIR / "maestros" / f"maestro_{name}.csv", index=False)
    return df


# ---------------------------------------------------------------------------
# 1. Catalogos / maestros
# ---------------------------------------------------------------------------

print("\n[1/4] Generando catalogos y maestros ...")

distritos = [f"D{d:02d}" for d in range(1, N_DISTRITOS + 1)]
sets = [f"S{s:04d}" for s in range(1, N_SETS + 1)]
alimentadores = [f"A{a:04d}" for a in range(1, N_ALIMENTADORES + 1)]
seds = [f"SED{se:05d}" for se in range(1, N_SEDS + 1)]
llaves = [f"L{l:06d}" for l in range(1, N_LLAVES + 1)]
marcas = [f"M{m}" for m in range(1, N_MARCAS + 1)]
sectores = [f"sec{i}" for i in range(1, N_SECTORES + 1)]
zonas = [f"zona{i}" for i in range(1, N_ZONAS + 1)]

_maestro(distritos, "distrito")
_maestro(sets, "set")
_maestro(alimentadores, "alimentador")
_maestro(seds, "sed")
_maestro(llaves, "llave")
_maestro(marcas, "marca")

# Tabla de equivalencias set->alimentador
set_idx = rng.integers(0, N_ALIMENTADORES, size=N_SETS)
set_to_ali = np.array(alimentadores)[set_idx]
# Tabla sed->alimentador (aseguramos que cada alimentador tenga al menos 1 SED)
sed_to_ali_idx = rng.integers(0, N_ALIMENTADORES, size=N_SEDS)
# Garantizar que cada alimentador tenga al menos 2 SEDs
for a_idx in range(N_ALIMENTADORES):
    indices = np.where(sed_to_ali_idx == a_idx)[0]
    if len(indices) < 2:
        nuevos = rng.choice(N_SEDS, size=2 - len(indices), replace=False)
        sed_to_ali_idx[nuevos] = a_idx
sed_to_ali = np.array(alimentadores)[sed_to_ali_idx]
sed_per_ali = {a: [] for a in alimentadores}
for i, s in enumerate(seds):
    sed_per_ali[sed_to_ali[i]].append(s)
# Llaves por SED
n_llaves_por_sed = rng.integers(4, 30, size=N_SEDS)
llaves_por_sed = {sed: rng.choice(llaves, size=n, replace=False).tolist()
                  for sed, n in zip(seds, n_llaves_por_sed)}

# Ubicacion geografica
LON_C, LAT_C = -70.65, -33.45
LON_SPAN, LAT_SPAN = 0.5, 0.3
sed_lon = LON_C + rng.uniform(-LON_SPAN/2, LON_SPAN/2, size=N_SEDS)
sed_lat = LAT_C + rng.uniform(-LAT_SPAN/2, LAT_SPAN/2, size=N_SEDS)
set_lon = sed_lon[set_idx] + rng.normal(0, 0.005, size=N_SETS)

# Ali-sector-zona (combinacion)
ali_sector_zona_vals = []
for a in alimentadores:
    secs = rng.choice(sectores, size=2, replace=False)
    for s in secs:
        z = rng.choice(zonas, size=1)[0]
        ali_sector_zona_vals.append((a, s, z))
ali_sector_zona_vals = list(set(ali_sector_zona_vals))[:320]
maestro_ali_sector_zona = pd.DataFrame(ali_sector_zona_vals,
                                       columns=["alimentador", "sector", "zona"])
maestro_ali_sector_zona["id_ali_sector_zona"] = maestro_ali_sector_zona.reset_index().index
maestro_ali_sector_zona.to_csv(SYNTH_DIR / "maestros" / "maestro_ali_sector_zona.csv", index=False)

# ---------------------------------------------------------------------------
# 2. Training dataset (vectorizado)
# ---------------------------------------------------------------------------

print("\n[2/4] Generando training_dataset ...")

N_TRAIN = 270_000

# Asignacion de cluster y periodo
clusters = rng.choice(CLUSTERS, size=N_TRAIN, p=CLUSTER_WEIGHTS)
periodo_idx = rng.integers(0, N_PERIODOS, size=N_TRAIN)
periodo = np.array([int(p.strftime("%Y%m")) for p in PERIODOS])[periodo_idx]

# Categoria de potencia segun cluster
pot_keys = np.array(list(POTENCIA_DIST.keys()))
pot_low = np.array([POTENCIA_DIST[k][0] for k in pot_keys])
pot_high = np.array([POTENCIA_DIST[k][1] for k in pot_keys])
pot_cat = np.empty(N_TRAIN, dtype=object)
mask_c2 = clusters == "02.- ConIrregularidadNoHurto"
pot_cat[~mask_c2] = rng.choice(pot_keys, size=(~mask_c2).sum(), p=POTENCIA_PROBS)
pot_cat[mask_c2] = rng.choice(pot_keys, size=mask_c2.sum(), p=POTENCIA_PROBS_02)
# Mapear a rango
cat_to_low = {k: POTENCIA_DIST[k][0] for k in pot_keys}
cat_to_high = {k: POTENCIA_DIST[k][1] for k in pot_keys}
low_arr = np.array([cat_to_low[k] for k in pot_cat])
high_arr = np.array([cat_to_high[k] for k in pot_cat])
potencia = low_arr + rng.random(N_TRAIN) * (high_arr - low_arr)
potencia = np.round(potencia, 2)

# Atributos categoricos
distrito = rng.choice(distritos, size=N_TRAIN)
set_ = rng.choice(sets, size=N_TRAIN)
ali = set_to_ali[np.searchsorted(sets, set_)]
# Mapear set_idx a partir de sets
set_idx_lookup = {s: i for i, s in enumerate(sets)}
set_indices = np.array([set_idx_lookup[s] for s in set_])
ali = set_to_ali[set_indices]
# sed: por alimentador
sed_per_ali = {a: [] for a in alimentadores}
for i, s in enumerate(seds):
    sed_per_ali[sed_to_ali[i]].append(s)
sed_arr = np.empty(N_TRAIN, dtype=object)
ali_to_choices = {a: sed_per_ali[a] for a in alimentadores if len(sed_per_ali[a]) > 0}
for i, a in enumerate(ali):
    if a in ali_to_choices:
        sed_arr[i] = rng.choice(ali_to_choices[a])
    else:
        sed_arr[i] = rng.choice(seds)
# llave: por sed
sed_idx_lookup = {s: i for i, s in enumerate(seds)}
llave = np.empty(N_TRAIN, dtype=object)
for i, s in enumerate(sed_arr):
    llave[i] = rng.choice(llaves_por_sed[s])
marca = rng.choice(marcas, size=N_TRAIN)
fase = rng.choice(["M", "T"], size=N_TRAIN, p=[0.85, 0.15])
tipo_acomet = rng.choice(["S", "A", "I"], size=N_TRAIN, p=[0.45, 0.50, 0.05])

# Distancias y geolocalizacion
a_sed = rng.uniform(5, 200, size=N_TRAIN)
a_set = rng.uniform(50, 1500, size=N_TRAIN)
a_sed_set = a_set - a_sed + rng.normal(0, 5, size=N_TRAIN)
distancia_sed = np.round(rng.uniform(0, 30, size=N_TRAIN) + a_sed * 0.01, 2)
distancia_set = np.round(rng.uniform(0, 100, size=N_TRAIN) + a_set * 0.01, 2)
distancia_sed_set = np.round(np.abs(distancia_set - distancia_sed), 2)

# Posicion geografica: asignar lon/lat en funcion del sed
sed_lon_lookup = {s: sed_lon[i] for i, s in enumerate(seds)}
sed_lat_lookup = {s: sed_lat[i] for i, s in enumerate(seds)}
longitud_sed = np.array([sed_lon_lookup[s] for s in sed_arr])
latitud_sed = np.array([sed_lat_lookup[s] for s in sed_arr])
longitud = np.round(longitud_sed + rng.normal(0, 0.003, size=N_TRAIN), 6)
latitud = np.round(latitud_sed + rng.normal(0, 0.003, size=N_TRAIN), 6)
longitud_set = np.array([set_lon[set_idx_lookup[s]] for s in set_])
latitud_set = np.round(longitud_set + rng.normal(0, 0.005, size=N_TRAIN), 6)

flg_dam = (rng.random(N_TRAIN) < 0.04).astype(int)
flg_sed_peli = (rng.random(N_TRAIN) < 0.10).astype(int)
tiempo_ult_cambio_med = rng.integers(180, 365 * 25, size=N_TRAIN)
tipo_acomet_S = (tipo_acomet == "S").astype(int)
tipo_fase_M = (fase == "M").astype(int)

# ---- target e historial segun cluster (vectorizado por mascara) ----
# Inicializar
target = np.zeros(N_TRAIN, dtype=int)
nro_inspecciones = np.zeros(N_TRAIN, dtype=int)
notificaciones = np.zeros(N_TRAIN, dtype=int)
notif_causal1 = np.zeros(N_TRAIN, dtype=int)
notif_causal2 = np.zeros(N_TRAIN, dtype=int)
notif_causal3 = np.zeros(N_TRAIN, dtype=int)
notif_causal4 = np.zeros(N_TRAIN, dtype=int)
notif_causal5 = np.zeros(N_TRAIN, dtype=int)
recupero = np.zeros(N_TRAIN, dtype=int)
insp_efectivas = np.zeros(N_TRAIN, dtype=int)
insp_pendientes = np.zeros(N_TRAIN, dtype=int)
insp_zona_peligrosa = np.zeros(N_TRAIN, dtype=int)
insp_sospecha_hurto = np.zeros(N_TRAIN, dtype=int)
insp_impedidas = np.zeros(N_TRAIN, dtype=int)
dist_ult_insp_efect = np.full(N_TRAIN, -1, dtype=int)
dist_ult_notif = np.full(N_TRAIN, -1, dtype=int)
dist_ult_causal4 = np.full(N_TRAIN, -1, dtype=int)
periodos_insp = np.zeros(N_TRAIN, dtype=int)

for cl, base in CLUSTER_BASE_RATE.items():
    m = clusters == cl
    n_m = m.sum()
    if n_m == 0:
        continue
    # Target
    p = np.clip(base + rng.normal(0, 0.04, size=n_m), 0.01, 0.95)
    target[m] = (rng.random(n_m) < p).astype(int)

    if cl == "01.- ConHurtoPrevio":
        nro_inspecciones[m] = rng.integers(1, 8, size=n_m)
        notificaciones[m] = rng.integers(1, 5, size=n_m)
        notif_causal4[m] = notificaciones[m]
        recupero[m] = rng.integers(100_000, 3_000_000, size=n_m)
        insp_efectivas[m] = rng.integers(1, 6, size=n_m)
        insp_pendientes[m] = rng.integers(0, 3, size=n_m)
        insp_zona_peligrosa[m] = rng.integers(0, 4, size=n_m)
        insp_sospecha_hurto[m] = rng.integers(0, 3, size=n_m)
        insp_impedidas[m] = rng.integers(0, 2, size=n_m)
        dist_ult_insp_efect[m] = rng.integers(30, 600, size=n_m)
        dist_ult_notif[m] = rng.integers(30, 600, size=n_m)
        dist_ult_causal4[m] = rng.integers(30, 600, size=n_m)
    elif cl == "02.- ConIrregularidadNoHurto":
        nro_inspecciones[m] = rng.integers(1, 4, size=n_m)
        notificaciones[m] = rng.integers(0, 3, size=n_m)
        notif_causal1[m] = (notificaciones[m] * rng.random(n_m) * 0.4).astype(int)
        notif_causal2[m] = (notificaciones[m] * rng.random(n_m) * 0.3).astype(int)
        notif_causal3[m] = (notificaciones[m] * rng.random(n_m) * 0.2).astype(int)
        notif_causal4[m] = 0
        notif_causal5[m] = np.maximum(0, notificaciones[m] - notif_causal1[m] - notif_causal2[m] - notif_causal3[m])
        insp_efectivas[m] = rng.integers(0, 3, size=n_m)
        insp_pendientes[m] = rng.integers(0, 2, size=n_m)
        insp_zona_peligrosa[m] = rng.integers(0, 2, size=n_m)
        insp_impedidas[m] = rng.integers(0, 2, size=n_m)
        dist_ult_insp_efect[m] = rng.integers(60, 900, size=n_m)
        dist_ult_notif[m] = rng.integers(60, 900, size=n_m)
    elif cl == "03.- ConInspeccionesSinIrregularidad":
        nro_inspecciones[m] = rng.integers(1, 3, size=n_m)
        insp_efectivas[m] = rng.integers(1, 3, size=n_m)
        dist_ult_insp_efect[m] = rng.integers(90, 1200, size=n_m)
    # 04 sin inspecciones: todo queda en 0/-1

periodos_insp = nro_inspecciones.copy()

# Valores en $ por causal
notif_causal1_val = notif_causal1 * rng.integers(50_000, 500_000, size=N_TRAIN)
notif_causal2_val = notif_causal2 * rng.integers(50_000, 500_000, size=N_TRAIN)
notif_causal3_val = notif_causal3 * rng.integers(50_000, 500_000, size=N_TRAIN)
notif_causal4_val = notif_causal4 * rng.integers(100_000, 2_000_000, size=N_TRAIN)
notif_causal5_val = notif_causal5 * rng.integers(50_000, 500_000, size=N_TRAIN)
recup_causal1 = (notif_causal1_val * rng.uniform(0.3, 0.9, size=N_TRAIN)).astype(int)
recup_causal2 = (notif_causal2_val * rng.uniform(0.3, 0.9, size=N_TRAIN)).astype(int)
recup_causal3 = (notif_causal3_val * rng.uniform(0.3, 0.9, size=N_TRAIN)).astype(int)
recup_causal4 = (notif_causal4_val * rng.uniform(0.4, 0.95, size=N_TRAIN)).astype(int)
recup_causal5 = (notif_causal5_val * rng.uniform(0.3, 0.9, size=N_TRAIN)).astype(int)

# Codigo y descripcion de irregularidad
cod_irreg = np.where(target == 1, rng.choice([1, 2, 3, 4, 5], size=N_TRAIN), 0)
desc_irreg = np.where(target == 1, "Irregular", "OK")

# Otros campos
tarifa = rng.choice(["BT1", "BT2", "BT3", "AT1"], size=N_TRAIN)
tipo_cliente = rng.choice(["Residencial", "Comercial", "Industrial"], size=N_TRAIN, p=[0.75, 0.20, 0.05])
estado_serv = rng.choice(["Activo", "Suspendido"], size=N_TRAIN, p=[0.95, 0.05])
factor = rng.choice([1, 10, 20, 40, 60, 120], size=N_TRAIN)
sector = rng.choice(sectores, size=N_TRAIN)
zona = rng.choice(zonas, size=N_TRAIN)
zonaf = np.array([f"zona 0{rng.integers(1, 5)}" for _ in range(N_TRAIN)])
# Filtro <> 'zona 05': nunca cae alli porque solo generamos 1..4
# Pero el filtro en el original es una exclusion: lo replicamos
keep_mask = (zonaf != "zona 05")
n_keep = keep_mask.sum()
print(f"  Filtro zona 05: {N_TRAIN:,} -> {n_keep:,} filas")

# nro_inspeccion
nro_inspeccion = np.where(nro_inspecciones > 0, rng.integers(1, 100_000, size=N_TRAIN), -1)

# Construir DataFrame
df = pd.DataFrame({
    "periodo": periodo[keep_mask],
    "cuenta": [f"CT{i+1:08d}" for i in range(n_keep)],
    "nro_inspeccion": nro_inspeccion[keep_mask],
    "fecha_instalacion": pd.to_datetime(periodo[keep_mask].astype(str), format="%Y%m") - pd.to_timedelta(tiempo_ult_cambio_med[keep_mask], unit="D"),
    "target": target[keep_mask],
    "cod_irreg": cod_irreg[keep_mask],
    "desc_irreg": desc_irreg[keep_mask],
    "recupero": recupero[keep_mask],
    "cod_distrito": distrito[keep_mask],
    "sector": sector[keep_mask],
    "zona": zona[keep_mask],
    "potencia": potencia[keep_mask],
    "tarifa": tarifa[keep_mask],
    "tipo_cliente": tipo_cliente[keep_mask],
    "tipo_acomet": tipo_acomet[keep_mask],
    "estado_serv": estado_serv[keep_mask],
    "marca": marca[keep_mask],
    "fase": fase[keep_mask],
    "factor": factor[keep_mask],
    "set": set_[keep_mask],
    "alimentador": ali[keep_mask],
    "sed": sed_arr[keep_mask],
    "llave": llave[keep_mask],
    "zonaf": zonaf[keep_mask],
    "longitud": longitud[keep_mask],
    "latitud": latitud[keep_mask],
    "longitud_sed": longitud_sed[keep_mask],
    "latitud_sed": latitud_sed[keep_mask],
    "longitud_set": longitud_set[keep_mask],
    "latitud_set": latitud_set[keep_mask],
    "flg_dam": flg_dam[keep_mask],
    "flg_sed_peli": flg_sed_peli[keep_mask],
    "a_sed": a_sed[keep_mask],
    "a_set": a_set[keep_mask],
    "a_sed_set": a_sed_set[keep_mask],
    "distancia_sed": distancia_sed[keep_mask],
    "distancia_set": distancia_set[keep_mask],
    "distancia_sed_set": distancia_sed_set[keep_mask],
    "tipo_acomet_S": tipo_acomet_S[keep_mask],
    "tipo_fase_M": tipo_fase_M[keep_mask],
    "tiempo_ult_cambio_med": tiempo_ult_cambio_med[keep_mask],
    "nro_inspecciones": nro_inspecciones[keep_mask],
    "periodos_insp": periodos_insp[keep_mask],
    "notificaciones": notificaciones[keep_mask],
    "notif_causal1": notif_causal1[keep_mask],
    "notif_causal2": notif_causal2[keep_mask],
    "notif_causal3": notif_causal3[keep_mask],
    "notif_causal4": notif_causal4[keep_mask],
    "notif_causal5": notif_causal5[keep_mask],
    "notif_causal1_val": notif_causal1_val[keep_mask],
    "notif_causal2_val": notif_causal2_val[keep_mask],
    "notif_causal3_val": notif_causal3_val[keep_mask],
    "notif_causal4_val": notif_causal4_val[keep_mask],
    "notif_causal5_val": notif_causal5_val[keep_mask],
    "recup_causal1": recup_causal1[keep_mask],
    "recup_causal2": recup_causal2[keep_mask],
    "recup_causal3": recup_causal3[keep_mask],
    "recup_causal4": recup_causal4[keep_mask],
    "recup_causal5": recup_causal5[keep_mask],
    "insp_efectivas": insp_efectivas[keep_mask],
    "insp_zona_peligrosa": insp_zona_peligrosa[keep_mask],
    "insp_sospecha_hurto": insp_sospecha_hurto[keep_mask],
    "insp_pendientes": insp_pendientes[keep_mask],
    "insp_impedidas": insp_impedidas[keep_mask],
    "dist_ult_insp_efect": dist_ult_insp_efect[keep_mask],
    "dist_ult_notif": dist_ult_notif[keep_mask],
    "dist_ult_causal4": dist_ult_causal4[keep_mask],
    "cluster": clusters[keep_mask],
})

# Cruzar con maestros para obtener id_*
df = df.merge(maestro_ali_sector_zona[["alimentador", "sector", "zona", "id_ali_sector_zona"]], on=["alimentador", "sector", "zona"], how="left")
for cat, col_merge in [("set", "id_set"), ("alimentador", "id_alimentador"),
                       ("sed", "id_sed"), ("llave", "id_llave"), ("marca", "id_marca")]:
    m = pd.read_csv(SYNTH_DIR / "maestros" / f"maestro_{cat}.csv")
    df = df.merge(m, on=cat, how="left").rename(columns={f"id_{cat}": col_merge})
# Distrito: usar cod_distrito -> id_distrito
m = pd.read_csv(SYNTH_DIR / "maestros" / "maestro_distrito.csv")
df = df.merge(m.rename(columns={"distrito": "cod_distrito", "id_distrito": "id_distrito"}),
              on="cod_distrito", how="left")

print(f"  training_dataset: {len(df):,} filas")
_save(df, "training_dataset.csv")

# ---------------------------------------------------------------------------
# 3. Tablas auxiliares (variables de nivel e insp_hist)
# ---------------------------------------------------------------------------

print("\n[3/4] Generando tablas auxiliares ...")

insp_hist = df.loc[df["nro_inspecciones"] > 0,
                   ["periodo", "cuenta", "nro_inspecciones", "periodos_insp",
                    "notificaciones", "notif_causal1", "notif_causal2", "notif_causal3",
                    "notif_causal4", "notif_causal5", "notif_causal1_val",
                    "notif_causal2_val", "notif_causal3_val", "notif_causal4_val",
                    "notif_causal5_val", "recup_causal1", "recup_causal2", "recup_causal3",
                    "recup_causal4", "recup_causal5", "insp_efectivas",
                    "insp_zona_peligrosa", "insp_sospecha_hurto", "insp_pendientes",
                    "insp_impedidas", "dist_ult_insp_efect", "dist_ult_notif",
                    "dist_ult_causal4", "cluster"]].copy()
_save(insp_hist, "variables_insp_hist.csv")


def nivel_agregado(df, nivel_col, sufijo, nro_cuentas_col="nro_cuentas_insp"):
    g = df.groupby(["periodo", nivel_col]).agg(
        nro_inspecciones=("nro_inspecciones", "sum"),
        nro_notificaciones=("notificaciones", "sum"),
        nro_notif_causal4=("notif_causal4", "sum"),
        nro_notif_causal4_val=("notif_causal4_val", "sum"),
        nro_cuentas_insp=("nro_inspecciones", lambda x: (x > 0).sum()),
        nro_cuentas_notif_causal4=("notif_causal4", lambda x: (x > 0).sum()),
        recupero=("recupero", "sum"),
        recupero_causal4=("recup_causal4", "sum"),
        **{f"sums_{sufijo}": ("cuenta", "count")},
        dist_ult_insp=("dist_ult_insp_efect", "max"),
    ).reset_index()
    return g


for nivel, suf in [("sed", "sed"), ("set", "set"), ("llave", "llave"),
                   ("marca", "marca"), ("cod_distrito", "distrito")]:
    n = nivel_agregado(df, nivel, suf)
    _save(n, f"variables_nivel_{suf}.csv")

# SET x alimentador
nivel_set_alim = df.groupby(["periodo", "set", "alimentador"]).agg(
    nro_inspecciones=("nro_inspecciones", "sum"),
    nro_notificaciones=("notificaciones", "sum"),
    nro_notif_causal4=("notif_causal4", "sum"),
    nro_notif_causal4_val=("notif_causal4_val", "sum"),
    nro_cuentas_insp=("nro_inspecciones", lambda x: (x > 0).sum()),
    nro_cuentas_notif_causal4=("notif_causal4", lambda x: (x > 0).sum()),
    recupero=("recupero", "sum"),
    recupero_causal4=("recup_causal4", "sum"),
    sums_set_alimentador=("cuenta", "count"),
    dist_ult_insp=("dist_ult_insp_efect", "max"),
).reset_index()
_save(nivel_set_alim, "variables_nivel_set_alimentador.csv")

# Maestro counts
counts = df.groupby(["periodo", "marca", "cod_distrito",
                     "alimentador", "sector", "zona", "set", "sed", "llave"]).size().reset_index(name="sums")
counts.to_csv(SYNTH_DIR / "maestro_counts_met_vars.csv", index=False)
print(f"  maestro_counts_met_vars.csv               {len(counts):>10,} filas")

# Llaves por SED
llaves_por_sed_out = df.groupby(["periodo", "sed"])["llave"].nunique().reset_index(name="nro_llaves")
llaves_por_sed_out.to_csv(SYNTH_DIR / "llaves_por_sed.csv", index=False)
print(f"  llaves_por_sed.csv                        {len(llaves_por_sed_out):>10,} filas")

# ---------------------------------------------------------------------------
# 4. Variables de consumo (con/sin historial de notificacion)
# ---------------------------------------------------------------------------

print("\n[4/4] Generando variables de consumo ...")

# IMPORTANTE: en el pipeline original, vars_con_notif y vars_sin_notif se separan por
# historial de NOTIFICACIONES (no de inspecciones). Clusters 01+02 tienen
# notificaciones; clusters 03+04 NO tienen notificaciones (cluster 03 = inspecciones
# sin irregularidad, cluster 04 = sin inspecciones).
con_mask = df["cluster"].isin(["01.- ConHurtoPrevio", "02.- ConIrregularidadNoHurto"])
con = df.loc[con_mask].copy().reset_index(drop=True)
sin = df.loc[~con_mask].copy().reset_index(drop=True)


def vars_consumo(base, with_history):
    n = len(base)
    out = base[["periodo", "cuenta", "target", "potencia"]].copy()
    for c in ["casos_med_interno", "casos_no_medidor", "casos_no_medidor_viv",
              "casos_medidor_noubic", "casos_medidor_defec", "casos_medidor_cambiado",
              "casos_medidor_manip", "casos_conex_indeb"]:
        out[c] = rng.integers(0, 3 if with_history else 2, size=n)
    # Consumo
    if with_history:
        out["pro_cons_6m"] = base["potencia"].values * 80 + rng.normal(0, 30, size=n)
        out["pro_cons_12m"] = out["pro_cons_6m"] + rng.normal(0, 20, size=n)
        out["pro_cons_24m"] = out["pro_cons_12m"] + rng.normal(0, 30, size=n)
        out["std_cons_6m"] = out["pro_cons_6m"] * 0.15 + rng.uniform(0, 10, size=n)
        out["std_cons_12m"] = out["pro_cons_12m"] * 0.15 + rng.uniform(0, 15, size=n)
        out["std_cons_24m"] = out["pro_cons_24m"] * 0.15 + rng.uniform(0, 20, size=n)
        out["meses_ult_normalizacion"] = rng.integers(0, 36, size=n)
        out["diff_normal_notif"] = rng.integers(0, 12, size=n)
    else:
        out["pro_cons_6m"] = base["potencia"].values * 60 + rng.normal(0, 25, size=n)
        out["pro_cons_12m"] = out["pro_cons_6m"] + rng.normal(0, 15, size=n)
        out["pro_cons_24m"] = out["pro_cons_12m"] + rng.normal(0, 25, size=n)
        out["std_cons_6m"] = out["pro_cons_6m"] * 0.20 + rng.uniform(0, 8, size=n)
        out["std_cons_12m"] = out["pro_cons_12m"] * 0.20 + rng.uniform(0, 12, size=n)
        out["std_cons_24m"] = out["pro_cons_24m"] * 0.20 + rng.uniform(0, 18, size=n)
        # Trimestrales
        out["q01_promedio_ant"] = out["pro_cons_24m"] / 4 + rng.normal(0, 10, size=n)
        out["q01_promedio_post"] = out["pro_cons_12m"] / 4 + rng.normal(0, 10, size=n)
        out["q02_promedio_ant"] = out["q01_promedio_ant"] + rng.normal(0, 5, size=n)
        out["q02_promedio_post"] = out["q01_promedio_post"] + rng.normal(0, 5, size=n)
        out["q03_promedio_ant"] = out["q02_promedio_ant"] + rng.normal(0, 5, size=n)
        out["q03_promedio_post"] = out["q02_promedio_post"] + rng.normal(0, 5, size=n)
    out["casos_fact_U"] = rng.integers(0, 3, size=n)
    out["casos_fact_T"] = rng.integers(0, 2, size=n)
    out["cons_pro_fact_U"] = out["casos_fact_U"] * 200 + rng.uniform(0, 100, size=n)
    out["cons_pro_fact_T"] = out["casos_fact_T"] * 150 + rng.uniform(0, 100, size=n)
    out["dist_fact_U"] = rng.integers(0, 12, size=n)
    out["consumos_0"] = rng.integers(0, 4, size=n)
    out["consumos_dimi"] = rng.integers(0, 2, size=n)
    out["dist_pri_lectura"] = rng.integers(6, 24, size=n)  # >=6 para pasar el filtro de cluster 03/04
    out["num_lecturas_N"] = rng.integers(0, 6, size=n)
    out["pearson_notif"] = rng.uniform(-0.5, 0.9, size=n)
    return out


vars_con = vars_consumo(con, True)
vars_sin = vars_consumo(sin, False)
_save(vars_con, "variables_consumo_con_notif.csv")
_save(vars_sin, "variables_consumo_sin_notif.csv")

print("\n[OK] Datos sinteticos generados en:", SYNTH_DIR)
total_mb = sum(f.stat().st_size for f in SYNTH_DIR.rglob("*.csv")) / 1e6
print(f"    Peso total: {total_mb:.1f} MB")

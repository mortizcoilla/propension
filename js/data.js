/**
 * js/data.js
 * Datos embebidos para el dashboard HTML del modelo de propension.
 * Generado por scripts/build_data.py desde data/processed/metrics.json.
 */
(function () {
  'use strict';
  window.MP = {
  "metadata": {
    "fecha": "2026-07-29T21:45:28.415937+00:00",
    "split_train_end": 202010,
    "split_test": 202011,
    "modelo": "LGBMClassifier",
    "version": "1.0.0-synthetic"
  },
  "segments": {
    "01.- ConHurtoPrevio": {
      "n": 13445,
      "target_rate": 0.5579769431015247
    },
    "02.- ConIrregularidadNoHurto": {
      "n": 16123,
      "target_rate": 0.17862680642560316
    },
    "03.- ConInspeccionesSinIrregularidad": {
      "n": 54259,
      "target_rate": 0.08230892570817744
    },
    "04.- SinInspecciones": {
      "n": 186173,
      "target_rate": 0.03794857471276716
    }
  },
  "results": {
    "01.- ConHurtoPrevio": {
      "n_train": 9862,
      "n_test": 2466,
      "n_deploy": 549,
      "scale_pos_weight": 0.7901615538210202,
      "auc_train": 0.5938973491031967,
      "auc_test": 0.4866870327357553,
      "auc_deploy": 0.489124597207304,
      "n_features": 10
    },
    "02.- ConIrregularidadNoHurto": {
      "n_train": 11823,
      "n_test": 2956,
      "n_deploy": 672,
      "scale_pos_weight": 4.619296577946768,
      "auc_train": 0.5,
      "auc_test": 0.5,
      "auc_deploy": 0.5,
      "n_features": 5
    },
    "03.- ConInspeccionesSinIrregularidad": {
      "n_train": 39780,
      "n_test": 9946,
      "n_deploy": 2294,
      "scale_pos_weight": 11.098540145985401,
      "auc_train": 0.5857018739967137,
      "auc_test": 0.49882005533919793,
      "auc_deploy": 0.5032814489623562,
      "n_features": 8
    },
    "04.- SinInspecciones": {
      "n_train": 136636,
      "n_test": 34159,
      "n_deploy": 7646,
      "scale_pos_weight": 25.286263947672182,
      "auc_train": 0.725317870930428,
      "auc_test": 0.503070742824235,
      "auc_deploy": 0.4892766400542432,
      "n_features": 14
    }
  },
  "precision_at_k": {
    "01.- ConHurtoPrevio": {
      "base_rate": 0.5537340619307832,
      "precision_at_10pct": 0.6111111111111112,
      "lift": 1.1036184210526316,
      "n_deploy": 549
    },
    "02.- ConIrregularidadNoHurto": {
      "base_rate": 0.17708333333333334,
      "precision_at_10pct": 0.22388059701492538,
      "lift": 1.2642669007901668,
      "n_deploy": 672
    },
    "03.- ConInspeccionesSinIrregularidad": {
      "base_rate": 0.07890148212728858,
      "precision_at_10pct": 0.09170305676855896,
      "lift": 1.162247581365051,
      "n_deploy": 2294
    },
    "04.- SinInspecciones": {
      "base_rate": 0.03818990321736856,
      "precision_at_10pct": 0.041884816753926704,
      "lift": 1.0967510578785054,
      "n_deploy": 7646
    }
  },
  "feature_importance": {
    "01.- ConHurtoPrevio": [
      {
        "feature": "id_distrito",
        "importance": 110.72913599573076
      },
      {
        "feature": "pro_cons_12m",
        "importance": 61.91490324633196
      },
      {
        "feature": "diff_cons_6m_12m",
        "importance": 57.8915834298823
      },
      {
        "feature": "id_marca",
        "importance": 51.14518649876118
      },
      {
        "feature": "efectividad_marca",
        "importance": 47.76653571479983
      },
      {
        "feature": "recup_prom_marca",
        "importance": 47.63360297244435
      },
      {
        "feature": "pro_cons_6m",
        "importance": 40.24560761710018
      },
      {
        "feature": "casos_medidor_cambiado",
        "importance": 7.54840786755085
      },
      {
        "feature": "notificaciones",
        "importance": 4.027933459961787
      },
      {
        "feature": "consumos_dimi",
        "importance": 1.636508047580719
      }
    ],
    "02.- ConIrregularidadNoHurto": [
      {
        "feature": "tipo_fase_M",
        "importance": 0.0
      },
      {
        "feature": "notif_causal1",
        "importance": 0.0
      },
      {
        "feature": "diff_cons_6m_12m",
        "importance": 0.0
      },
      {
        "feature": "efectividad_marca",
        "importance": 0.0
      },
      {
        "feature": "potencia",
        "importance": 0.0
      }
    ],
    "03.- ConInspeccionesSinIrregularidad": [
      {
        "feature": "ratio_cons_potencia_12m",
        "importance": 13198.615095973015
      },
      {
        "feature": "potencia",
        "importance": 10033.548352517188
      },
      {
        "feature": "dist_ult_insp_efect",
        "importance": 9092.285708323121
      },
      {
        "feature": "std_cons_6m",
        "importance": 6962.64123237133
      },
      {
        "feature": "casos_fact_U",
        "importance": 748.6887805461884
      },
      {
        "feature": "tipo_fase_M",
        "importance": 360.25019359588623
      },
      {
        "feature": "insp_efectivas",
        "importance": 121.28845024108887
      },
      {
        "feature": "insp_pendientes",
        "importance": 0.0
      }
    ],
    "04.- SinInspecciones": [
      {
        "feature": "min_diff",
        "importance": 17520.410472631454
      },
      {
        "feature": "diff_cons_6m_12m",
        "importance": 16285.50586605072
      },
      {
        "feature": "cv_cons_12m",
        "importance": 16140.246865272522
      },
      {
        "feature": "sums_distrito",
        "importance": 14152.55467748642
      },
      {
        "feature": "longitud",
        "importance": 13868.185758590698
      },
      {
        "feature": "potencia",
        "importance": 12740.8944606781
      },
      {
        "feature": "sums_marca",
        "importance": 12729.728027582169
      },
      {
        "feature": "std_cons_6m",
        "importance": 9211.018022298813
      },
      {
        "feature": "pro_cons_6m",
        "importance": 6793.325246334076
      },
      {
        "feature": "dist_pri_lectura",
        "importance": 5876.94028377533
      },
      {
        "feature": "consumos_0",
        "importance": 2071.114149093628
      },
      {
        "feature": "casos_medidor_manip",
        "importance": 1174.09059715271
      },
      {
        "feature": "consumos_dimi",
        "importance": 1090.4653034210205
      },
      {
        "feature": "tipo_fase_M",
        "importance": 468.09718322753906
      }
    ]
  },
  "hiperparametros": {
    "01.- ConHurtoPrevio": {
      "n_estimators": 300,
      "learning_rate": 0.075,
      "subsample": 0.8,
      "colsample_bytree": 0.9,
      "reg_alpha": 15.0,
      "reg_lambda": 20.0,
      "max_depth": 3,
      "min_child_samples": 50,
      "num_leaves": 30
    },
    "02.- ConIrregularidadNoHurto": {
      "n_estimators": 300,
      "learning_rate": 0.01,
      "subsample": 0.85,
      "colsample_bytree": 0.9,
      "reg_alpha": 9.0,
      "reg_lambda": 5.0,
      "max_depth": 3,
      "min_child_samples": 50,
      "num_leaves": 30
    },
    "03.- ConInspeccionesSinIrregularidad": {
      "n_estimators": 400,
      "learning_rate": 0.01,
      "subsample": 0.85,
      "colsample_bytree": 0.9,
      "reg_alpha": 4.0,
      "reg_lambda": 5.0,
      "max_depth": 3,
      "min_child_samples": 50,
      "num_leaves": 30
    },
    "04.- SinInspecciones": {
      "n_estimators": 400,
      "learning_rate": 0.09,
      "subsample": 0.85,
      "colsample_bytree": 0.9,
      "reg_alpha": 4.0,
      "reg_lambda": 5.0,
      "max_depth": 3,
      "min_child_samples": 50,
      "num_leaves": 30
    }
  },
  "groups": {
    "Geografia": [
      "longitud",
      "latitud",
      "distancia_sed",
      "distancia_set",
      "distancia_sed_set"
    ],
    "Categoria red": [
      "id_set",
      "id_alimentador",
      "id_sed",
      "id_llave",
      "id_marca",
      "id_ali_sector_zona",
      "id_distrito"
    ],
    "Cliente": [
      "tipo_fase_M",
      "tipo_acomet_S",
      "potencia",
      "tiempo_ult_cambio_med"
    ],
    "Inspeccion": [
      "insp_efectivas",
      "insp_pendientes",
      "notificaciones",
      "notif_causal1",
      "notif_causal4",
      "casos_medidor_cambiado",
      "casos_medidor_manip"
    ],
    "Contexto red": [
      "efectividad_marca",
      "insp_por_cuenta_marca",
      "nro_notif_causal4_sed",
      "efectividad_distrito",
      "perc_recup_causal4_marca",
      "recup_prom_causal4_marca"
    ],
    "Consumo": [
      "pro_cons_6m",
      "pro_cons_12m",
      "std_cons_6m",
      "ratio_cons_potencia_12m",
      "diff_cons_6m_12m",
      "min_diff",
      "consumos_0",
      "consumos_dimi"
    ]
  },
  "group_contribution": {
    "groups": [
      "Geografia",
      "Categoria red",
      "Cliente",
      "Inspeccion",
      "Contexto red",
      "Consumo"
    ],
    "clusters": [
      {
        "id": "01",
        "name": "01.- ConHurtoPrevio"
      },
      {
        "id": "02",
        "name": "02.- ConIrregularidadNoHurto"
      },
      {
        "id": "03",
        "name": "03.- ConInspeccionesSinIrregularidad"
      },
      {
        "id": "04",
        "name": "04.- SinInspecciones"
      }
    ],
    "matrix": [
      [
        0.0,
        37.6,
        0.0,
        2.7,
        11.1,
        37.6
      ],
      [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
      ],
      [
        0.0,
        0.0,
        25.7,
        0.3,
        0.0,
        49.8
      ],
      [
        10.7,
        0.0,
        10.2,
        0.9,
        0.0,
        40.7
      ]
    ]
  }
};
})();

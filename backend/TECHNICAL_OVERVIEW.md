# AGROIA SMART PLANNER — Technical Overview
**Version:** 1.0 — Motor GDD v2  
**Fecha:** 2026-02-20  
**Estado:** Demo-ready · SQLite (dev) / PostgreSQL (prod)

---

## 1. Arquitectura

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py        ← Pydantic-Settings (lee .env)
│   │   ├── database.py      ← SQLAlchemy Engine (SQLite/PostgreSQL auto-detect)
│   │   └── security.py      ← JWT + bcrypt centralizado
│   ├── models/              ← ORM SQLAlchemy (6 tablas)
│   ├── schemas/             ← Pydantic v2 (request/response validation)
│   ├── services/
│   │   ├── gdd_service.py       ← Motor puro (sin BD) — 4 fases
│   │   ├── clima_service.py     ← Cache BD + Open-Meteo API
│   │   └── prediccion_service.py← Orquestador
│   ├── routes/              ← FastAPI routers
│   └── main.py              ← CORS, lifespan, registro de routers
├── alembic/                 ← Migraciones versionadas
├── .env                     ← Variables de entorno (NO en git)
└── requirements.txt
```

**Separación de responsabilidades:**
- `routes/` solo orquestan HTTP → service
- `services/` contienen lógica de negocio, nunca lógica HTTP
- `gdd_service.py` es 100% puro (sin DB ni HTTP) → testeable y reemplazable por ML

---

## 2. Base de Datos (6 tablas)

| Tabla | Propósito |
|-------|-----------|
| `users` | Autenticación JWT bcrypt |
| `parcelas` | Campos agrícolas (lat/lon/altitud) |
| `cultivos` | Catálogo botánico (Tbase, umbrales GDD) |
| `siembras` | Evento de siembra (parcela + cultivo + fecha) |
| `clima_diario` | Caché local de datos Open-Meteo |
| `predicciones` | Resultados del motor GDD (versionados) |

**Índices críticos:**
- `clima_diario(parcela_id, fecha)` — UNIQUE (evita duplicados)
- `predicciones(siembra_id)` — ONE-TO-ONE con siembra

---

## 3. Motor GDD — 4 Fases Fenológicas

```
GDD_diario = max(((Tmax + Tmin) / 2) - Tbase, 0)
GDD_acumulado = Σ GDD_diario(fecha_siembra → hoy)
```

| Fase | Condición | Descripción |
|------|-----------|-------------|
| **Emergencia** | GDD < 10% de umbral_floración | Germinación y brote inicial |
| **Vegetativo** | 10% ≤ GDD < umbral_floración | Crecimiento de hojas y tallos |
| **Floración** | umbral_floración ≤ GDD < umbral_madurez | Floración activa |
| **Madurez** | GDD ≥ umbral_madurez | Fruto maduro, listo para cosecha |

**Ejemplo — Cultivo Papa (Tbase=7°C):**
```
umbral_emergencia = 600 × 0.10 = 60 GDD
umbral_floracion  = 600 GDD
umbral_madurez    = 1400 GDD
```

---

## 4. Datos Climáticos — Estrategia de Caché

```
Cliente → GET /prediccion/{id}
              ↓
         clima_service
              ├── ¿días en tabla clima_diario? ──YES──→ usa BD (fuente: "cache")
              └──────────────────────────────── NO ───→ consulta Open-Meteo
                                                         guarda en BD
                                                         (fuente: "open-meteo")
```

**Respuesta con trazabilidad:**
```json
"datos_clima": {
  "total_dias": 81,
  "dias_desde_cache": 81,
  "dias_desde_api": 0,
  "fuente_primaria": "cache"
}
```

---

## 5. Seguridad

- **Hashing:** bcrypt via passlib (factor de trabajo adaptivo)
- **JWT:** HS256, firmado con `SECRET_KEY`, exp configurable
- **Endpoint protegido:** `GET /users/me` requiere `Authorization: Bearer <token>`
- **CORS:** habilitado para `localhost:5173` (Vite dev) y `localhost:3000`

---

## 6. Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ❌ | Root — status online |
| GET | `/health` | ❌ | Health check (Render/Railway) |
| POST | `/users/register` | ❌ | Registrar usuario |
| POST | `/users/login` | ❌ | Login → token JWT |
| GET | `/users/me` | ✅ JWT | Perfil autenticado |
| GET | `/parcelas` | ❌ | Listar parcelas |
| POST | `/parcelas` | ❌ | Crear parcela |
| GET | `/cultivos` | ❌ | Listar cultivos |
| POST | `/cultivos` | ❌ | Crear cultivo |
| GET | `/siembras` | ❌ | Listar siembras |
| POST | `/registrar-siembra` | ❌ | Registrar siembra |
| GET | `/prediccion/{id}` | ❌ | Predicción GDD completa |

> **Nota para demo:** Los endpoints sin JWT son intencionales para facilitar la integración frontend sin pantalla de login. Activar auth completa tras el demo.

---

## 7. Variables de Entorno

```bash
# Desarrollo local (SQLite — sin instalación)
DATABASE_URL=sqlite:///./agroia.db

# Producción (PostgreSQL en Render/Railway)
DATABASE_URL=postgresql://user:pass@host:5432/agroia_db

SECRET_KEY=<mínimo 32 caracteres aleatorios>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=development  # o "production"
CLIMA_API=open-meteo
```

---

## 8. Escalabilidad Futura

### Integración Satelital (NASA POWER / Sentinel)
```python
# clima_service.py — modular, solo cambiar el provider:
async def consultar_nasa_power(lat, lon, inicio, fin) -> List[dict]:
    ...  # misma firma que consultar_open_meteo()
```

### Modelo Híbrido ML
```python
# prediccion_service.py — campo modelo_version en BD:
modelo_version = "gdd_v2"   # actual
modelo_version = "ml_v1"    # futuro modelo calibrado con datos reales

# gdd_service.py es puro → fácil de comparar con predicciones ML:
gdd_pred = gdd_service.calcular_gdd_acumulado(datos, tbase)
ml_pred  = ml_service.predecir(features)  # reemplaza o combina
```

### API Rate Limiting (producción)
```python
# Agregar en main.py:
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
```

"""
app/main.py
───────────
Punto de entrada de la aplicación FastAPI.

Registra:
  - Todos los routers
  - Middleware CORS para el frontend React
  - Creación de tablas al startup
  - Logging básico
  - Health check endpoint
"""
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_tables
from app.routes import users, parcelas, cultivos, siembras, predicciones, weather, monitoring

# ──────────────────────────────────────────────────────────────────
# Configuración de Logging
# ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)

logger = logging.getLogger("agroia")


# ──────────────────────────────────────────────────────────────────
# Lifecycle (startup / shutdown)
# ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Acciones al iniciar y detener el servidor."""
    logger.info("🚀 Iniciando AGROIA SMART PLANNER Backend...")
    logger.info(f"   Entorno: {settings.ENVIRONMENT}")
    logger.info(f"   DB: {settings.DATABASE_URL[:40]}...")

    # Crear tablas si no existen
    create_tables()

    yield  # ── Servidor corriendo ──

    logger.info("🛑 Deteniendo servidor...")


# ──────────────────────────────────────────────────────────────────
# Aplicación FastAPI
# ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AGROIA SMART PLANNER - API",
    description="""
## 🌱 Motor de Predicción Fenológica

Backend para gestión de parcelas agrícolas con predicción de fases
de crecimiento basada en Grados Día de Crecimiento (GDD).

### Flujo de uso:
1. `POST /users/register` → Registrar usuario
2. `POST /parcelas` → Registrar parcela con lat/lon
3. `POST /cultivos` → Registrar cultivo con Tbase y umbrales GDD
4. `POST /registrar-siembra` → Registrar fecha de siembra
5. `GET /prediccion/{siembra_id}` → Obtener predicción fenológica

### Fórmula GDD:
```
GDD_diario = max(((Tmax + Tmin) / 2) - Tbase, 0)
```

### Fuente climática:
Datos históricos de [Open-Meteo](https://open-meteo.com) (gratuita, sin API key).
    """,
    version="1.0.0",
    contact={
        "name": "AGROIA SMART PLANNER",
        "url": "https://agroia.com",
    },
    lifespan=lifespan,
)


# ──────────────────────────────────────────────────────────────────
# CORS — permite conexión desde el frontend React
# ──────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:5173",   # Vite dev server (por defecto)
    "http://localhost:3000",   # Alternativa
    "http://localhost:4173",   # Vite build preview
]

if settings.ENVIRONMENT == "production":
    # En producción, agregar dominio real
    origins.append("https://tu-dominio-en-render-o-vercel.com")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────────
# Routers
# ──────────────────────────────────────────────────────────────────
app.include_router(users.router)
app.include_router(parcelas.router)
app.include_router(cultivos.router)
app.include_router(siembras.router)
app.include_router(predicciones.router)
app.include_router(weather.router)
app.include_router(monitoring.router)


# ──────────────────────────────────────────────────────────────────
# Endpoints de sistema
# ──────────────────────────────────────────────────────────────────
@app.get("/", tags=["Sistema"])
def root():
    """Endpoint raíz — verifica que el servidor está activo."""
    return {
        "status": "online",
        "app": "AGROIA SMART PLANNER",
        "version": "1.0.0",
        "docs": "/docs",
        "entorno": settings.ENVIRONMENT,
    }


@app.get("/health", tags=["Sistema"])
def health_check():
    """Health check para Render/Railway (monitoreo automático)."""
    return {"status": "healthy"}

# AgroIA SmartPlanner

> Planificador agrícola inteligente para la región andina del Perú.
> Predice el momento óptimo de siembra y cosecha combinando datos satelitales,
> climáticos, IoT y un motor fenológico explicable basado en Grados Día de
> Crecimiento (GDD).

---

## Qué hace

Un agricultor registra su parcela (lat/lon), elige un cultivo del catálogo
(Maíz, Papa, Quinua, Trigo, Arroz, etc.) y registra la fecha de siembra. A
partir de ese momento, AgroIA:

- Calcula la **fase fenológica actual** (emergencia → vegetativo → floración → madurez).
- Estima la **fecha de cosecha** con justificación científica.
- Avisa de **ventanas óptimas de siembra** próximas (Fase 2 — en construcción).
- Sugiere acciones agronómicas con IA (Gemini 1.5 Pro o LLM local vía Ollama).
- Cachea datos climáticos de Open-Meteo para funcionar con conexión intermitente.

---

## Arquitectura — tres servicios independientes

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   Frontend React 19 + Vite + Tailwind          puerto 5173 (dev)     │
│   ──────────────────────────────────                                 │
│   src/                                                               │
│     ├── pages/         Dashboard, Siembras, Parcelas, Cultivos…      │
│     ├── components/    layout, ui, dashboard, ChatAI                 │
│     ├── context/       AuthContext (JWT)                             │
│     └── services/      cliente axios → backend FastAPI               │
│                                                                      │
└──────┬───────────────────────────────────────────────────────────────┘
       │ HTTP/JSON (axios + JWT)
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   Backend FastAPI + SQLAlchemy + Alembic       puerto 8000           │
│   ───────────────────────────────────                                │
│   backend/app/                                                       │
│     ├── core/      config, database, security (JWT + bcrypt)         │
│     ├── models/    6 tablas ORM (users, parcelas, cultivos…)         │
│     ├── schemas/   Pydantic v2                                       │
│     ├── services/  motor GDD, caché climática, IA, NDVI, IoT         │
│     └── routes/    endpoints REST                                    │
│                                                                      │
└──────┬──────────────────────┬────────────────────────────────────────┘
       │                      │
       ▼                      ▼
   PostgreSQL             Open-Meteo API (gratuita, sin key)
   (o SQLite en dev)


┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   Server Node + Express + Ollama               puerto 3002           │
│   ───────────────────────────────                                    │
│   server/                                                            │
│     ├── index.js                  /api/chat + /api/recommendation    │
│     └── services/                 ragLogic, weatherService           │
│                                                                      │
│   ⚠️  Este servicio se fusionará con el backend FastAPI en Fase 6.   │
│                                                                      │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ▼
   Ollama (llama3.2)        puerto 11434
```

---

## Inicio rápido

### Opción A — Docker Compose (recomendada)

```bash
# 1. Clonar y entrar
git clone <url-del-repo> agroia
cd agroia

# 2. Configurar variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env
cp server/.env.example server/.env   # crear si no existe (opcional)

# 3. Generar una SECRET_KEY segura y pegarla en backend/.env
openssl rand -hex 32

# 4. Levantar todo
docker compose up --build
```

Servicios disponibles tras `up`:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API docs | http://localhost:8000/docs |
| Chat IA  | http://localhost:3002/api/health |
| Postgres | localhost:5432 |

### Opción B — Manual (4 terminales)

**Requisitos:** Node 20+, Python 3.11+, PostgreSQL 14+ (o usa SQLite para dev), Ollama instalado.

```bash
# Terminal 1 — Frontend
npm install
npm run dev

# Terminal 2 — Backend FastAPI
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # editar y poner SECRET_KEY
uvicorn app.main:app --reload --port 8000

# Terminal 3 — Server Node (chat IA)
cd server
npm install
npm start

# Terminal 4 — Ollama
ollama pull llama3.2
ollama serve
```

---

## Variables de entorno

### Raíz (`.env`)
```bash
VITE_API_URL=http://localhost:8000   # URL del backend FastAPI
```

### Backend (`backend/.env`)
```bash
# Base de datos
DATABASE_URL=sqlite:///./agroia.db
# Producción:
# DATABASE_URL=postgresql://user:pass@host:5432/agroia_db

# Seguridad JWT — generar con: openssl rand -hex 32
SECRET_KEY=<reemplazar-con-64-chars-aleatorios>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

ENVIRONMENT=development
CLIMA_API=open-meteo
GEMINI_API_KEY=                  # opcional, deja vacío para usar respuestas simuladas
```

### Server Node (`server/.env`)
```bash
PORT=3002
OPENWEATHER_API_KEY=             # opcional, devuelve mock si está vacío
OLLAMA_HOST=http://localhost:11434
```

> Los archivos `.env` **nunca** se commitean. Ver [SECURITY.md](./SECURITY.md).

---

## Flujo de uso

1. `POST /users/register` — crear cuenta.
2. `POST /users/login` — obtener JWT.
3. `POST /parcelas` — registrar campo con `(nombre, latitud, longitud)`.
4. `POST /cultivos` — registrar cultivo con `(nombre, tbase, umbral_floracion, umbral_madurez)` o usar uno del catálogo.
5. `POST /registrar-siembra` — registrar evento de siembra `(parcela_id, cultivo_id, fecha)`.
6. `GET /prediccion/{siembra_id}` — obtener predicción fenológica completa.

Documentación interactiva en [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI).

---

## Motor GDD — fórmula central

```
GDD_diario   = max( ((Tmax + Tmin) / 2) - Tbase , 0 )
GDD_acumulado = Σ GDD_diario desde fecha_siembra hasta hoy
```

### Fases (4 etapas)

| Fase | Condición |
|------|-----------|
| Emergencia | GDD < 10% del umbral de floración |
| Vegetativo | 10% ≤ GDD < umbral_floracion |
| Floración  | umbral_floracion ≤ GDD < umbral_madurez |
| Madurez    | GDD ≥ umbral_madurez |

### Cultivos del catálogo

| Cultivo | Tbase (°C) | GDD Floración | GDD Madurez |
|---------|------------|---------------|-------------|
| Maíz    | 10 | 500 | 1200 |
| Trigo   | 0  | 500 | 1500 |
| Papa    | 7  | 600 | 1400 |
| Arroz   | 10 | 600 | 1200 |
| Quinua  | 3  | 400 | 900  |

> Estos umbrales son referenciales. Se calibrarán por variedad regional en
> Fase 4 con feedback de agricultores reales.

---

## Estado del producto

| Fase | Estado | Descripción |
|------|--------|-------------|
| **0 — Saneamiento** | en curso | Repo limpio, Docker, tests, CI |
| **1 — Motor cerrado** | pendiente | AgroIAScore real, RAG conectado, alertas básicas |
| **2 — Siembra óptima** | pendiente | Pronóstico 30 días + ranking diario justificado |
| **3 — Satélite real** | stubs | Sentinel-2 (NDVI) + NASA POWER + Leaflet |
| **4 — IA proactiva** | parcial | RAG con base de conocimiento + alertas push |
| **5 — IoT** | stubs | MQTT + ESP32 + sensores humedad |
| **6 — Producción** | pendiente | PWA, i18n quechua, deploy, pricing |

Ver [PLAN.md](./PLAN.md) (próximamente) para el roadmap completo.

---

## Tests

```bash
# Backend (Python)
cd backend
pytest -v

# Frontend (lint)
npm run lint
```

---

## Stack

**Frontend:** React 19, Vite (rolldown), Tailwind 3, framer-motion, lucide-react, axios.
**Backend:** FastAPI 0.110, SQLAlchemy 2, Pydantic v2, Alembic, bcrypt, python-jose, httpx, google-generativeai.
**Server LLM:** Express, Ollama (llama3.2).
**Datos externos:** Open-Meteo (clima histórico), OpenWeather (clima actual), NASA POWER (radiación), Sentinel-2/Copernicus (NDVI, planificado).

---

## Licencia

Por definir (probablemente MIT o Apache 2.0). Hasta entonces, todos los derechos reservados.

---

## Contacto

¿Eres agricultor o agrónomo y quieres probar la beta?
¿Eres dev y quieres contribuir?

Abre un issue o un PR.

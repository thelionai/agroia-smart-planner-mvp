# AGROIA SMART PLANNER — Backend FastAPI

Motor de predicción fenológica con Python + FastAPI + PostgreSQL.

## 🚀 Inicio rápido

### 1. Requisitos
- Python 3.11+
- PostgreSQL 14+

### 2. Instalación

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
# DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/agroia_db
```

### 4. Iniciar servidor

```bash
uvicorn app.main:app --reload
```

El servidor arrancará en **http://localhost:8000**

### 5. Explorar la API

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📡 Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/users/register` | Registrar usuario |
| `POST` | `/users/login` | Obtener token JWT |
| `POST` | `/parcelas` | Registrar parcela |
| `GET`  | `/parcelas` | Listar parcelas |
| `POST` | `/cultivos` | Registrar cultivo con Tbase/GDD |
| `GET`  | `/cultivos` | Catálogo de cultivos |
| `POST` | `/registrar-siembra` | Registrar fecha de siembra |
| `GET`  | `/prediccion/{id}` | 🌱 **Motor fenológico** |
| `GET`  | `/health` | Health check (Render/Railway) |

---

## 🌡️ Fórmula GDD

```
GDD_diario = max(((Tmax + Tmin) / 2) - Tbase, 0)
```

### Respuesta de predicción

```json
{
  "gdd_acumulado": 342.5,
  "fecha_estimada_floracion": "2024-05-20",
  "dias_restantes": 45,
  "fase_actual": "vegetativa",
  "nombre_cultivo": "Maíz Amarillo Duro",
  "porcentaje_avance": 68.5
}
```

---

## 🏗️ Estructura del proyecto

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py        # Variables de entorno
│   │   └── database.py      # Engine SQLAlchemy
│   ├── models/              # Tablas ORM
│   │   ├── user.py
│   │   ├── parcela.py
│   │   ├── cultivo.py
│   │   ├── siembra.py
│   │   ├── clima_diario.py
│   │   └── prediccion.py
│   ├── schemas/             # Validaciones Pydantic
│   │   ├── user.py
│   │   ├── parcela.py
│   │   ├── cultivo.py
│   │   ├── siembra.py
│   │   └── prediccion.py
│   ├── services/            # Lógica de negocio
│   │   ├── gdd_service.py       # Motor GDD
│   │   ├── clima_service.py     # Open-Meteo API
│   │   └── prediccion_service.py # Orquestador
│   ├── routes/              # Endpoints FastAPI
│   │   ├── users.py
│   │   ├── parcelas.py
│   │   ├── cultivos.py
│   │   ├── siembras.py
│   │   └── predicciones.py
│   └── main.py              # Entrada principal
├── requirements.txt
├── Procfile                 # Para Render/Railway
└── .env.example
```

---

## ☁️ Despliegue en Render

1. Crear nuevo **Web Service** en [render.com](https://render.com)
2. Conectar repositorio GitHub
3. **Root Directory:** `backend`
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Agregar base de datos PostgreSQL en Render y copiar `DATABASE_URL`
7. Configurar variables de entorno en el panel de Render

---

## 🌾 Cultivos de referencia (Tbase + umbrales GDD)

| Cultivo | Tbase (°C) | GDD Floración | GDD Madurez |
|---------|-----------|---------------|-------------|
| Maíz    | 10        | 500           | 1200        |
| Trigo   | 0         | 500           | 1500        |
| Papa    | 7         | 600           | 1400        |
| Arroz   | 10        | 600           | 1200        |
| Quinua  | 3         | 400           | 900         |

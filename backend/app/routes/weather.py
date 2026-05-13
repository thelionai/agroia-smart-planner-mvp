"""
routes/weather.py
─────────────────
Endpoints de clima para el frontend.

El frontend NUNCA llama Open-Meteo directamente.
Toda la lógica de APIs externas vive aquí (en el backend).

Endpoints:
  GET /weather/{parcela_id}           → clima actual del día
  GET /weather/{parcela_id}/forecast  → pronóstico 5 días

Flujo:
  Frontend → GET /weather/{id}
          → Busca parcela (lat/lon)
          → Verifica caché BD (clima_diario de hoy)
          → Si no hay caché: llama Open-Meteo + guarda en BD
          → Responde con source="cache" | "open-meteo"
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.parcela import Parcela
from app.services import weather_service, ndvi_service, iot_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/weather", tags=["Clima / Weather"])


# ──────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────

def _get_parcela_or_404(parcela_id: int, db: Session) -> Parcela:
    """Obtiene la parcela o lanza 404."""
    parcela = db.query(Parcela).filter(Parcela.id == parcela_id).first()
    if not parcela:
        raise HTTPException(
            status_code=404,
            detail=f"Parcela con id={parcela_id} no encontrada."
        )
    return parcela


# ──────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────

@router.get("/{parcela_id}", summary="Clima actual de la parcela")
async def get_weather(
    parcela_id: int,
    db: Session = Depends(get_db),
):
    """
    Devuelve el clima actual para una parcela.

    - **Caché inteligente**: si ya se consultó hoy, responde desde BD (`source="cache"`)
    - **Open-Meteo**: si no hay caché, consulta la API gratuita y guarda en BD

    Respuesta normalizada:
    ```json
    {
      "parcela_id": 1,
      "parcela_nombre": "Finca Norte",
      "temperature": 22.5,
      "humidity": 65.0,
      "rain_probability": 30.0,
      "tmax": 26.0,
      "tmin": 14.0,
      "wind_speed": 12.5,
      "source": "open-meteo"
    }
    ```
    """
    parcela = _get_parcela_or_404(parcela_id, db)

    try:
        clima = await weather_service.get_current_weather(
            lat=parcela.latitud,
            lon=parcela.longitud,
            parcela_id=parcela_id,
            db=db,
        )
    except RuntimeError as e:
        logger.error(f"Error obteniendo clima para parcela_id={parcela_id}: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Servicio climático no disponible: {str(e)}"
        )

    return {
        "parcela_id": parcela_id,
        "parcela_nombre": parcela.nombre,
        **clima,
    }


@router.get("/{parcela_id}/forecast", summary="Pronóstico 5 días de la parcela")
async def get_forecast(
    parcela_id: int,
    days: int = Query(default=5, ge=1, le=14, description="Número de días de pronóstico (1-14)"),
    db: Session = Depends(get_db),
):
    """
    Devuelve pronóstico climático para una parcela.

    - Datos frescos desde Open-Meteo (no se cachea, siempre actualizado)
    - Rango configurable: 1 a 14 días

    Respuesta:
    ```json
    {
      "parcela_id": 1,
      "parcela_nombre": "Finca Norte",
      "days": 5,
      "forecast": [
        {"date": "2026-02-21", "tmax": 25.0, "tmin": 13.0, "rain_probability": 20.0, "precipitation": 2.5},
        ...
      ],
      "source": "open-meteo"
    }
    ```
    """
    parcela = _get_parcela_or_404(parcela_id, db)

    try:
        forecast = await weather_service.get_forecast(
            lat=parcela.latitud,
            lon=parcela.longitud,
            days=days,
        )
    except RuntimeError as e:
        logger.error(f"Error obteniendo pronóstico para parcela_id={parcela_id}: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Servicio de pronóstico no disponible: {str(e)}"
        )

    return {
        "parcela_id": parcela_id,
        "parcela_nombre": parcela.nombre,
        **forecast,
    }


@router.get("/{parcela_id}/ndvi", summary="Índice NDVI de vegetación (stub)")
def get_ndvi(parcela_id: int, db: Session = Depends(get_db)):
    """
    Retorna índice NDVI para la parcela.
    **Estado: NO IMPLEMENTADO** — pendiente integración Sentinel-2/Copernicus.

    El frontend puede usar esto para mostrar un widget "coming soon".
    """
    _get_parcela_or_404(parcela_id, db)
    return ndvi_service.get_ndvi(parcela_id)


@router.get("/{parcela_id}/iot", summary="Sensores IoT de la parcela (stub)")
def get_iot(parcela_id: int, db: Session = Depends(get_db)):
    """
    Retorna datos de sensores IoT para la parcela.
    **Estado: NO CONECTADO** — pendiente integración con sensores físicos.

    El frontend puede usar esto para mostrar el estado de conectividad.
    """
    _get_parcela_or_404(parcela_id, db)
    return iot_service.get_all_sensors(parcela_id)

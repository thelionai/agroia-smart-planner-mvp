"""
services/weather_service.py
───────────────────────────
Servicio de clima orientado al frontend.

Orquesta:
  - Open-Meteo forecast API (datos actuales + predicción)
  - clima_diario (caché BD para datos históricos)

Retorna estructuras normalizadas que el frontend consume directamente.
El frontend NUNCA llama a Open-Meteo; solo llama a este backend.
"""
import httpx
import logging
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session

from app.models.clima_diario import ClimaDiario

logger = logging.getLogger(__name__)

# Open-Meteo Forecast API (datos actuales y pronóstico)
OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# Timeout para llamadas externas
HTTP_TIMEOUT = 20.0


# ──────────────────────────────────────────────────────────────────
# Helpers internos
# ──────────────────────────────────────────────────────────────────

def _check_cache_today(db: Session, parcela_id: int) -> Optional[ClimaDiario]:
    """
    Verifica si ya existe un registro climático para hoy en la BD.
    Si existe, el frontend recibirá source='cache'.
    """
    hoy = date.today()
    return (
        db.query(ClimaDiario)
        .filter(
            ClimaDiario.parcela_id == parcela_id,
            ClimaDiario.fecha == hoy,
        )
        .first()
    )


def _save_to_cache(db: Session, parcela_id: int, data: dict) -> None:
    """Guarda datos climáticos del día en la BD caché."""
    hoy = date.today()
    # Solo guardar si no existe aún (evitar duplicados)
    existing = db.query(ClimaDiario).filter(
        ClimaDiario.parcela_id == parcela_id,
        ClimaDiario.fecha == hoy,
    ).first()

    if not existing:
        registro = ClimaDiario(
            parcela_id=parcela_id,
            fecha=hoy,
            tmax=data["tmax"],
            tmin=data["tmin"],
            tmean=(data["tmax"] + data["tmin"]) / 2,
            precipitacion=data.get("rain_probability", 0) / 10,  # estimación mm
            fuente="open-meteo",
        )
        db.add(registro)
        db.commit()
        logger.info(f"💾 Clima de hoy guardado en caché para parcela_id={parcela_id}")


# ──────────────────────────────────────────────────────────────────
# Consulta Open-Meteo Forecast
# ──────────────────────────────────────────────────────────────────

async def _fetch_open_meteo_forecast(lat: float, lon: float, days: int = 5) -> dict:
    """
    Consulta la API de pronóstico de Open-Meteo.

    Returns:
        dict con datos crudos: current + daily
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
        "daily": (
            "temperature_2m_max,temperature_2m_min,"
            "precipitation_sum,precipitation_probability_max"
        ),
        "timezone": "auto",
        "forecast_days": min(days + 1, 16),  # +1 para incluir hoy
    }

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            logger.info(f"🌤️ Consultando Open-Meteo forecast lat={lat}, lon={lon}")
            resp = await client.get(OPEN_METEO_FORECAST_URL, params=params)
            resp.raise_for_status()
            return resp.json()

    except httpx.TimeoutException:
        logger.error("⏱️ Timeout al consultar Open-Meteo forecast")
        raise RuntimeError("La API climática no respondió a tiempo.")
    except httpx.HTTPStatusError as e:
        logger.error(f"❌ Error HTTP Open-Meteo: {e.response.status_code}")
        raise RuntimeError(f"Error al obtener datos climáticos: {e.response.status_code}")


# ──────────────────────────────────────────────────────────────────
# API pública del módulo
# ──────────────────────────────────────────────────────────────────

async def get_current_weather(
    lat: float,
    lon: float,
    parcela_id: int,
    db: Session,
) -> dict:
    """
    Devuelve el clima actual para una parcela.

    Estrategia caché:
      1. Si ya hay datos de hoy en BD → devuelve desde caché (source="cache")
      2. Si no → consulta Open-Meteo y guarda en BD

    Returns:
        {
            "temperature": float,    # temperatura actual °C
            "humidity": float,       # humedad relativa %
            "rain_probability": float, # prob. lluvia hoy %
            "tmax": float,           # temp. máxima del día °C
            "tmin": float,           # temp. mínima del día °C
            "wind_speed": float,     # viento km/h
            "source": "cache" | "open-meteo",
        }
    """
    # 1. Intentar caché
    cached = _check_cache_today(db, parcela_id)
    if cached:
        logger.info(f"📦 Clima desde caché para parcela_id={parcela_id}")
        return {
            "temperature": round(cached.tmean or (cached.tmax + cached.tmin) / 2, 1),
            "humidity": 65.0,   # no guardamos humedad aún, default seguro
            "rain_probability": round((cached.precipitacion or 0) * 10, 1),
            "tmax": round(cached.tmax, 1),
            "tmin": round(cached.tmin, 1),
            "wind_speed": 0.0,
            "source": "cache",
        }

    # 2. Consultar Open-Meteo
    raw = await _fetch_open_meteo_forecast(lat, lon, days=1)
    current = raw.get("current", {})
    daily = raw.get("daily", {})

    tmax = daily.get("temperature_2m_max", [None])[0]
    tmin = daily.get("temperature_2m_min", [None])[0]
    rain_prob = daily.get("precipitation_probability_max", [0])[0] or 0

    result = {
        "temperature": round(current.get("temperature_2m", 18.0), 1),
        "humidity": round(current.get("relative_humidity_2m", 65.0), 1),
        "rain_probability": round(float(rain_prob), 1),
        "tmax": round(float(tmax), 1) if tmax is not None else 25.0,
        "tmin": round(float(tmin), 1) if tmin is not None else 12.0,
        "wind_speed": round(current.get("wind_speed_10m", 0.0), 1),
        "source": "open-meteo",
    }

    # 3. Guardar en caché
    _save_to_cache(db, parcela_id, result)

    return result


async def get_forecast(lat: float, lon: float, days: int = 5) -> dict:
    """
    Devuelve pronóstico para N días.

    Returns:
        {
            "days": int,
            "forecast": [
                {
                    "date": str,
                    "tmax": float,
                    "tmin": float,
                    "rain_probability": float,
                    "precipitation": float,
                },
                ...
            ],
            "source": "open-meteo",
        }
    """
    raw = await _fetch_open_meteo_forecast(lat, lon, days=days)
    daily = raw.get("daily", {})

    dates = daily.get("time", [])
    tmax_list = daily.get("temperature_2m_max", [])
    tmin_list = daily.get("temperature_2m_min", [])
    precip_list = daily.get("precipitation_sum", [])
    rain_prob_list = daily.get("precipitation_probability_max", [])

    forecast = []
    for i, d in enumerate(dates[1: days + 1], start=1):  # skip today (index 0)
        if i >= len(dates):
            break
        actual_i = i  # index in the lists
        forecast.append({
            "date": d,
            "tmax": round(float(tmax_list[actual_i]), 1) if tmax_list[actual_i] is not None else None,
            "tmin": round(float(tmin_list[actual_i]), 1) if tmin_list[actual_i] is not None else None,
            "rain_probability": round(float(rain_prob_list[actual_i]), 1) if rain_prob_list[actual_i] is not None else 0.0,
            "precipitation": round(float(precip_list[actual_i]), 1) if precip_list[actual_i] is not None else 0.0,
        })

    return {
        "days": len(forecast),
        "forecast": forecast,
        "source": "open-meteo",
    }

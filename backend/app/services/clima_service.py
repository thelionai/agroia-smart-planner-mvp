"""
services/clima_service.py
─────────────────────────
Servicio de datos climáticos usando Open-Meteo API (gratuita, sin API key).

Estrategia de caché:
    1. Busca datos en BD local (tabla clima_diario)
    2. Si faltan días, consulta Open-Meteo para ese rango
    3. Guarda los datos nuevos en BD para futuras consultas

Documentación Open-Meteo: https://open-meteo.com/en/docs/historical-weather-api
"""
import httpx
import logging
from datetime import date, timedelta
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.clima_diario import ClimaDiario

logger = logging.getLogger(__name__)

# URL base de la API histórica de Open-Meteo
OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive"


# ──────────────────────────────────────────────────────────────────
# Capa de acceso a datos (BD local como caché)
# ──────────────────────────────────────────────────────────────────

def obtener_datos_bd(
    db: Session,
    parcela_id: int,
    fecha_inicio: date,
    fecha_fin: date
) -> List[ClimaDiario]:
    """Recupera datos climáticos almacenados en BD para el rango dado."""
    return (
        db.query(ClimaDiario)
        .filter(
            ClimaDiario.parcela_id == parcela_id,
            ClimaDiario.fecha >= fecha_inicio,
            ClimaDiario.fecha <= fecha_fin,
        )
        .order_by(ClimaDiario.fecha)
        .all()
    )


def guardar_datos_clima(
    db: Session,
    parcela_id: int,
    datos: List[dict],
    fuente: str = "open-meteo"
) -> int:
    """
    Guarda datos climáticos en BD. Usa INSERT OR IGNORE para evitar duplicados.

    Returns:
        Número de registros guardados
    """
    guardados = 0
    for dato in datos:
        existente = db.query(ClimaDiario).filter(
            ClimaDiario.parcela_id == parcela_id,
            ClimaDiario.fecha == dato["fecha"]
        ).first()

        if not existente:
            registro = ClimaDiario(
                parcela_id=parcela_id,
                fecha=dato["fecha"],
                tmax=dato["tmax"],
                tmin=dato["tmin"],
                tmean=(dato["tmax"] + dato["tmin"]) / 2,
                precipitacion=dato.get("precipitacion"),
                fuente=fuente,
            )
            db.add(registro)
            guardados += 1

    if guardados > 0:
        db.commit()
        logger.info(f"💾 {guardados} registros climáticos guardados para parcela_id={parcela_id}")

    return guardados


# ──────────────────────────────────────────────────────────────────
# Consulta a Open-Meteo
# ──────────────────────────────────────────────────────────────────

async def consultar_open_meteo(
    latitud: float,
    longitud: float,
    fecha_inicio: date,
    fecha_fin: date
) -> List[dict]:
    """
    Consulta la API histórica de Open-Meteo.

    Args:
        latitud, longitud: Coordenadas de la parcela
        fecha_inicio, fecha_fin: Rango de fechas

    Returns:
        Lista de dicts con keys: fecha, tmax, tmin, precipitacion
    """
    # Open-Meteo no acepta fechas futuras, limitar a hoy
    hoy = date.today()
    fecha_fin_real = min(fecha_fin, hoy)

    if fecha_inicio > fecha_fin_real:
        logger.warning(f"Rango de fechas inválido: {fecha_inicio} > {fecha_fin_real}")
        return []

    params = {
        "latitude": latitud,
        "longitude": longitud,
        "start_date": fecha_inicio.isoformat(),
        "end_date": fecha_fin_real.isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"🌤️ Consultando Open-Meteo para lat={latitud}, lon={longitud} "
                        f"({fecha_inicio} → {fecha_fin_real})")
            respuesta = await client.get(OPEN_METEO_URL, params=params)
            respuesta.raise_for_status()
            data = respuesta.json()

    except httpx.TimeoutException:
        logger.error("⏱️ Timeout al consultar Open-Meteo")
        raise RuntimeError("La API climática no respondió a tiempo. Intente nuevamente.")
    except httpx.HTTPStatusError as e:
        logger.error(f"❌ Error HTTP de Open-Meteo: {e.response.status_code}")
        raise RuntimeError(f"Error al obtener datos climáticos: {e.response.status_code}")

    # Parsear respuesta
    daily = data.get("daily", {})
    fechas = daily.get("time", [])
    tmax_list = daily.get("temperature_2m_max", [])
    tmin_list = daily.get("temperature_2m_min", [])
    precip_list = daily.get("precipitation_sum", [])

    resultado = []
    for i, fecha_str in enumerate(fechas):
        tmax = tmax_list[i]
        tmin = tmin_list[i]

        # Ignorar días con datos incompletos
        if tmax is None or tmin is None:
            logger.debug(f"⚠️ Datos faltantes para {fecha_str}, omitiendo.")
            continue

        resultado.append({
            "fecha": date.fromisoformat(fecha_str),
            "tmax": round(float(tmax), 2),
            "tmin": round(float(tmin), 2),
            "precipitacion": round(float(precip_list[i]), 2) if precip_list[i] is not None else None,
        })

    logger.info(f"✅ {len(resultado)} días de datos climáticos obtenidos de Open-Meteo")
    return resultado


# ──────────────────────────────────────────────────────────────────
# Función principal (orquesta BD + API)
# ──────────────────────────────────────────────────────────────────

async def obtener_datos_clima_completos(
    db: Session,
    parcela_id: int,
    latitud: float,
    longitud: float,
    fecha_inicio: date,
    fecha_fin: Optional[date] = None
) -> List[Tuple[date, float, float]]:
    """
    Obtiene datos climáticos completos para una parcela en un rango de fechas.
    Combina caché de BD con consulta a Open-Meteo para días faltantes.

    Returns:
        Lista ordenada de tuplas (fecha, tmax, tmin)
    """
    if fecha_fin is None:
        fecha_fin = date.today()

    # 1. Obtener lo que tenemos en BD
    datos_bd = obtener_datos_bd(db, parcela_id, fecha_inicio, fecha_fin)
    fechas_en_bd = {d.fecha for d in datos_bd}

    # 2. Detectar días faltantes
    todas_las_fechas = set()
    cursor = fecha_inicio
    while cursor <= fecha_fin:
        todas_las_fechas.add(cursor)
        cursor += timedelta(days=1)

    fechas_faltantes = sorted(todas_las_fechas - fechas_en_bd)

    # 3. Consultar API solo para los días faltantes
    if fechas_faltantes:
        datos_api = await consultar_open_meteo(
            latitud=latitud,
            longitud=longitud,
            fecha_inicio=fechas_faltantes[0],
            fecha_fin=fechas_faltantes[-1],
        )
        # Guardar en BD caché
        guardar_datos_clima(db, parcela_id, datos_api)

        # Recargar desde BD (ya incluye los nuevos)
        datos_bd = obtener_datos_bd(db, parcela_id, fecha_inicio, fecha_fin)

    # 4. Devolver como tuplas ordenadas por fecha
    return [(d.fecha, d.tmax, d.tmin) for d in datos_bd]

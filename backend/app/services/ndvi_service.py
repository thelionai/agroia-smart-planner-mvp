"""
services/ndvi_service.py
────────────────────────
Stub del servicio NDVI — Índice de Vegetación Normalizado.

Arquitectura preparada para integración con:
  - Sentinel-2 (ESA Copernicus) vía API Copernicus Data Space
  - Google Earth Engine (alternativa)
  - NASA Earthdata

Estado actual: NOT IMPLEMENTED
El frontend recibirá status="not_implemented" y podrá mostrar
un placeholder/coming-soon en la UI.

Para integrar Sentinel-2:
  1. Obtener credenciales en https://dataspace.copernicus.eu
  2. Usar librería sentinelsat o API REST directa
  3. Calcular NDVI = (NIR - RED) / (NIR + RED)
  4. Retornar valor entre -1 (sin vegetación) y 1 (vegetación densa)
"""
import logging

logger = logging.getLogger(__name__)


def get_ndvi(parcela_id: int) -> dict:
    """
    Retorna índice NDVI para una parcela.

    Args:
        parcela_id: ID de la parcela en la BD

    Returns:
        {
            "status": "not_implemented",
            "provider": "Sentinel-2 / Copernicus",
            "parcela_id": int,
            "ndvi": None,
            "interpretation": None,
            "roadmap": str,
        }
    """
    logger.debug(f"NDVI solicitado para parcela_id={parcela_id} — servicio no implementado aún")

    return {
        "status": "not_implemented",
        "provider": "Sentinel-2 / Copernicus",
        "parcela_id": parcela_id,
        "ndvi": None,
        "interpretation": None,
        "roadmap": (
            "Integración planificada: Copernicus Data Space API. "
            "NDVI se calculará con imágenes satelitales multiespectrales "
            "de los últimos 10 días con resolución 10m."
        ),
    }


def get_ndvi_history(parcela_id: int, days: int = 30) -> dict:
    """
    Retorna historial NDVI para una parcela.
    Stub — pendiente integración satelital.
    """
    logger.debug(f"Historial NDVI solicitado para parcela_id={parcela_id} ({days} días)")

    return {
        "status": "not_implemented",
        "provider": "Sentinel-2 / Copernicus",
        "parcela_id": parcela_id,
        "days_requested": days,
        "history": [],
        "message": "Integración satelital pendiente.",
    }

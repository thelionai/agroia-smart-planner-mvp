"""
schemas/prediccion.py
─────────────────────
Esquema de respuesta del motor fenológico GDD — listo para demo.

Cambios v2:
  - 4 fases fenológicas (emergencia / vegetativo / floracion / madurez)
  - Campo `proxima_fase` con nombre y GDD necesario
  - Campo `datos_clima` con info de fuente (cache vs open-meteo)
  - `fecha_estimada_proxima_fase` proyectada para las que aún no ocurrieron
"""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, Literal, Dict, Any


# ── Respuesta principal ───────────────────────────────────────────

class ProximaFase(BaseModel):
    """Información sobre la siguiente fase fenológica."""
    nombre: str = Field(..., description="Nombre de la siguiente fase")
    gdd_necesario: float = Field(..., description="GDD necesarios para alcanzarla")
    gdd_restante: float = Field(..., description="GDD que faltan")
    dias_estimados: Optional[int] = Field(None, description="Días estimados para llegar")
    fecha_estimada: Optional[str] = Field(None, description="Fecha estimada YYYY-MM-DD")


class DatosClima(BaseModel):
    """Metadatos sobre el origen de los datos climáticos."""
    total_dias: int
    dias_desde_cache: int
    dias_desde_api: int
    fuente_primaria: Literal["cache", "open-meteo", "mixto"]


class PrediccionResponse(BaseModel):
    """
    Respuesta estructurada del motor de predicción fenológica.
    Endpoint: GET /prediccion/{siembra_id}
    """
    # ── Identificación ──────────────────────────────────────────
    siembra_id: int
    nombre_cultivo: str
    nombre_parcela: str = ""

    # ── GDD ─────────────────────────────────────────────────────
    gdd_acumulado: float = Field(..., description="GDD acumulados desde la siembra hasta hoy")
    gdd_promedio_diario: float = Field(..., description="GDD promedio por día (histórico)")

    # ── Fase actual ──────────────────────────────────────────────
    fase_actual: Literal["emergencia", "vegetativo", "floracion", "madurez"] = Field(
        ..., description="Fase fenológica actual"
    )
    porcentaje_avance: float = Field(..., description="% hacia floración (0-100)")

    # ── Fechas históricas (ya ocurrieron) ────────────────────────
    fecha_siembra: str
    fecha_emergencia: Optional[str] = Field(None, description="Fecha real de emergencia (si ya ocurrió)")
    fecha_floracion: Optional[str] = Field(None, description="Fecha real de floración (si ya ocurrió)")
    fecha_madurez: Optional[str] = Field(None, description="Fecha real de madurez (si ya ocurrió)")

    # ── Proyecciones futuras ─────────────────────────────────────
    fecha_estimada_floracion: Optional[str] = Field(None, description="Fecha estimada de floración YYYY-MM-DD")
    fecha_estimada_madurez: Optional[str] = Field(None, description="Fecha estimada de madurez YYYY-MM-DD")
    dias_restantes: Optional[int] = Field(None, description="Días hasta próxima fase")

    # ── Próxima fase ─────────────────────────────────────────────
    proxima_fase: Optional[ProximaFase] = None

    # ── Contexto temporal ────────────────────────────────────────
    dias_desde_siembra: int
    ultima_actualizacion: datetime

    # ── Metadatos climáticos ─────────────────────────────────────
    datos_clima: Optional[DatosClima] = None

    class Config:
        from_attributes = True


class PrediccionResumen(BaseModel):
    """Versión simplificada para listados."""
    siembra_id: int
    gdd_acumulado: float
    fase_actual: str
    fecha_estimada_floracion: Optional[str]
    dias_restantes: Optional[int]

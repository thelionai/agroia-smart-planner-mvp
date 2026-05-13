"""
services/gdd_service.py — v2
─────────────────────────────
Motor de cálculo de Grados Día de Crecimiento (GDD) — 4 fases fenológicas.

Fórmula:
    GDD_diario = max(((Tmax + Tmin) / 2) - Tbase, 0)

Fases:
    emergencia   → GDD < umbral_vegetativo  (primeros 10% del camino a floración)
    vegetativo   → GDD < umbral_floracion
    floracion    → GDD < umbral_madurez
    madurez      → GDD >= umbral_madurez

Este módulo es independiente de BD — fácil de reemplazar con ML.
"""
from typing import List, Tuple
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────
# Tipos de datos
# ──────────────────────────────────────────────────────────────────

class DatoDiario:
    """Representa datos climáticos de un día con su GDD calculado."""

    def __init__(self, fecha: date, tmax: float, tmin: float, gdd: float):
        self.fecha = fecha
        self.tmax = tmax
        self.tmin = tmin
        self.gdd = gdd


# ──────────────────────────────────────────────────────────────────
# Core GDD formula
# ──────────────────────────────────────────────────────────────────

def calcular_gdd_diario(tmax: float, tmin: float, tbase: float) -> float:
    """
    Calcula el GDD para un solo día.

    Args:
        tmax: Temperatura máxima del día en °C
        tmin: Temperatura mínima del día en °C
        tbase: Temperatura base del cultivo en °C

    Returns:
        GDD del día (>= 0)

    Ejemplo:
        tmax=25, tmin=15, tbase=10 → GDD = max((25+15)/2 - 10, 0) = 10.0
    """
    tmean = (tmax + tmin) / 2
    return round(max(tmean - tbase, 0.0), 2)


def calcular_gdd_acumulado(
    datos_clima: List[Tuple[date, float, float]],
    tbase: float
) -> List[DatoDiario]:
    """
    Calcula el GDD acumulado para una serie histórica de datos climáticos.

    Args:
        datos_clima: Lista de tuplas (fecha, tmax, tmin) ordenadas por fecha
        tbase: Temperatura base del cultivo

    Returns:
        Lista de DatoDiario con GDD por cada día
    """
    resultado = []
    for fecha, tmax, tmin in datos_clima:
        gdd = calcular_gdd_diario(tmax, tmin, tbase)
        resultado.append(DatoDiario(fecha=fecha, tmax=tmax, tmin=tmin, gdd=gdd))

    # Log de días con datos faltantes / sin GDD
    dias_sin_gdd = sum(1 for d in resultado if d.gdd == 0.0)
    logger.debug(
        f"GDD calculado para {len(resultado)} días | Tbase={tbase}°C "
        f"| Días sin aporte GDD (temp bajo Tbase): {dias_sin_gdd}"
    )
    return resultado


# ──────────────────────────────────────────────────────────────────
# 4-Phase fenológica
# ──────────────────────────────────────────────────────────────────

def determinar_fase(
    gdd_acumulado: float,
    umbral_floracion: float,
    umbral_madurez: float,
) -> str:
    """
    Determina la fase fenológica actual (4 fases).

    Fases:
        emergencia  → GDD < 10% del umbral_floracion
        vegetativo  → 10% <= GDD < umbral_floracion
        floracion   → umbral_floracion <= GDD < umbral_madurez
        madurez     → GDD >= umbral_madurez

    Returns:
        "emergencia" | "vegetativo" | "floracion" | "madurez"
    """
    umbral_emergencia = umbral_floracion * 0.10  # primeros 10%

    if gdd_acumulado >= umbral_madurez:
        return "madurez"
    elif gdd_acumulado >= umbral_floracion:
        return "floracion"
    elif gdd_acumulado >= umbral_emergencia:
        return "vegetativo"
    else:
        return "emergencia"


def obtener_umbral_proxima_fase(
    fase_actual: str,
    umbral_floracion: float,
    umbral_madurez: float,
) -> float:
    """Retorna el umbral GDD de la siguiente fase."""
    if fase_actual == "emergencia":
        return umbral_floracion * 0.10
    elif fase_actual == "vegetativo":
        return umbral_floracion
    elif fase_actual == "floracion":
        return umbral_madurez
    else:  # madurez
        return umbral_madurez


def obtener_nombre_proxima_fase(fase_actual: str) -> str:
    """Retorna el nombre legible de la siguiente fase."""
    mapa = {
        "emergencia": "vegetativo",
        "vegetativo": "floracion",
        "floracion": "madurez",
        "madurez": "completado",
    }
    return mapa.get(fase_actual, "completado")


# ──────────────────────────────────────────────────────────────────
# Estimación de fechas y tiempos
# ──────────────────────────────────────────────────────────────────

def estimar_fecha_por_umbral(
    datos_historicos: List[DatoDiario],
    tbase: float,
    umbral: float,
    fecha_inicio: date
) -> Tuple[float, date | None]:
    """
    Acumula GDD día a día y detecta en qué fecha se alcanzó el umbral.

    Returns:
        (gdd_total_acumulado, fecha_umbral_o_None)
    """
    acumulado = 0.0
    fecha_objetivo = None

    for dia in datos_historicos:
        acumulado += dia.gdd
        if fecha_objetivo is None and acumulado >= umbral:
            fecha_objetivo = dia.fecha

    return round(acumulado, 2), fecha_objetivo


def estimar_fecha_futura(
    gdd_acumulado: float,
    umbral_objetivo: float,
    gdd_promedio_diario: float,
    desde: date
) -> date | None:
    """
    Estima la fecha futura en que se alcanzará un umbral GDD.

    Args:
        desde: Fecha desde donde calcular (normalmente 'hoy')
    """
    if gdd_acumulado >= umbral_objetivo:
        return None  # ya alcanzado

    gdd_faltante = umbral_objetivo - gdd_acumulado
    promedio = max(gdd_promedio_diario, 1.0)  # mínimo 1 GDD/día
    dias = round(gdd_faltante / promedio)
    from datetime import timedelta
    return desde + timedelta(days=max(dias, 1))


def estimar_dias_restantes(
    gdd_acumulado: float,
    umbral_objetivo: float,
    tbase: float,
    gdd_promedio_diario: float | None = None
) -> int | None:
    """
    Estima días restantes hasta el próximo umbral.
    Usa el GDD promedio diario histórico; por defecto 8 GDD/día si no hay datos.
    """
    if gdd_acumulado >= umbral_objetivo:
        return 0

    gdd_faltante = umbral_objetivo - gdd_acumulado
    promedio = gdd_promedio_diario if (gdd_promedio_diario and gdd_promedio_diario > 0) else 8.0
    return max(round(gdd_faltante / promedio), 1)

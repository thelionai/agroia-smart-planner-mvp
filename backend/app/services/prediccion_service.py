"""
services/prediccion_service.py — v2
─────────────────────────────────────
Orquestador del motor fenológico. Conecta clima → GDD → 4 fases → predicción.

Cambios v2:
  - 4 fases fenológicas (emergencia / vegetativo / floracion / madurez)
  - ProximaFase con fecha estimada proyectada
  - DatosClima con fuente (cache | open-meteo | mixto)
  - Trazabilidad completa del origen de cada dato climático
"""
from datetime import date, datetime
from typing import Optional
import logging

from sqlalchemy.orm import Session

from app.models.siembra import Siembra
from app.models.parcela import Parcela
from app.models.cultivo import Cultivo
from app.models.prediccion import Prediccion
from app.models.clima_diario import ClimaDiario
from app.services import gdd_service, clima_service
from app.schemas.prediccion import (
    PrediccionResponse, ProximaFase, DatosClima
)

logger = logging.getLogger(__name__)


async def calcular_prediccion(
    db: Session,
    siembra_id: int
) -> PrediccionResponse:
    """
    Calcula o recalcula la predicción fenológica (4 fases) para una siembra.

    Flujo:
        1. Cargar siembra, parcela, cultivo
        2. Obtener datos climáticos (BD caché → Open-Meteo si faltan)
        3. Calcular GDD día a día
        4. Determinar fase actual (4 etapas)
        5. Guardar predicción en BD
        6. Retornar PrediccionResponse completo
    """
    # ── 1. Cargar entidades ──────────────────────────────────────
    siembra = db.query(Siembra).filter(Siembra.id == siembra_id).first()
    if not siembra:
        raise ValueError(f"Siembra con id={siembra_id} no encontrada.")

    parcela: Parcela = siembra.parcela
    cultivo: Cultivo = siembra.cultivo

    if not parcela or not cultivo:
        raise ValueError("La siembra no tiene parcela o cultivo asociado.")

    logger.info(
        f"🌱 Calculando predicción | siembra_id={siembra_id} "
        f"| Cultivo: {cultivo.nombre} | Parcela: {parcela.nombre}"
    )

    # ── 2. Datos climáticos con trazabilidad de fuente ───────────
    hoy = date.today()
    fecha_siembra = siembra.fecha_siembra

    # Contar los que ya existen en BD antes de la consulta
    dias_en_cache_antes = db.query(ClimaDiario).filter(
        ClimaDiario.parcela_id == parcela.id,
        ClimaDiario.fecha >= fecha_siembra,
        ClimaDiario.fecha <= hoy,
    ).count()

    datos_clima = await clima_service.obtener_datos_clima_completos(
        db=db,
        parcela_id=parcela.id,
        latitud=parcela.latitud,
        longitud=parcela.longitud,
        fecha_inicio=fecha_siembra,
        fecha_fin=hoy,
    )

    if not datos_clima:
        raise RuntimeError(
            f"No se pudieron obtener datos climáticos para '{parcela.nombre}' "
            f"(lat={parcela.latitud}, lon={parcela.longitud})."
        )

    # Calcular cuántos vinieron de API vs cache
    total_dias = len(datos_clima)
    dias_en_cache_despues = db.query(ClimaDiario).filter(
        ClimaDiario.parcela_id == parcela.id,
        ClimaDiario.fecha >= fecha_siembra,
        ClimaDiario.fecha <= hoy,
    ).count()
    dias_nuevos_api = dias_en_cache_despues - dias_en_cache_antes
    dias_desde_cache = total_dias - dias_nuevos_api

    if dias_nuevos_api == 0:
        fuente_primaria = "cache"
    elif dias_desde_cache == 0:
        fuente_primaria = "open-meteo"
    else:
        fuente_primaria = "mixto"

    logger.info(
        f"📊 Datos climáticos | Total: {total_dias} días "
        f"| Cache: {dias_desde_cache} | Open-Meteo: {dias_nuevos_api} "
        f"| Fuente: {fuente_primaria}"
    )

    datos_clima_meta = DatosClima(
        total_dias=total_dias,
        dias_desde_cache=dias_desde_cache,
        dias_desde_api=dias_nuevos_api,
        fuente_primaria=fuente_primaria,
    )

    # ── 3. Calcular GDD ──────────────────────────────────────────
    dias_calculados = gdd_service.calcular_gdd_acumulado(
        datos_clima=datos_clima,
        tbase=cultivo.tbase,
    )

    # ── 4. Acumular y detectar umbrales de las 4 fases ───────────
    UMBRAL_EMERGENCIA = cultivo.umbral_floracion * 0.10

    gdd_acumulado, fecha_emergencia = gdd_service.estimar_fecha_por_umbral(
        datos_historicos=dias_calculados,
        tbase=cultivo.tbase,
        umbral=UMBRAL_EMERGENCIA,
        fecha_inicio=fecha_siembra,
    )
    _, fecha_floracion = gdd_service.estimar_fecha_por_umbral(
        datos_historicos=dias_calculados,
        tbase=cultivo.tbase,
        umbral=cultivo.umbral_floracion,
        fecha_inicio=fecha_siembra,
    )
    _, fecha_madurez = gdd_service.estimar_fecha_por_umbral(
        datos_historicos=dias_calculados,
        tbase=cultivo.tbase,
        umbral=cultivo.umbral_madurez,
        fecha_inicio=fecha_siembra,
    )

    # ── 5. Fase actual (4 etapas) ────────────────────────────────
    fase_actual = gdd_service.determinar_fase(
        gdd_acumulado=gdd_acumulado,
        umbral_floracion=cultivo.umbral_floracion,
        umbral_madurez=cultivo.umbral_madurez,
    )

    # GDD promedio diario histórico
    gdd_promedio = round(gdd_acumulado / len(dias_calculados), 2) if dias_calculados else 8.0

    # Porcentaje de avance hacia floración
    porcentaje_avance = min(100.0, round((gdd_acumulado / cultivo.umbral_floracion) * 100, 1))

    # ── 6. Próxima fase ───────────────────────────────────────────
    umbral_prox = gdd_service.obtener_umbral_proxima_fase(
        fase_actual=fase_actual,
        umbral_floracion=cultivo.umbral_floracion,
        umbral_madurez=cultivo.umbral_madurez,
    )
    nombre_prox = gdd_service.obtener_nombre_proxima_fase(fase_actual)
    gdd_restante = max(0.0, round(umbral_prox - gdd_acumulado, 2))
    dias_restantes = gdd_service.estimar_dias_restantes(
        gdd_acumulado=gdd_acumulado,
        umbral_objetivo=umbral_prox,
        tbase=cultivo.tbase,
        gdd_promedio_diario=gdd_promedio,
    )
    fecha_estimada_prox_str = None
    if gdd_restante > 0 and gdd_promedio > 0:
        fecha_prox = gdd_service.estimar_fecha_futura(
            gdd_acumulado=gdd_acumulado,
            umbral_objetivo=umbral_prox,
            gdd_promedio_diario=gdd_promedio,
            desde=hoy,
        )
        fecha_estimada_prox_str = fecha_prox.isoformat() if fecha_prox else None

    proxima_fase_obj = None if nombre_prox == "completado" else ProximaFase(
        nombre=nombre_prox,
        gdd_necesario=round(umbral_prox, 2),
        gdd_restante=gdd_restante,
        dias_estimados=dias_restantes,
        fecha_estimada=fecha_estimada_prox_str,
    )

    # ── 7. Fechas estimadas hacia floración/madurez (futuras) ────
    # Si ya se superó, se usa la fecha histórica; si no, se proyecta
    if fecha_floracion:
        fecha_est_floracion = fecha_floracion.isoformat()
    else:
        proy_flor = gdd_service.estimar_fecha_futura(
            gdd_acumulado=gdd_acumulado,
            umbral_objetivo=cultivo.umbral_floracion,
            gdd_promedio_diario=gdd_promedio,
            desde=hoy,
        )
        fecha_est_floracion = proy_flor.isoformat() if proy_flor else None

    if fecha_madurez:
        fecha_est_madurez = fecha_madurez.isoformat()
    else:
        proy_mad = gdd_service.estimar_fecha_futura(
            gdd_acumulado=gdd_acumulado,
            umbral_objetivo=cultivo.umbral_madurez,
            gdd_promedio_diario=gdd_promedio,
            desde=hoy,
        )
        fecha_est_madurez = proy_mad.isoformat() if proy_mad else None

    dias_desde_siembra = (hoy - fecha_siembra).days

    # ── 8. Guardar/actualizar en BD ──────────────────────────────
    prediccion_bd = db.query(Prediccion).filter(
        Prediccion.siembra_id == siembra_id
    ).first()

    datos_extra = {
        "dias_desde_siembra": dias_desde_siembra,
        "porcentaje_avance": porcentaje_avance,
        "gdd_promedio_diario": gdd_promedio,
        "total_dias_datos": len(dias_calculados),
        "umbral_emergencia": UMBRAL_EMERGENCIA,
        "fuente_clima": fuente_primaria,
        "modelo_version": "gdd_v2",
    }

    if prediccion_bd:
        prediccion_bd.gdd_acumulado = gdd_acumulado
        prediccion_bd.fecha_estimada_floracion = fecha_floracion
        prediccion_bd.fecha_estimada_madurez = fecha_madurez
        prediccion_bd.fase_actual = fase_actual
        prediccion_bd.dias_restantes = dias_restantes
        prediccion_bd.datos_extra = datos_extra
    else:
        prediccion_bd = Prediccion(
            siembra_id=siembra_id,
            gdd_acumulado=gdd_acumulado,
            fecha_estimada_floracion=fecha_floracion,
            fecha_estimada_madurez=fecha_madurez,
            fase_actual=fase_actual,
            dias_restantes=dias_restantes,
            modelo_version="gdd_v2",
            datos_extra=datos_extra,
        )
        db.add(prediccion_bd)

    db.commit()
    db.refresh(prediccion_bd)

    logger.info(
        f"✅ Predicción guardada | GDD={gdd_acumulado} | Fase={fase_actual} "
        f"| Floración→{fecha_est_floracion} | Madurez→{fecha_est_madurez}"
    )

    # ── 9. Retornar respuesta ────────────────────────────────────
    return PrediccionResponse(
        siembra_id=siembra_id,
        nombre_cultivo=cultivo.nombre,
        nombre_parcela=parcela.nombre,
        gdd_acumulado=gdd_acumulado,
        gdd_promedio_diario=gdd_promedio,
        fase_actual=fase_actual,
        porcentaje_avance=porcentaje_avance,
        fecha_siembra=fecha_siembra.isoformat(),
        fecha_emergencia=fecha_emergencia.isoformat() if fecha_emergencia else None,
        fecha_floracion=fecha_floracion.isoformat() if fecha_floracion else None,
        fecha_madurez=fecha_madurez.isoformat() if fecha_madurez else None,
        fecha_estimada_floracion=fecha_est_floracion,
        fecha_estimada_madurez=fecha_est_madurez,
        dias_restantes=dias_restantes,
        proxima_fase=proxima_fase_obj,
        dias_desde_siembra=dias_desde_siembra,
        ultima_actualizacion=prediccion_bd.calculado_en,
        datos_clima=datos_clima_meta,
    )

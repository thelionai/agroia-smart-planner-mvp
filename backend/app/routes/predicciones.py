"""
routes/predicciones.py
──────────────────────
Endpoint principal: GET /prediccion/{siembra_id}

Orquesta el motor fenológico completo:
  clima → GDD → predicción → respuesta JSON
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.siembra import Siembra
from app.models.parcela import Parcela
from app.services import prediccion_service
from app.schemas.prediccion import PrediccionResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Predicciones"])


@router.get(
    "/prediccion/{siembra_id}",
    response_model=PrediccionResponse,
    summary="Obtener predicción fenológica",
    description="""
## GET /prediccion/{siembra_id}

Calcula y devuelve la predicción fenológica completa para una siembra.

**Motor de cálculo:**
- Obtiene datos climáticos históricos desde Open-Meteo (caché en BD)
- Calcula GDD diario: `GDD = max(((Tmax + Tmin) / 2) - Tbase, 0)`
- Acumula GDD desde la fecha de siembra hasta hoy
- Determina fase actual y fecha estimada de floración/madurez

**Respuesta incluye:**
- `gdd_acumulado`: GDD total desde la siembra
- `fecha_estimada_floracion`: Fecha YYYY-MM-DD estimada
- `dias_restantes`: Días hasta próxima fase
- `fase_actual`: vegetativa | floracion | madurez
""",
)
async def obtener_prediccion(
    siembra_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint principal del motor de predicción fenológica.
    """
    # Verificar propiedad de la siembra (vía parcela)
    siembra = db.query(Siembra).join(Parcela).filter(
        Siembra.id == siembra_id,
        Parcela.user_id == current_user.id
    ).first()
    
    if not siembra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Siembra no encontrada o acceso denegado."
        )

    try:
        resultado = await prediccion_service.calcular_prediccion(
            db=db,
            siembra_id=siembra_id,
        )
        return resultado

    except ValueError as e:
        logger.warning(f"⚠️ Dato no encontrado: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except RuntimeError as e:
        logger.error(f"❌ Error en servicio de predicción: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.exception(f"💥 Error inesperado en predicción siembra_id={siembra_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al calcular la predicción. Contacte al administrador."
        )

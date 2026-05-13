"""
app/routes/monitoring.py
────────────────────────
Nuevos endpoints para el Dashboard de Monitoreo en Vivo (Fase 4).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.parcela import Parcela
from app.models.siembra import Siembra
from app.services import prediccion_service, weather_service, ai_service
from app.schemas.prediccion import PrediccionResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Monitoreo en Vivo"])

# ─── Esquemas ───────────────────────────────────────────────────

class AIRecommendationRequest(BaseModel):
    cultivo: str
    fase: str
    gdd: int
    clima: str
    alertas: Optional[str] = "Ninguna"

class AIRecommendationResponse(BaseModel):
    recommendation: str

# ─── Endpoints ──────────────────────────────────────────────────

@router.get("/plots/{parcela_id}/growth", response_model=PrediccionResponse)
async def get_plot_growth(
    parcela_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna el estado de crecimiento de la parcela actual (Fase 4).
    Busca la siembra activa más reciente de esa parcela.
    """
    # Verificar propiedad de la parcela
    parcela = db.query(Parcela).filter(
        Parcela.id == parcela_id,
        Parcela.user_id == current_user.id
    ).first()
    
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada.")

    # Buscar la siembra activa (la última registrada)
    siembra = db.query(Siembra).filter(Siembra.parcela_id == parcela_id).order_by(Siembra.id.desc()).first()
    
    if not siembra:
        raise HTTPException(status_code=404, detail="No hay siembras activas en esta parcela.")

    return await prediccion_service.calcular_prediccion(db, siembra.id)

@router.get("/weather/current")
async def get_current_weather_unified(
    parcela_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint unificado para clima actual (Fase 4).
    """
    parcela = db.query(Parcela).filter(
        Parcela.id == parcela_id,
        Parcela.user_id == current_user.id
    ).first()
    
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada.")

    try:
        clima = await weather_service.get_current_weather(
            lat=parcela.latitud,
            lon=parcela.longitud,
            parcela_id=parcela_id,
            db=db
        )
        return {
            "parcela_id": parcela_id,
            "parcela_nombre": parcela.nombre,
            **clima
        }
    except Exception as e:
        logger.error(f"Error en weather/current: {e}")
        raise HTTPException(status_code=503, detail="Error al obtener clima real.")

@router.post("/ai/recommendation", response_model=AIRecommendationResponse)
async def get_ai_recommendation(
    req: AIRecommendationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint para RECS con Gemini 1.5 Pro (Fase 4).
    """
    recommendation = ai_service.obtener_recomendacion_agronomica(req.model_dump())
    return {"recommendation": recommendation}

"""
routes/siembras.py
──────────────────
Endpoint principal: POST /registrar-siembra

Registra una siembra y opcionalmente lanza el cálculo de predicción.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.siembra import Siembra
from app.models.parcela import Parcela
from app.models.cultivo import Cultivo
from app.schemas.siembra import SiembraCreate, SiembraResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Siembras"])


@router.post("/registrar-siembra", response_model=SiembraResponse, status_code=status.HTTP_201_CREATED)
def registrar_siembra(
    siembra_data: SiembraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ## POST /registrar-siembra

    Registra una nueva siembra en el sistema.

    El cálculo de predicción fenológica se realiza de forma separada
    mediante GET /prediccion/{siembra_id}.

    **Flujo recomendado:**
    1. `POST /users/register` → crear usuario
    2. `POST /parcelas` → registrar parcela con lat/lon
    3. `POST /cultivos` → registrar cultivo con Tbase y umbrales
    4. `POST /registrar-siembra` → registrar fecha de siembra ← estás aquí
    5. `GET /prediccion/{siembra_id}` → obtener predicción fenológica
    """
    # Verificar que la parcela existe y pertenece al usuario
    parcela = db.query(Parcela).filter(
        Parcela.id == siembra_data.parcela_id,
        Parcela.user_id == current_user.id
    ).first()
    if not parcela:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parcela no encontrada o acceso denegado."
        )

    # Verificar que el cultivo existe
    cultivo = db.query(Cultivo).filter(Cultivo.id == siembra_data.cultivo_id).first()
    if not cultivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cultivo con id={siembra_data.cultivo_id} no encontrado."
        )

    nueva_siembra = Siembra(
        parcela_id=siembra_data.parcela_id,
        cultivo_id=siembra_data.cultivo_id,
        fecha_siembra=siembra_data.fecha_siembra,
        notas=siembra_data.notas,
    )
    db.add(nueva_siembra)
    db.commit()
    db.refresh(nueva_siembra)

    logger.info(
        f"🌱 Siembra registrada → id={nueva_siembra.id} | "
        f"Parcela: '{parcela.nombre}' | Cultivo: '{cultivo.nombre}' | "
        f"Fecha: {nueva_siembra.fecha_siembra}"
    )
    return nueva_siembra


@router.get("/siembras", response_model=List[SiembraResponse])
def listar_siembras(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Devuelve las siembras asociadas a las parcelas del usuario actual."""
    return db.query(Siembra).join(Parcela).filter(Parcela.user_id == current_user.id).all()


@router.get("/siembras/{siembra_id}", response_model=SiembraResponse)
def obtener_siembra(siembra_id: int, db: Session = Depends(get_db)):
    """Devuelve una siembra específica por ID."""
    siembra = db.query(Siembra).filter(Siembra.id == siembra_id).first()
    if not siembra:
        raise HTTPException(status_code=404, detail=f"Siembra con id={siembra_id} no encontrada.")
    return siembra

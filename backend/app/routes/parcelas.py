"""
routes/parcelas.py
──────────────────
CRUD de parcelas agrícolas.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.parcela import Parcela
from app.models.user import User
from app.schemas.parcela import ParcelaCreate, ParcelaResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/parcelas", tags=["Parcelas"])


@router.post("/", response_model=ParcelaResponse, status_code=status.HTTP_201_CREATED)
def crear_parcela(
    parcela_data: ParcelaCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registra una nueva parcela vinculada al usuario autenticado."""
    nueva = Parcela(
        user_id=current_user.id,
        nombre=parcela_data.nombre,
        latitud=parcela_data.latitud,
        longitud=parcela_data.longitud,
        altitud=parcela_data.altitud,
        descripcion=parcela_data.descripcion,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    logger.info(f"📍 Parcela registrada para {current_user.email}: '{nueva.nombre}'")
    return nueva


@router.get("/", response_model=List[ParcelaResponse])
def listar_parcelas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Devuelve las parcelas del usuario actual."""
    return db.query(Parcela).filter(Parcela.user_id == current_user.id).all()


@router.get("/{parcela_id}", response_model=ParcelaResponse)
def obtener_parcela(
    parcela_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Devuelve una parcela específica si pertenece al usuario."""
    parcela = db.query(Parcela).filter(
        Parcela.id == parcela_id, 
        Parcela.user_id == current_user.id
    ).first()
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada o acceso denegado.")
    return parcela


@router.delete("/{parcela_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_parcela(
    parcela_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Elimina una parcela si pertenece al usuario."""
    parcela = db.query(Parcela).filter(
        Parcela.id == parcela_id, 
        Parcela.user_id == current_user.id
    ).first()
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada o acceso denegado.")
    db.delete(parcela)
    db.commit()
    logger.info(f"🗑️ Parcela eliminada: id={parcela_id} por {current_user.email}")

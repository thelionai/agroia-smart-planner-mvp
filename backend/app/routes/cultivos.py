"""
routes/cultivos.py
──────────────────
CRUD del catálogo de cultivos con parámetros fenológicos.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.models.cultivo import Cultivo
from app.schemas.cultivo import CultivoCreate, CultivoResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/cultivos", tags=["Cultivos"])


@router.post("/", response_model=CultivoResponse, status_code=status.HTTP_201_CREATED)
def crear_cultivo(cultivo_data: CultivoCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo cultivo con sus parámetros GDD.

    Ejemplo de Tbase y umbrales por cultivo:
    - Maíz:  Tbase=10°C, Floración=500 GDD, Madurez=1200 GDD
    - Trigo: Tbase=0°C,  Floración=500 GDD, Madurez=1500 GDD
    - Papa:  Tbase=7°C,  Floración=600 GDD, Madurez=1400 GDD
    """
    existente = db.query(Cultivo).filter(Cultivo.nombre == cultivo_data.nombre).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un cultivo con el nombre '{cultivo_data.nombre}'."
        )

    nuevo = Cultivo(
        nombre=cultivo_data.nombre,
        nombre_cientifico=cultivo_data.nombre_cientifico,
        tbase=cultivo_data.tbase,
        umbral_floracion=cultivo_data.umbral_floracion,
        umbral_madurez=cultivo_data.umbral_madurez,
        descripcion=cultivo_data.descripcion,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    logger.info(f"🌿 Cultivo registrado: '{nuevo.nombre}' Tbase={nuevo.tbase}°C")
    return nuevo


@router.get("/", response_model=List[CultivoResponse])
def listar_cultivos(db: Session = Depends(get_db)):
    """Devuelve el catálogo completo de cultivos disponibles."""
    return db.query(Cultivo).all()


@router.get("/{cultivo_id}", response_model=CultivoResponse)
def obtener_cultivo(cultivo_id: int, db: Session = Depends(get_db)):
    """Devuelve un cultivo específico por ID."""
    cultivo = db.query(Cultivo).filter(Cultivo.id == cultivo_id).first()
    if not cultivo:
        raise HTTPException(status_code=404, detail=f"Cultivo con id={cultivo_id} no encontrado.")
    return cultivo

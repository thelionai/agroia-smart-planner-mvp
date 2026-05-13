"""
schemas/cultivo.py
──────────────────
Esquemas para el catálogo de cultivos con parámetros fenológicos.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CultivoCreate(BaseModel):
    """Datos para registrar un cultivo con sus umbrales GDD."""
    nombre: str = Field(..., min_length=2, max_length=255, example="Maíz Amarillo Duro")
    nombre_cientifico: Optional[str] = Field(None, example="Zea mays")
    tbase: float = Field(..., ge=0, le=30, example=10.0,
                         description="Temperatura base en °C por debajo de la cual no hay crecimiento")
    umbral_floracion: float = Field(..., gt=0, example=500.0,
                                    description="GDD acumulados necesarios para floración")
    umbral_madurez: float = Field(..., gt=0, example=1200.0,
                                  description="GDD acumulados necesarios para madurez")
    descripcion: Optional[str] = Field(None)


class CultivoResponse(BaseModel):
    """Datos del cultivo devueltos al cliente."""
    id: int
    nombre: str
    nombre_cientifico: Optional[str]
    tbase: float
    umbral_floracion: float
    umbral_madurez: float
    descripcion: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

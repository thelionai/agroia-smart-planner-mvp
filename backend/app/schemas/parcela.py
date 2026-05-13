"""
schemas/parcela.py
──────────────────
Esquemas para registro y consulta de parcelas agrícolas.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class ParcelaCreate(BaseModel):
    """Datos para registrar una nueva parcela."""
    nombre: str = Field(..., min_length=2, max_length=255, example="Parcela Norte - Sector A")
    latitud: float = Field(..., ge=-90, le=90, example=-12.0464)
    longitud: float = Field(..., ge=-180, le=180, example=-77.0428)
    altitud: Optional[float] = Field(None, ge=0, le=9000, example=150.0)
    descripcion: Optional[str] = Field(None, max_length=500)

    @field_validator("latitud")
    @classmethod
    def validar_latitud(cls, v: float) -> float:
        if not (-90 <= v <= 90):
            raise ValueError("Latitud debe estar entre -90 y 90")
        return round(v, 6)

    @field_validator("longitud")
    @classmethod
    def validar_longitud(cls, v: float) -> float:
        if not (-180 <= v <= 180):
            raise ValueError("Longitud debe estar entre -180 y 180")
        return round(v, 6)


class ParcelaResponse(BaseModel):
    """Datos de una parcela devueltos al cliente."""
    id: int
    user_id: int
    nombre: str
    latitud: float
    longitud: float
    altitud: Optional[float]
    descripcion: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

"""
schemas/siembra.py
──────────────────
Esquemas para el registro de siembras.
"""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class SiembraCreate(BaseModel):
    """Datos para registrar una nueva siembra — endpoint POST /registrar-siembra."""
    parcela_id: int = Field(..., example=1, description="ID de la parcela donde se siembra")
    cultivo_id: int = Field(..., example=1, description="ID del cultivo a sembrar")
    fecha_siembra: date = Field(..., example="2024-03-15",
                                description="Fecha de siembra en formato YYYY-MM-DD")
    notas: Optional[str] = Field(None, max_length=1000,
                                 example="Variedad híbrida, riego por goteo")


class SiembraResponse(BaseModel):
    """Datos de la siembra registrada."""
    id: int
    parcela_id: int
    cultivo_id: int
    fecha_siembra: date
    notas: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

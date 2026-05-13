"""
schemas/user.py
───────────────
Esquemas Pydantic para validación de usuarios.
Separa datos de entrada (Create) de salida (Response) para mayor seguridad.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Datos requeridos para registrar un nuevo usuario."""
    nombre: str = Field(..., min_length=2, max_length=255, example="Juan Pérez")
    email: EmailStr = Field(..., example="juan@agroia.com")
    password: str = Field(..., min_length=8, example="contraseña_segura")


class UserLogin(BaseModel):
    """Credenciales de inicio de sesión."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Datos del usuario devueltos al cliente (nunca incluye password)."""
    id: int
    nombre: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # permite crear desde ORM model


class Token(BaseModel):
    """Token JWT de acceso."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Payload decodificado del token JWT."""
    user_id: Optional[int] = None
    email: Optional[str] = None

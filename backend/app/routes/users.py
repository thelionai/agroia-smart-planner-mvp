"""
routes/users.py
───────────────
Endpoints de autenticación y registro de usuarios.
JWT centralizado en app.core.security.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_user,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario con contraseña hasheada en bcrypt."""
    try:
        logger.debug(f"Intentando registrar: {user_data.email}")
        existente = db.query(User).filter(User.email == user_data.email).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un usuario con el email '{user_data.email}'.",
            )

        nuevo = User(
            email=user_data.email,
            nombre=user_data.nombre,
            hashed_password=hash_password(user_data.password),
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        logger.info(f"✅ Usuario registrado: {nuevo.email}")
        return nuevo
    except Exception as e:
        logger.error(f"❌ ERROR CRÍTICO EN REGISTRO: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Autentica un usuario y devuelve un token JWT firmado."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    logger.info(f"🔑 Login exitoso: {user.email}")
    return {"access_token": token, "token_type": "bearer"}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Perfil del usuario autenticado",
)
def obtener_mi_perfil(current_user: User = Depends(get_current_user)):
    """
    Retorna el perfil del usuario autenticado.
    Requiere: Authorization: Bearer <token>
    """
    return current_user

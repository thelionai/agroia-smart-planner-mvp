"""
app/core/security.py
─────────────────────
Autenticación JWT centralizada.

Expone:
  - get_current_user(token, db) → User  DI para endpoints protegidos
  - create_access_token(data)  → str
  - verify_password / hash_password
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.core.database import get_db

logger = logging.getLogger(__name__)

# ── Hashing ────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hashea una contraseña con bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica una contraseña contra su hash bcrypt."""
    return pwd_context.verify(plain, hashed)


# ── JWT ────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Genera un token JWT firmado.

    Args:
        data: Payload a incluir (debe tener 'sub')
        expires_delta: Tiempo de expiración (default: ACCESS_TOKEN_EXPIRE_MINUTES)
    """
    payload = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload["exp"] = expire
    payload["iat"] = datetime.utcnow()  # issued at
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ── Bearer scheme ──────────────────────────────────────────────────
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """
    Dependency de FastAPI para endpoints protegidos.
    Extrae y valida el token JWT del header Authorization: Bearer <token>.

    Ejemplo de uso:
        @router.get("/me")
        def perfil(user = Depends(get_current_user)):
            return user
    """
    from app.models.user import User  # import local evita circular

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado. Proporcione un token JWT válido.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    token = credentials.credentials

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"🔐 Token JWT inválido: {e}")
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """
    Como get_current_user, pero retorna None si no hay token.
    Para endpoints que funcionan autenticados O anónimos.
    """
    if credentials is None:
        return None
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None

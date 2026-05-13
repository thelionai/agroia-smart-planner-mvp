"""
core/database.py
────────────────
Engine SQLAlchemy + Session + Base declarativa.
`get_db()` es el dependency de FastAPI para inyectar sesión en cada request.

Soporta:
  - SQLite  →  DATABASE_URL=sqlite:///./agroia.db  (desarrollo local)
  - PostgreSQL → postgresql://...                  (producción)
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Configuración del motor según tipo de BD ──────────────────────
IS_SQLITE = settings.DATABASE_URL.startswith("sqlite")

if IS_SQLITE:
    # SQLite: StaticPool para single-thread (dev/testing)
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=(settings.ENVIRONMENT == "development"),
    )
    logger.info("🟡 Usando SQLite (modo desarrollo local)")
else:
    # PostgreSQL: pool real para producción
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=(settings.ENVIRONMENT == "development"),
    )
    logger.info("🟢 Usando PostgreSQL (modo producción)")

# Fábrica de sesiones
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base para todos los modelos ORM
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency de FastAPI.
    Provee una sesión de BD por request y la cierra al terminar.

    Uso en un endpoint:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Error en sesión de BD: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_tables():
    """Crea todas las tablas (útil en dev sin Alembic)."""
    from app.models import user, parcela, cultivo, siembra, clima_diario, prediccion  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tablas creadas/verificadas en la base de datos.")

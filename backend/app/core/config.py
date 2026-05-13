"""
core/config.py
──────────────
Configuración centralizada usando pydantic-settings.
Lee variables del archivo .env automáticamente.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ─── Base de datos ───────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/agroia_db"

    # ─── Seguridad JWT ───────────────────────────────────────────
    SECRET_KEY: str = "desarrollo_local_cambiar_en_produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ─── Entorno ─────────────────────────────────────────────────
    ENVIRONMENT: str = "development"

    # ─── API Climática ───────────────────────────────────────────
    CLIMA_API: str = "open-meteo"

    # ─── IA Gemini ───────────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Instancia única cacheada de la configuración (singleton)."""
    return Settings()


settings = get_settings()

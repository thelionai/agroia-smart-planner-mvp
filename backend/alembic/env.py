"""
alembic/env.py
──────────────
Punto de entrada de Alembic. Conecta los modelos ORM con el sistema
de migraciones y lee la DATABASE_URL desde .env (mismo que la app).

Soporta dos modos:
  - offline: genera SQL sin conectar a la BD
  - online:  conecta directamente y aplica migraciones
"""
import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Agregar /backend al path para importar la app ────────────────
# Necesario para que Alembic encuentre los modelos
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import Base

# Importar TODOS los modelos para que Alembic los detecte automáticamente
from app.models import user, parcela, cultivo, siembra, clima_diario, prediccion  # noqa: F401

# ── Configuración de Alembic ─────────────────────────────────────
config = context.config

# Configurar logging desde alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Sobrescribir DATABASE_URL con la variable de entorno (no hardcodear en .ini)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Base con todos los metadatos de los modelos ORM
target_metadata = Base.metadata


# ──────────────────────────────────────────────────────────────────
# Modo OFFLINE — genera SQL estático sin conectar a la BD
# Útil para revisar migraciones antes de aplicar
# ──────────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,         # detecta cambios de tipo de columna
        compare_server_default=True,  # detecta cambios en defaults
    )

    with context.begin_transaction():
        context.run_migrations()


# ──────────────────────────────────────────────────────────────────
# Modo ONLINE — conecta a la BD y aplica migraciones en tiempo real
# ──────────────────────────────────────────────────────────────────
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # sin pool en migraciones
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ── Ejecutar según el modo ────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

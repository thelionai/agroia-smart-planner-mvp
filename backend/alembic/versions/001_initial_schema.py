"""
Migración inicial — crea las 6 tablas del esquema AGROIA.

Revision ID: 001_initial
Revises: (ninguna — es la primera migración)
Create Date: 2026-02-20
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Crea todas las tablas del esquema AGROIA."""

    # ── Tabla: users ─────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("nombre", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    # ── Tabla: cultivos ───────────────────────────────────────────
    op.create_table(
        "cultivos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=255), nullable=False),
        sa.Column("nombre_cientifico", sa.String(length=255), nullable=True),
        sa.Column("tbase", sa.Float(), nullable=False),
        sa.Column("umbral_floracion", sa.Float(), nullable=False),
        sa.Column("umbral_madurez", sa.Float(), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_cultivos_id"), "cultivos", ["id"], unique=False)
    op.create_index(op.f("ix_cultivos_nombre"), "cultivos", ["nombre"], unique=True)

    # ── Tabla: parcelas ───────────────────────────────────────────
    op.create_table(
        "parcelas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=255), nullable=False),
        sa.Column("latitud", sa.Float(), nullable=False),
        sa.Column("longitud", sa.Float(), nullable=False),
        sa.Column("altitud", sa.Float(), nullable=True),
        sa.Column("descripcion", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_parcelas_id"), "parcelas", ["id"], unique=False)

    # ── Tabla: siembras ───────────────────────────────────────────
    op.create_table(
        "siembras",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("parcela_id", sa.Integer(), nullable=False),
        sa.Column("cultivo_id", sa.Integer(), nullable=False),
        sa.Column("fecha_siembra", sa.Date(), nullable=False),
        sa.Column("notas", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["cultivo_id"], ["cultivos.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["parcela_id"], ["parcelas.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_siembras_id"), "siembras", ["id"], unique=False)

    # ── Tabla: clima_diario ───────────────────────────────────────
    op.create_table(
        "clima_diario",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("parcela_id", sa.Integer(), nullable=False),
        sa.Column("fecha", sa.Date(), nullable=False),
        sa.Column("tmax", sa.Float(), nullable=False),
        sa.Column("tmin", sa.Float(), nullable=False),
        sa.Column("tmean", sa.Float(), nullable=True),
        sa.Column("precipitacion", sa.Float(), nullable=True),
        sa.Column("radiacion", sa.Float(), nullable=True),
        sa.Column("fuente", sa.String(length=50), nullable=True, server_default="open-meteo"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["parcela_id"], ["parcelas.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("parcela_id", "fecha", name="uq_clima_parcela_fecha"),
    )
    op.create_index(op.f("ix_clima_diario_id"), "clima_diario", ["id"], unique=False)

    # ── Tabla: predicciones ───────────────────────────────────────
    op.create_table(
        "predicciones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("siembra_id", sa.Integer(), nullable=False),
        sa.Column("gdd_acumulado", sa.Float(), nullable=False),
        sa.Column("fecha_estimada_floracion", sa.Date(), nullable=True),
        sa.Column("fecha_estimada_madurez", sa.Date(), nullable=True),
        sa.Column("dias_restantes", sa.Integer(), nullable=True),
        sa.Column("fase_actual", sa.String(length=50), nullable=False, server_default="vegetativa"),
        sa.Column("modelo_version", sa.String(length=50), nullable=False, server_default="gdd_v1"),
        sa.Column("datos_extra", sa.JSON(), nullable=True),
        sa.Column("calculado_en", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("actualizado_en", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["siembra_id"], ["siembras.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("siembra_id"),
    )
    op.create_index(op.f("ix_predicciones_id"), "predicciones", ["id"], unique=False)


def downgrade() -> None:
    """Elimina todas las tablas (revierte la migración inicial)."""
    op.drop_table("predicciones")
    op.drop_table("clima_diario")
    op.drop_table("siembras")
    op.drop_table("parcelas")
    op.drop_table("cultivos")
    op.drop_table("users")

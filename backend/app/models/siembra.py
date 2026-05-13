"""
models/siembra.py
─────────────────
Tabla `siembras` — registro de un cultivo en una parcela con fecha de inicio.
Es el nodo central que conecta parcela + cultivo + predicciones.
"""
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Siembra(Base):
    __tablename__ = "siembras"

    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)
    cultivo_id = Column(Integer, ForeignKey("cultivos.id", ondelete="RESTRICT"), nullable=False)
    fecha_siembra = Column(Date, nullable=False)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="siembras")
    cultivo = relationship("Cultivo", back_populates="siembras")
    predicciones = relationship("Prediccion", back_populates="siembra", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Siembra id={self.id} parcela_id={self.parcela_id} fecha={self.fecha_siembra}>"

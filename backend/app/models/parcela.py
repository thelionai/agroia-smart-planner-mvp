"""
models/parcela.py
─────────────────
Tabla `parcelas` — campo agrícola con geolocalización.
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Parcela(Base):
    __tablename__ = "parcelas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String(255), nullable=False)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    altitud = Column(Float, nullable=True)  # metros sobre nivel del mar
    descripcion = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    owner = relationship("User", back_populates="parcelas")
    siembras = relationship("Siembra", back_populates="parcela", cascade="all, delete-orphan")
    datos_clima = relationship("ClimaDiario", back_populates="parcela", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parcela id={self.id} nombre={self.nombre} lat={self.latitud} lon={self.longitud}>"

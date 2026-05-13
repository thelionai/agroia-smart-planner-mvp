"""
models/cultivo.py
─────────────────
Tabla `cultivos` — catálogo de cultivos con parámetros fenológicos.
Tbase y umbrales GDD son los parámetros clave del motor de predicción.
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Cultivo(Base):
    __tablename__ = "cultivos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), unique=True, index=True, nullable=False)
    nombre_cientifico = Column(String(255), nullable=True)

    # Parámetros del motor GDD
    tbase = Column(Float, nullable=False, comment="Temperatura base en °C")
    umbral_floracion = Column(Float, nullable=False, comment="GDD acumulados para floración")
    umbral_madurez = Column(Float, nullable=False, comment="GDD acumulados para madurez")

    descripcion = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    siembras = relationship("Siembra", back_populates="cultivo")

    def __repr__(self):
        return f"<Cultivo id={self.id} nombre={self.nombre} Tbase={self.tbase}>"

"""
models/prediccion.py
────────────────────
Tabla `predicciones` — resultados del motor fenológico por siembra.
Preparada para futuro retraining con ML (incluye campo modelo_version).
"""
from sqlalchemy import Column, Integer, Float, Date, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Prediccion(Base):
    __tablename__ = "predicciones"

    id = Column(Integer, primary_key=True, index=True)
    siembra_id = Column(Integer, ForeignKey("siembras.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Resultados del motor GDD
    gdd_acumulado = Column(Float, nullable=False)
    fecha_estimada_floracion = Column(Date, nullable=True)
    fecha_estimada_madurez = Column(Date, nullable=True)
    dias_restantes = Column(Integer, nullable=True)
    fase_actual = Column(String(50), nullable=False, default="vegetativa")
    # Valores posibles: "vegetativa" | "floracion" | "madurez"

    # Metadatos para ML futuro
    modelo_version = Column(String(50), default="gdd_v1", nullable=False)
    datos_extra = Column(JSON, nullable=True, comment="Campo flexible para métricas adicionales")

    calculado_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizado_en = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    siembra = relationship("Siembra", back_populates="predicciones")

    def __repr__(self):
        return f"<Prediccion siembra_id={self.siembra_id} fase={self.fase_actual} gdd={self.gdd_acumulado}>"

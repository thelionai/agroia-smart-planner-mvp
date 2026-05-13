"""
models/clima_diario.py
──────────────────────
Tabla `clima_diario` — datos climáticos históricos por parcela y fecha.
Actúa como caché: si ya existe el dato, no se vuelve a consultar la API.
"""
from sqlalchemy import Column, Integer, Float, Date, ForeignKey, DateTime, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ClimaDiario(Base):
    __tablename__ = "clima_diario"

    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)
    fecha = Column(Date, nullable=False)

    # Datos climáticos
    tmax = Column(Float, nullable=False, comment="Temperatura máxima en °C")
    tmin = Column(Float, nullable=False, comment="Temperatura mínima en °C")
    tmean = Column(Float, nullable=True, comment="Temperatura media en °C")
    precipitacion = Column(Float, nullable=True, comment="Precipitación en mm")
    radiacion = Column(Float, nullable=True, comment="Radiación solar en MJ/m²")

    # Metadatos de la fuente
    fuente = Column(String(50), default="open-meteo", comment="Fuente: open-meteo | nasa-power")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="datos_clima")

    # Restricción única: un dato por parcela y fecha
    __table_args__ = (
        UniqueConstraint("parcela_id", "fecha", name="uq_clima_parcela_fecha"),
    )

    def __repr__(self):
        return f"<ClimaDiario parcela_id={self.parcela_id} fecha={self.fecha} tmax={self.tmax} tmin={self.tmin}>"

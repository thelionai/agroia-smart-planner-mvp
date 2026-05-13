"""
services/iot_service.py
───────────────────────
Stub del servicio IoT — sensores agrícolas en campo.

Arquitectura preparada para integración con:
  - Sensores de humedad del suelo (capacitivos/resistivos)
  - Estaciones meteorológicas locales (Davis, Campbell)
  - Protocolos: MQTT, LoRaWAN, HTTP POST desde microcontroladores
  - Plataformas: AWS IoT Core, ThingsBoard, Thinger.io

Estado actual: IOT_NOT_CONNECTED
El frontend mostrará el estado de conectividad del sensor.

Para integrar sensores reales:
  1. Configurar broker MQTT (mosquitto o AWS IoT)
  2. Definir topics por parcela/sensor: agroia/{parcela_id}/{sensor_type}
  3. Implementar subscriber que escriba en BD tabla `iot_readings`
  4. Este servicio consultará la tabla en lugar del stub
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def get_soil_moisture(sensor_id: str, parcela_id: Optional[int] = None) -> dict:
    """
    Retorna humedad del suelo desde sensor IoT.

    Args:
        sensor_id: Identificador del sensor (e.g., "SENSOR-001")
        parcela_id: ID de la parcela asociada (opcional)

    Returns:
        {
            "status": "iot_not_connected",
            "sensor_id": str,
            "parcela_id": int | None,
            "moisture_percent": None,
            "depth_cm": None,
            "temperature_soil": None,
            "last_reading": None,
            "protocol": str,
        }
    """
    logger.debug(f"Humedad del suelo solicitada — sensor={sensor_id}, parcela={parcela_id}")

    return {
        "status": "iot_not_connected",
        "sensor_id": sensor_id,
        "parcela_id": parcela_id,
        "moisture_percent": None,
        "depth_cm": None,
        "temperature_soil": None,
        "last_reading": None,
        "protocol": "MQTT / LoRaWAN",
        "roadmap": (
            "Integración planificada: sensores capacitivos de humedad + "
            "microcontroladores ESP32 con protocolo MQTT sobre LoRaWAN."
        ),
    }


def get_all_sensors(parcela_id: int) -> dict:
    """
    Retorna todos los sensores registrados para una parcela.
    Stub — vacío hasta integración real.
    """
    logger.debug(f"Sensores solicitados para parcela_id={parcela_id}")

    return {
        "status": "iot_not_connected",
        "parcela_id": parcela_id,
        "sensors": [],
        "message": "No hay sensores IoT registrados para esta parcela.",
    }


def get_microclimate(parcela_id: int) -> dict:
    """
    Retorna microclima local desde estación en campo.
    Stub — pendiente integración con estación meteorológica.
    """
    logger.debug(f"Microclima solicitado para parcela_id={parcela_id}")

    return {
        "status": "iot_not_connected",
        "parcela_id": parcela_id,
        "temperature": None,
        "humidity": None,
        "wind_speed": None,
        "solar_radiation": None,
        "last_reading": None,
        "message": "Estación meteorológica local no conectada.",
    }

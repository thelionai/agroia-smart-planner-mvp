/**
 * src/services/iotService.js
 * ──────────────────────────
 * FUTURE: Sensores IoT (humedad, temperatura, pH de suelo)
 *
 * Arquitectura preparada para:
 *   - MQTT broker (HiveMQ, AWS IoT Core)
 *   - REST API de dispositivos Sentec / Agrosmart / GroPoint
 *   - Webhooks de sensores de campo
 *
 * Estado actual: STUB — retorna datos simulados para demo.
 */

/**
 * Obtiene datos del sensor de suelo más cercano a una parcela.
 * @param {string} sensorId - ID del sensor
 * @returns {Promise<{disponible: boolean, datos: object|null, mensaje: string}>}
 */
export const obtenerDatosSensor = async (sensorId) => {
    // TODO: POST to MQTT broker or GET from IoT REST endpoint
    // const broker = import.meta.env.VITE_IOT_BROKER_URL;

    return {
        disponible: false,
        datos: null,
        mensaje: 'Sensores IoT en desarrollo — connect via MQTT',
        sensorId,
    };
};

/**
 * Lista los sensores disponibles para una parcela.
 * @param {number} parcelaId
 */
export const listarSensores = async (parcelaId) => {
    return {
        sensores: [],
        disponible: false,
        mensaje: 'Sin sensores IoT registrados para esta parcela',
    };
};

/**
 * Simula un read de sensor para el dashboard cuando IoT no está disponible.
 * Basado en datos de clima real (weatherEnricher) como proxy.
 */
export const simularSensor = (climaData) => {
    if (!climaData) return null;
    return {
        temperatura_suelo: +(climaData.temp * 0.85).toFixed(1), // suelo ~ 85% del aire
        humedad_suelo: climaData.humedad,
        ph_estimado: 6.5, // neutral por defecto
        conductividad: null,
        ultimo_read: new Date().toISOString(),
        fuente: 'estimado-clima',
    };
};

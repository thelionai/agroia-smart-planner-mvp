/**
 * src/services/ndviService.js
 * ────────────────────────────
 * FUTURE: Integración satelital NDVI
 *
 * Arquitectura preparada para:
 *   - NASA POWER API (datos históricos de vegetación)
 *   - Sentinel-2 vía Sentinel Hub / Copernicus
 *   - Google Earth Engine API
 *
 * Estado actual: STUB — retorna datos simulados para demo.
 */

/**
 * Obtiene el índice NDVI para una parcela.
 * @param {number} lat
 * @param {number} lon
 * @param {string} fecha - "YYYY-MM-DD"
 * @returns {Promise<{ndvi: number|null, disponible: boolean, fuente: string, mensaje: string}>}
 */
export const obtenerNDVI = async (lat, lon, fecha = null) => {
    // TODO: conectar a Earth Engine API o Sentinel Hub
    // const resp = await axios.get('https://services.sentinel-hub.com/...', { ... });

    // DEMO: valor simulado basado en época del año
    const mes = new Date(fecha || Date.now()).getMonth(); // 0-11
    const ndviSimulado = mes >= 3 && mes <= 9
        ? +(0.4 + Math.random() * 0.35).toFixed(3) // verano → más vegetación
        : +(0.15 + Math.random() * 0.25).toFixed(3); // invierno → menos

    return {
        ndvi: ndviSimulado,
        disponible: false, // false = es simulado
        fuente: 'simulado',
        mensaje: 'Integración satelital en desarrollo — dato simulado',
        clasificacion: ndviSimulado > 0.6 ? 'Vegetación densa'
            : ndviSimulado > 0.3 ? 'Vegetación moderada'
                : 'Vegetación escasa',
    };
};

/**
 * Detecta posible estrés hídrico a partir de NDVI histórico.
 * FUTURE: comparar NDVI actual vs. baseline histórico.
 */
export const detectarEstresHidrico = async (lat, lon) => {
    return {
        deteccion: false,
        nivel: 'normal',
        mensaje: 'Análisis de estrés hídrico satelital en desarrollo',
    };
};

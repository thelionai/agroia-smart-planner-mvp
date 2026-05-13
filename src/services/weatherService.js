/**
 * src/services/weatherService.js
 * ──────────────────────────────
 * Arquitectura para integración con servicios meteorológicos (Open-Meteo/AccuWeather).
 * [FASE 3 - PREPARACIÓN]
 */
import api from './api';

export const weatherService = {
    /**
     * Obtiene el pronóstico extendido de una parcela.
     */
    getForecast: async (parcelaId) => {
        console.log("[Weather Service] Arquitectura lista. Llamando al backend...");
        return api.get(`/weather/${parcelaId}`);
    }
};

export default weatherService;

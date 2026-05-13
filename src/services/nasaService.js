/**
 * src/services/nasaService.js
 * ───────────────────────────
 * Arquitectura para integración con NASA POWER API.
 * [FASE 3 - PREPARACIÓN]
 */
import api from './api';

export const nasaService = {
    /**
     * Obtiene datos de irradiancia o insolación solar.
     * Reservado para futuras implementaciones de salud de cultivos.
     */
    getInsolationData: async (lat, lon) => {
        console.log("[NASA Service] Arquitectura lista. Esperando activación de API.");
        // return api.get(`/nasa/insolation?lat=${lat}&lon=${lon}`);
        return null;
    }
};

export default nasaService;

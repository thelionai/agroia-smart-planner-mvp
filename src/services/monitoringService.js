/**
 * src/services/monitoringService.js
 * ───────────────────────────────────
 * Servicios específicos para el Dashboard de Monitoreo en Vivo (Fase 4).
 */
import api from './api';

/**
 * Obtiene el estado de crecimiento unificado de una parcela.
 * @param {number} parcelaId 
 */
export const obtenerCrecimientoParcela = async (parcelaId) => {
    const response = await api.get(`/plots/${parcelaId}/growth`);
    return response.data;
};

/**
 * Obtiene el clima actual filtrado por parcela.
 * @param {number} parcelaId 
 */
export const obtenerClimaActual = async (parcelaId) => {
    const response = await api.get(`/weather/current?parcela_id=${parcelaId}`);
    return response.data;
};

/**
 * Solicita una recomendación agronómica a Gemini 3.1 Pro.
 * @param {Object} contexto { cultivo, fase, gdd, clima, alertas }
 */
export const obtenerRecomendacionIA = async (contexto) => {
    const response = await api.post('/ai/recommendation', contexto);
    return response.data;
};

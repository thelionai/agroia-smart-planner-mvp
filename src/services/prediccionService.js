/**
 * src/services/prediccionService.js
 * ───────────────────────────────────
 * Todas las llamadas al backend relacionadas con el motor fenológico GDD.
 *
 * Funciones exportadas:
 *   - registrarSiembra(data)          → POST /registrar-siembra
 *   - obtenerPrediccion(siembraId)    → GET  /prediccion/{id}
 *   - listarCultivos()                → GET  /cultivos
 *   - crearCultivo(data)              → POST /cultivos
 *   - listarParcelas()                → GET  /parcelas
 *   - crearParcela(data)              → POST /parcelas
 *   - listarSiembras()                → GET  /siembras
 */
import api from './api';

// ──────────────────────────────────────────────────────────────────
// SIEMBRAS
// ──────────────────────────────────────────────────────────────────

/**
 * Registra una nueva siembra.
 * @param {{ parcela_id: number, cultivo_id: number, fecha_siembra: string, notas?: string }} data
 * @returns {Promise<{ id: number, parcela_id: number, cultivo_id: number, fecha_siembra: string }>}
 */
export const registrarSiembra = async (data) => {
    const response = await api.post('/registrar-siembra', data);
    return response.data;
};

export const listarSiembras = async () => {
    const response = await api.get('/siembras');
    return response.data;
};

// ──────────────────────────────────────────────────────────────────
// PREDICCIONES — Motor fenológico GDD
// ──────────────────────────────────────────────────────────────────

/**
 * Obtiene la predicción fenológica completa para una siembra.
 *
 * Respuesta:
 * {
 *   gdd_acumulado: number,
 *   fecha_estimada_floracion: "YYYY-MM-DD",
 *   dias_restantes: number,
 *   fase_actual: "vegetativa" | "floracion" | "madurez",
 *   nombre_cultivo: string,
 *   porcentaje_avance: number,
 *   ...
 * }
 */
export const obtenerPrediccion = async (siembraId) => {
    const response = await api.get(`/prediccion/${siembraId}`);
    return response.data;
};

// ──────────────────────────────────────────────────────────────────
// CULTIVOS
// ──────────────────────────────────────────────────────────────────

export const listarCultivos = async () => {
    const response = await api.get('/cultivos');
    return response.data;
};

/**
 * Crea un nuevo cultivo en el catálogo.
 * @param {{ nombre: string, tbase: number, umbral_floracion: number, umbral_madurez: number }} data
 */
export const crearCultivo = async (data) => {
    const response = await api.post('/cultivos', data);
    return response.data;
};

// ──────────────────────────────────────────────────────────────────
// PARCELAS
// ──────────────────────────────────────────────────────────────────

export const listarParcelas = async () => {
    const response = await api.get('/parcelas');
    return response.data;
};

/**
 * Registra una nueva parcela.
 * @param {{ nombre: string, latitud: number, longitud: number, altitud?: number }} data
 */
export const crearParcela = async (data) => {
    const response = await api.post('/parcelas', data);
    return response.data;
};

// ──────────────────────────────────────────────────────────────────
// USUARIOS
// ──────────────────────────────────────────────────────────────────

export const registrarUsuario = async ({ nombre, email, password }) => {
    const response = await api.post('/users/register', { nombre, email, password });
    return response.data;
};

export const loginUsuario = async ({ email, password }) => {
    const response = await api.post('/users/login', { email, password });
    // Guardar token en localStorage
    if (response.data.access_token) {
        localStorage.setItem('agroia_token', response.data.access_token);
    }
    return response.data;
};

export const cerrarSesion = () => {
    localStorage.removeItem('agroia_token');
};

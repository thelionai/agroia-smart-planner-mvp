/**
 * src/services/api.js
 * ───────────────────
 * Cliente Axios centralizado para comunicarse con el backend FastAPI.
 *
 * - Base URL configurable por variable de entorno (Vite usa VITE_ prefix)
 * - Interceptor de request: adjunta token JWT automáticamente
 * - Interceptor de response: manejo centralizado de errores
 *
 * Uso:
 *   import api from '../services/api';
 *   const res = await api.get('/cultivos');
 */
import axios from 'axios';

// En desarrollo: http://localhost:8000
// En producción: URL de Render/Railway (configurar en .env del frontend)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Interceptor de request: adjunta JWT si existe ────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('agroia_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Interceptor de response: normaliza errores ───────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        // Token expirado o inválido → limpiar sesión y forzar relogin
        if (status === 401) {
            console.warn("[API] Sesión expirada o no autorizada. Limpiando...");
            localStorage.removeItem('agroia_token');
            localStorage.removeItem('agroia_authenticated');
            localStorage.removeItem('agroia_user_email');
            window.location.reload(); // Forma sencilla de resetear el estado de App
        }

        const mensaje = detail || error.message || 'Error de conexión con el servidor';
        return Promise.reject(new Error(mensaje));
    }
);

export default api;

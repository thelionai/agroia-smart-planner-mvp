/**
 * src/services/weatherEnricher.js
 * ─────────────────────────────────
 * Enriquecedor de datos climáticos — v2 (arquitectura correcta).
 *
 * CAMBIO FUNDAMENTAL:
 *   ❌ Antes: llamaba Open-Meteo directamente desde el frontend
 *   ✅ Ahora: llama al backend propio → backend consume Open-Meteo
 *
 * El frontend solo habla con localhost:8000 (o el dominio propio en prod).
 * Nunca habla con APIs externas directamente.
 *
 * Para consumir datos climáticos, usa la función de este módulo
 * o importa directamente desde weatherService.js.
 */
import { getWeatherByParcela, getForecastByParcela } from './weatherService';

/**
 * Obtiene clima actual + proyección enriquecida para una parcela.
 *
 * v1: recibía (lat, lon) → llamaba Open-Meteo directo
 * v2: recibe (parcelaId) → llama backend → backend llama Open-Meteo
 *
 * @param {number} parcelaId - ID de la parcela en la BD
 * @returns {Promise<{
 *   temp: number,
 *   temp_max_hoy: number,
 *   temp_min_hoy: number,
 *   humedad: number,
 *   lluvia_hoy: number,
 *   lluvia_5dias: number,
 *   viento: number,
 *   riesgo_helada: number,
 *   ultimo_update: string,
 *   source: 'cache' | 'open-meteo',
 * }>}
 */
export async function obtenerClimaActual(parcelaId) {
    try {
        // Obtener clima actual del backend (incluye caché inteligente)
        const weather = await getWeatherByParcela(parcelaId);

        // Obtener pronóstico 5 días para enriquecer con lluvia acumulada
        let lluvia5dias = 0;
        let riesgoHelada = 0.05;

        try {
            const forecast = await getForecastByParcela(parcelaId, 5);
            const dias = forecast.forecast || [];

            // Lluvia acumulada próximos 5 días
            lluvia5dias = dias.reduce((acc, d) => acc + (d.precipitation || 0), 0);
            lluvia5dias = Math.round(lluvia5dias * 10) / 10;

            // Riesgo helada: si algún día tiene tmin < 3°C
            const diasFrios = dias.filter(d => d.tmin !== null && d.tmin < 3);
            riesgoHelada = dias.length > 0
                ? Math.round((diasFrios.length / dias.length) * 100) / 100
                : 0.05;
        } catch (_forecastErr) {
            // Si falla el pronóstico, continuamos con lo que tenemos
            console.warn('[weatherEnricher] No se pudo obtener pronóstico:', _forecastErr.message);
        }

        // Humedad estimada de suelo: humedad relativa + factor lluvia
        const humedadSuelo = Math.min(
            95,
            Math.round(weather.humidity * 0.7 + lluvia5dias * 0.5)
        );

        return {
            // Temperatura
            temp: weather.temperature,
            temp_max_hoy: weather.tmax,
            temp_min_hoy: weather.tmin,
            // Humedad
            humedad: humedadSuelo,
            humedad_relativa: weather.humidity,
            // Lluvia
            lluvia_hoy: weather.rain_probability / 100 * 5, // estimación mm/dia
            lluvia_5dias: lluvia5dias,
            // Viento
            viento: Math.round(weather.wind_speed),
            // Riesgo
            riesgo_helada: riesgoHelada,
            // Metadatos
            ultimo_update: new Date().toISOString(),
            source: weather.source,
        };

    } catch (err) {
        console.error('[weatherEnricher] Error obteniendo clima del backend:', err.message);

        // Fallback con defaults seguros — no rompe la UI si el backend no está levantado
        return {
            temp: 18, temp_max_hoy: 22, temp_min_hoy: 12,
            humedad: 65, humedad_relativa: 70,
            lluvia_hoy: 0, lluvia_5dias: 15,
            viento: 10, riesgo_helada: 0.05,
            ultimo_update: new Date().toISOString(),
            source: 'fallback',
            fallback: true,
        };
    }
}

/**
 * Calcula ventana óptima de siembra en días.
 * Función pura — sin llamadas externas.
 * Compatible con v1.
 *
 * @param {{ lluvia5dias: number, temp: number, temp_optima?: number, optima_siembra_lunar?: boolean }} params
 */
export function calcularVentanaOptima({
    lluvia5dias,
    temp,
    temp_optima = 18,
    optima_siembra_lunar = false,
}) {
    const condTemp = Math.abs(temp - temp_optima) <= 5;
    const condLluvia = lluvia5dias >= 10 && lluvia5dias <= 50;

    if (condTemp && condLluvia && optima_siembra_lunar) {
        return { dias: '1-3', nivel: 'optimo', mensaje: 'Condiciones ideales detectadas' };
    }
    if (condTemp && condLluvia) {
        return { dias: '3-7', nivel: 'bueno', mensaje: 'Condiciones favorables' };
    }
    if (condTemp || condLluvia) {
        return { dias: '7-14', nivel: 'moderado', mensaje: 'Esperar mejores condiciones' };
    }
    return { dias: '+15', nivel: 'riesgo', mensaje: 'Condiciones adversas — no recomendado' };
}

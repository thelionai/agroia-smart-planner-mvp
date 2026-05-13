/**
 * src/hooks/useAgroData.js
 * ────────────────────────
 * Hook especializado para el Dashboard de Monitoreo en Vivo.
 * Maneja estados reactivos, carga de datos y recomendaciones de IA.
 */
import { useState, useCallback, useEffect } from 'react';
import {
    obtenerCrecimientoParcela,
    obtenerClimaActual,
    obtenerRecomendacionIA
} from '../services/monitoringService';

export function useAgroData(parcelaId) {
    const [growth, setGrowth] = useState(null);
    const [weather, setWeather] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recsLoading, setRecsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!parcelaId) return;
        setLoading(true);
        setError(null);
        try {
            const [growthData, weatherData] = await Promise.all([
                obtenerCrecimientoParcela(parcelaId),
                obtenerClimaActual(parcelaId)
            ]);
            setGrowth(growthData);
            setWeather(weatherData);
        } catch (err) {
            console.error("Error fetching agro data:", err);
            setError(err.message || "Error al sincronizar con la biósfera");
        } finally {
            setLoading(false);
        }
    }, [parcelaId]);

    const getAIAdvice = async () => {
        if (!growth || !weather) return;
        setRecsLoading(true);
        try {
            const contexto = {
                cultivo: growth.nombre_cultivo,
                fase: growth.fase_actual,
                gdd: Math.round(growth.gdd_acumulado),
                clima: `${weather.temperature}°C, ${weather.humidity}% hum`,
                alertas: "Ninguna detectada"
            };
            const data = await obtenerRecomendacionIA(contexto);
            setRecommendation(data.recommendation);
        } catch (err) {
            setRecommendation("Error al conectar con Gemini. Revise su conexión.");
        } finally {
            setRecsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        growth,
        weather,
        recommendation,
        loading,
        recsLoading,
        error,
        refetch: fetchData,
        getAIAdvice
    };
}

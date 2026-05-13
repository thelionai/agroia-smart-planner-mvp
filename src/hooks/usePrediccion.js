/**
 * src/hooks/usePrediccion.js
 * ──────────────────────────
 * Hook reutilizable para obtener y gestionar predicciones fenológicas.
 *
 * Uso:
 *   const { prediccion, loading, error, refetch } = usePrediccion(siembraId);
 */
import { useState, useEffect, useCallback } from 'react';
import { obtenerPrediccion } from '../services/prediccionService';

/**
 * @param {number|null} siembraId - ID de la siembra. Si es null, no hace fetch.
 * @param {boolean} autoFetch - Si true, hace fetch automáticamente al montar.
 */
export function usePrediccion(siembraId, autoFetch = true) {
    const [prediccion, setPrediccion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!siembraId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await obtenerPrediccion(siembraId);
            setPrediccion(data);
        } catch (err) {
            setError(err.message || 'Error al obtener predicción');
        } finally {
            setLoading(false);
        }
    }, [siembraId]);

    useEffect(() => {
        if (autoFetch) fetch();
    }, [fetch, autoFetch]);

    return { prediccion, loading, error, refetch: fetch };
}

/**
 * Hook para cargar listas (cultivos, parcelas, siembras).
 * @param {Function} serviceFn - función async que devuelve un array
 */
export function useListado(serviceFn) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resultado = await serviceFn();
            setData(resultado);
        } catch (err) {
            setError(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [serviceFn]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { data, loading, error, refetch: cargar };
}

/**
 * src/components/ui/WeatherWidget.jsx
 * ─────────────────────────────────────
 * Strip compacto de clima auto-fetched para una parcela.
 * Llama al backend AGROIA → backend consulta Open-Meteo.
 * El frontend NUNCA llama APIs externas directamente.
 *
 * Props:
 *   parcelaId (number) — ID de la parcela en la BD
 *   minimal   (bool)   — versión de una sola línea (para listas)
 */
import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, CloudRain, Wind, Loader2, AlertTriangle } from 'lucide-react';
import { obtenerClimaActual } from '../../services/weatherEnricher';

export function WeatherWidget({ parcelaId, minimal = false }) {
    const [clima, setClima] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!parcelaId) { setLoading(false); return; }
        let cancelled = false;

        (async () => {
            try {
                const data = await obtenerClimaActual(parcelaId);
                if (!cancelled) { setClima(data); setLoading(false); }
            } catch {
                if (!cancelled) { setError(true); setLoading(false); }
            }
        })();

        return () => { cancelled = true; };
    }, [parcelaId]);

    if (!parcelaId) return null;

    if (loading) {
        return (
            <div className="flex items-center gap-1.5 text-agro-muted text-xs py-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Obteniendo clima...</span>
            </div>
        );
    }

    if (error || !clima) return null;

    const metrics = [
        { icon: Thermometer, value: `${clima.temp}°C`, color: '#FF8800', label: 'Temp' },
        { icon: Droplets, value: `${clima.humedad}%`, color: '#00C9FF', label: 'Humedad' },
        { icon: CloudRain, value: `${clima.lluvia_5dias}mm`, color: '#0066FF', label: '5d' },
        { icon: Wind, value: `${clima.viento}km/h`, color: '#00FF87', label: 'Viento' },
    ];

    if (minimal) {
        return (
            <div className="flex items-center gap-3 flex-wrap">
                {metrics.map(({ icon: Icon, value, color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                        <Icon className="w-3 h-3" style={{ color }} />
                        <span className="text-[11px] font-semibold" style={{ color }}>{value}</span>
                    </div>
                ))}
                {clima.riesgo_helada > 0.2 && (
                    <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-[11px] text-red-400 font-bold">Helada</span>
                    </div>
                )}
            </div>
        );
    }

    // Full card
    return (
        <div className="glass-green rounded-xl p-3 mt-2 animate-fade-up">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[10px] font-bold uppercase tracking-widest text-agro-green">
                    Clima actual · {clima.source === 'cache' ? 'Caché BD' : 'Open-Meteo'}
                </p>
                {clima.fallback && (
                    <span className="text-[10px] text-yellow-400">datos estimados</span>
                )}
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2">
                {metrics.map(({ icon: Icon, value, color, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 glass-dark rounded-lg p-2">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-xs font-bold text-agro-text">{value}</span>
                        <span className="text-[9px] text-agro-muted">{label}</span>
                    </div>
                ))}
            </div>

            {clima.riesgo_helada > 0.25 && (
                <div className="mt-2 flex items-center gap-2 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-300 font-semibold">
                        Riesgo de helada {Math.round(clima.riesgo_helada * 100)}% próximos 3 días
                    </span>
                </div>
            )}
        </div>
    );
}

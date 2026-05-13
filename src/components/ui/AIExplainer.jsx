/**
 * src/components/ui/AIExplainer.jsx
 * ───────────────────────────────────
 * Panel "¿Por qué esta recomendación?" — Motor Analítico
 *
 * Muestra los datos que el motor GDD usó para calcular la predicción,
 * con estilo de terminal científica / sistema analítico real.
 *
 * Props:
 *   prediccion  (object) — datos de GET /prediccion/{id}
 *   clima       (object) — datos de weatherEnricher
 *   indice      (object) — resultado de agroiaScore
 *   open        (bool)   — visible o no
 *   onClose     (fn)     — callback para cerrar
 */
import React from 'react';
import { X, Brain, Thermometer, Droplets, TrendingUp, Calendar, AlertTriangle, Database } from 'lucide-react';

const Row = ({ icon: Icon, label, value, color = '#00FF87', mono = false }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${color}15` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[11px] text-agro-muted uppercase tracking-wide font-medium">{label}</p>
            <p className={`text-sm font-semibold text-agro-text mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
    </div>
);

const fmt = (str) => {
    if (!str) return '—';
    return new Date(str + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

export function AIExplainer({ prediccion, clima, indice, open, onClose }) {
    if (!open || !prediccion) return null;

    const prox = prediccion.proxima_fase;
    const climaData = prediccion.datos_clima;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-lg glass-dark rounded-t-3xl border-t border-x border-white/10
                            max-h-[85vh] overflow-y-auto animate-fade-up">

                {/* Header */}
                <div className="sticky top-0 glass-dark border-b border-white/8 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-agro-green/15 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-agro-green" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-agro-text font-display">Motor Analítico GDD</h2>
                            <p className="text-[11px] text-agro-muted">¿Por qué esta recomendación?</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4 text-agro-muted" />
                    </button>
                </div>

                <div className="px-5 pb-8 pt-4 space-y-5">

                    {/* Sección: Fenología */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-agro-green">
                                Fenología
                            </span>
                            <div className="flex-1 h-px bg-agro-green/20" />
                        </div>
                        <div className="glass-card rounded-xl px-4">
                            <Row icon={TrendingUp} label="GDD Acumulado"
                                value={`${prediccion.gdd_acumulado} GDD (${prediccion.gdd_promedio_diario} GDD/día promedio)`}
                                color="#00FF87" mono />
                            <Row icon={Calendar} label="Fase Actual"
                                value={`${prediccion.fase_actual?.toUpperCase()} — ${prediccion.porcentaje_avance}% hacia floración`}
                                color="#00FF87" />
                            <Row icon={Calendar} label="Días desde siembra"
                                value={`${prediccion.dias_desde_siembra} días (sembrado: ${fmt(prediccion.fecha_siembra)})`}
                                color="#00CC6A" />
                            {prox && prox.nombre !== 'completado' && (
                                <Row icon={TrendingUp} label="Próxima fase"
                                    value={`${prox.nombre?.toUpperCase()} en ~${prox.dias_estimados ?? '?'} días — faltan ${prox.gdd_restante} GDD`}
                                    color="#00C9FF" />
                            )}
                        </div>
                    </div>

                    {/* Sección: Fechas estimadas */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-agro-teal">
                                Proyecciones
                            </span>
                            <div className="flex-1 h-px bg-agro-teal/20" />
                        </div>
                        <div className="glass-card rounded-xl px-4">
                            <Row icon={Calendar} label="Floración estimada"
                                value={fmt(prediccion.fecha_estimada_floracion)} color="#00C9FF" />
                            <Row icon={Calendar} label="Madurez estimada"
                                value={fmt(prediccion.fecha_estimada_madurez)} color="#FFD700" />
                        </div>
                    </div>

                    {/* Sección: Datos climáticos usados */}
                    {climaData && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-agro-gold">
                                    Datos Climáticos
                                </span>
                                <div className="flex-1 h-px bg-agro-gold/20" />
                            </div>
                            <div className="glass-card rounded-xl px-4">
                                <Row icon={Database} label="Total días analizados"
                                    value={`${climaData.total_dias} días`} color="#FFD700" mono />
                                <Row icon={Database} label="Fuente de datos"
                                    value={`${climaData.dias_desde_cache} días desde caché · ${climaData.dias_desde_api} días desde API`}
                                    color="#FFD700" />
                                <Row icon={Database} label="Proveedor"
                                    value="Open-Meteo Historical API (ERA5-Land)" color="#FF8800" mono />
                            </div>
                        </div>
                    )}

                    {/* Sección: Condiciones actuales (si hay clima) */}
                    {clima && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                                    Condiciones Actuales
                                </span>
                                <div className="flex-1 h-px bg-orange-400/20" />
                            </div>
                            <div className="glass-card rounded-xl px-4">
                                <Row icon={Thermometer} label="Temperatura"
                                    value={`${clima.temp}°C (máx ${clima.temp_max_hoy}°C / mín ${clima.temp_min_hoy}°C)`}
                                    color="#FF8800" />
                                <Row icon={Droplets} label="Humedad suelo estimada"
                                    value={`${clima.humedad}% (HR: ${clima.humedad_relativa}%)`} color="#00C9FF" mono />
                                {clima.riesgo_helada > 0.1 && (
                                    <Row icon={AlertTriangle} label="⚠️ Riesgo de helada"
                                        value={`${Math.round(clima.riesgo_helada * 100)}% probabilidad próximos 3 días`}
                                        color="#FF4444" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer: disclaimer */}
                    <div className="glass-card rounded-xl p-3 text-center">
                        <p className="text-[11px] text-agro-muted">
                            Motor GDD v2 · Datos Open-Meteo ERA5-Land · Actualizado{' '}
                            {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

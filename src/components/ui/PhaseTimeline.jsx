/**
 * src/components/ui/PhaseTimeline.jsx
 * ─────────────────────────────────────
 * Timeline horizontal de las 4 fases fenológicas.
 *
 * Props:
 *   fase_actual       (string) — fase actual del cultivo
 *   porcentaje_avance (number) — porcentaje de avance GDD
 *   fecha_siembra     (string) — "YYYY-MM-DD"
 *   fecha_floracion   (string) — "YYYY-MM-DD" estimada
 *   fecha_madurez     (string) — "YYYY-MM-DD" estimada
 *   proxima_fase      (object) — { nombre, fecha_estimada }
 */
import React from 'react';
import { Check, Sprout, Leaf, Sun, Award } from 'lucide-react';

const FASES_CONFIG = [
    { id: 'emergencia', label: 'Emergencia', emoji: '🌱', icon: Sprout, color: '#00C9FF', colorDim: 'rgba(0,201,255,0.15)' },
    { id: 'vegetativo', label: 'Vegetativo', emoji: '🍃', icon: Leaf, color: '#00FF87', colorDim: 'rgba(0,255,135,0.15)' },
    { id: 'floracion', label: 'Floración', emoji: '🌸', icon: Sun, color: '#FFD700', colorDim: 'rgba(255,215,0,0.15)' },
    { id: 'madurez', label: 'Madurez', emoji: '🌾', icon: Award, color: '#FF8800', colorDim: 'rgba(255,136,0,0.15)' },
];

const ORDEN = ['emergencia', 'vegetativo', 'floracion', 'madurez'];

const fmtShort = (str) => {
    if (!str) return null;
    return new Date(str + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

export function PhaseTimeline({
    fase_actual = 'vegetativo',
    porcentaje_avance = 0,
    fecha_siembra,
    fecha_floracion,
    fecha_madurez,
    proxima_fase,
}) {
    const currentIdx = ORDEN.indexOf(fase_actual);

    return (
        <div className="glass-card rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-agro-muted">
                    Timeline Fenológico
                </h3>
                <span className="text-[11px] text-agro-green font-semibold">
                    {porcentaje_avance}% → floración
                </span>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-5 right-5 h-px bg-white/10" />
                {/* Progress fill */}
                <div
                    className="absolute top-5 left-5 h-px transition-all duration-1000"
                    style={{
                        width: `${Math.min(100, (currentIdx / 3) * 100 + (porcentaje_avance / 3))}%`,
                        background: 'linear-gradient(90deg, #00C9FF, #00FF87)',
                        maxWidth: 'calc(100% - 40px)',
                    }}
                />

                {/* Phase nodes */}
                <div className="relative flex justify-between">
                    {FASES_CONFIG.map((fase, idx) => {
                        const completed = idx < currentIdx;
                        const active = idx === currentIdx;
                        const future = idx > currentIdx;

                        const FaseIcon = fase.icon;

                        return (
                            <div key={fase.id} className="flex flex-col items-center gap-2" style={{ width: '25%' }}>
                                {/* Node */}
                                <div
                                    className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                                    style={{
                                        background: active
                                            ? fase.color
                                            : completed
                                                ? fase.colorDim
                                                : 'rgba(255,255,255,0.04)',
                                        border: `2px solid ${active ? fase.color : completed ? fase.color + '60' : 'rgba(255,255,255,0.10)'}`,
                                        boxShadow: active ? `0 0 16px ${fase.color}60` : 'none',
                                    }}
                                >
                                    {completed ? (
                                        <Check className="w-4 h-4 text-agro-navy" />
                                    ) : (
                                        <FaseIcon
                                            className="w-4 h-4"
                                            style={{ color: active ? '#0A0F1E' : future ? 'rgba(255,255,255,0.2)' : fase.color }}
                                        />
                                    )}
                                    {/* Active pulse */}
                                    {active && (
                                        <div
                                            className="absolute inset-0 rounded-full animate-ping opacity-30"
                                            style={{ background: fase.color }}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="text-center">
                                    <p
                                        className="text-[11px] font-bold leading-tight"
                                        style={{ color: active ? fase.color : future ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)' }}
                                    >
                                        {fase.label}
                                    </p>
                                    {/* Date below node */}
                                    <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                        {idx === 0 && fmtShort(fecha_siembra)}
                                        {idx === 2 && fmtShort(fecha_floracion)}
                                        {idx === 3 && fmtShort(fecha_madurez)}
                                        {idx === 1 && active && proxima_fase?.fecha_estimada && fmtShort(proxima_fase.fecha_estimada)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status bar */}
            <div className="mt-4 glass-dark rounded-xl px-3 py-2.5 flex items-center gap-2">
                <div className="dot-live" />
                <span className="text-[11px] text-agro-muted">
                    Fase actual:{' '}
                    <span className="font-bold text-agro-text">
                        {FASES_CONFIG[currentIdx]?.emoji}{' '}
                        {FASES_CONFIG[currentIdx]?.label}
                    </span>
                    {proxima_fase?.nombre && proxima_fase.nombre !== 'completado' && (
                        <> · Próximo: <span className="text-agro-teal font-medium">{proxima_fase.nombre}</span> en ~{proxima_fase.dias_estimados ?? '?'} días</>
                    )}
                </span>
            </div>
        </div>
    );
}

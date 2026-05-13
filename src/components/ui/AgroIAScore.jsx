/**
 * src/components/ui/AgroIAScore.jsx
 * ───────────────────────────────────
 * Indicador circular animado del Índice AgroIA (0-100).
 *
 * Props:
 *   score    (number) — 0 a 100
 *   nivel    (string) — "Óptimo" | "Moderado" | "Riesgo" | "Crítico"
 *   color    (string) — hex del color del nivel
 *   factores (array)  — array de factores con label/texto/ok/score
 *   compact  (bool)   — versión pequeña para dashboard KPI
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~283

export function AgroIAScore({ score = 0, nivel = 'Moderado', color = '#00FF87', factores = [], compact = false }) {
    const [expanded, setExpanded] = useState(false);

    // SVG arc: offset=283 (empty) → 0 (full). Mapped to score.
    const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r={RADIUS} fill="none"
                            stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                        <circle cx="50" cy="50" r={RADIUS} fill="none"
                            stroke={color} strokeWidth="10"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black font-display" style={{ color }}>{score}</span>
                    </div>
                </div>
                <div>
                    <div className="text-xs font-bold text-agro-text">{score}/100</div>
                    <div className="text-[10px] font-medium" style={{ color }}>{nivel}</div>
                </div>
            </div>
        );
    }

    // Full version
    return (
        <div className="glass-card rounded-2xl p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-agro-muted">Índice AgroIA</h3>
                    <p className="text-[10px] text-agro-muted mt-0.5">Motor de inteligencia agrícola</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${nivel === 'Óptimo' ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                        : nivel === 'Moderado' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30'
                            : nivel === 'Riesgo' ? 'bg-orange-900/50 text-orange-400 border border-orange-500/30'
                                : 'bg-red-900/50 text-red-400 border border-red-500/30'
                    }`}>{nivel}</span>
            </div>

            {/* SVG Ring */}
            <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {/* Track */}
                        <circle cx="50" cy="50" r={RADIUS} fill="none"
                            stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                        {/* Progress */}
                        <circle cx="50" cy="50" r={RADIUS} fill="none"
                            stroke={color} strokeWidth="10"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{
                                filter: `drop-shadow(0 0 6px ${color}80)`,
                                transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
                            }}
                        />
                    </svg>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black font-display leading-none" style={{ color }}>
                            {score}
                        </span>
                        <span className="text-[10px] text-agro-muted font-medium">/ 100</span>
                    </div>
                </div>

                {/* Factor summaries */}
                <div className="flex-1 space-y-1.5">
                    {factores.map((f) => (
                        <div key={f.label} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.ok ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span className="text-[11px] text-agro-muted flex-1 truncate">{f.label}</span>
                            <span className="text-[11px] font-bold" style={{ color: f.ok ? '#00FF87' : '#FF8800' }}>
                                {f.score}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expand factores */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-agro-muted hover:text-agro-text transition-colors py-2 border-t border-white/5"
            >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Ocultar' : 'Ver'} análisis detallado
            </button>

            {expanded && (
                <div className="mt-3 space-y-2.5 animate-fade-up">
                    {factores.map((f) => (
                        <div key={f.label} className="glass-dark rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-agro-text">{f.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-agro-muted">{f.peso}</span>
                                    <span className="text-xs font-bold" style={{ color: f.ok ? '#00FF87' : '#FF8800' }}>
                                        {f.score}pts
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${f.score}%`,
                                        background: f.ok ? '#00FF87' : '#FF8800',
                                    }}
                                />
                            </div>
                            <p className="text-[11px] text-agro-muted mt-1.5">{f.texto}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

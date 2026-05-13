/**
 * src/components/PrediccionCard.jsx
 * ───────────────────────────────────
 * Card visual del motor fenológico GDD — 4 fases.
 *
 * Consume la respuesta de GET /prediccion/{siembra_id} (backend v2):
 *   fase_actual: "emergencia" | "vegetativo" | "floracion" | "madurez"
 *   proxima_fase: { nombre, gdd_restante, dias_estimados, fecha_estimada }
 *   datos_clima: { fuente_primaria, total_dias }
 *
 * Props:
 *   siembraId  (number) — ID de la siembra a predecir
 *   compact    (bool)   — Versión compacta para listas
 */
import React from 'react';
import {
    Sprout, Sun, CheckCircle, Clock, TrendingUp,
    Loader2, AlertCircle, RefreshCw, Leaf, Database, Wifi
} from 'lucide-react';
import { usePrediccion } from '../hooks/usePrediccion';

// ── Mapa de 4 fases ───────────────────────────────────────────────
const FASES = {
    emergencia: {
        label: 'Emergencia',
        color: 'from-sky-400 to-blue-500',
        bgLight: 'bg-sky-50',
        textColor: 'text-sky-700',
        badge: 'bg-sky-100 text-sky-800',
        icon: Sprout,
        emoji: '🌱',
        desc: 'Germinación en progreso',
    },
    vegetativo: {
        label: 'Vegetativo',
        color: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800',
        icon: Leaf,
        emoji: '🍃',
        desc: 'Crecimiento de biomasa',
    },
    floracion: {
        label: 'Floración',
        color: 'from-yellow-400 to-orange-500',
        bgLight: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: Sun,
        emoji: '🌸',
        desc: 'Floración activa',
    },
    madurez: {
        label: 'Madurez',
        color: 'from-orange-500 to-red-600',
        bgLight: 'bg-orange-50',
        textColor: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800',
        icon: CheckCircle,
        emoji: '🌾',
        desc: 'Listo para cosecha',
    },
};

// ── Helpers ───────────────────────────────────────────────────────
const fmt = (str) => {
    if (!str) return '—';
    return new Date(str + 'T12:00:00').toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const labelFase = (nombre) => FASES[nombre]?.label || nombre;

// ── Componente ────────────────────────────────────────────────────
export function PrediccionCard({ siembraId, compact = false }) {
    const { prediccion, loading, error, refetch } = usePrediccion(siembraId);

    // Cargando
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-3 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-sm font-medium">Calculando predicción fenológica...</span>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-red-700">Error al obtener predicción</p>
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                    <button
                        onClick={refetch}
                        className="mt-3 text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" /> Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!prediccion) return null;

    const fase = FASES[prediccion.fase_actual] || FASES.vegetativo;
    const FaseIcon = fase.icon;
    const pct = Math.min(100, prediccion.porcentaje_avance || 0);
    const prox = prediccion.proxima_fase;
    const clima = prediccion.datos_clima;

    // ── Compacto ─────────────────────────────────────────────────
    if (compact) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-gray-500">{prediccion.nombre_cultivo}</p>
                    <p className="font-semibold text-gray-800 text-sm">{prediccion.gdd_acumulado} GDD</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${fase.badge}`}>
                    {fase.emoji} {fase.label}
                </span>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Floración</p>
                    <p className="text-xs font-medium text-gray-700">{fmt(prediccion.fecha_estimada_floracion)}</p>
                </div>
            </div>
        );
    }

    // ── Completo ──────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* ── Header con fase ── */}
            <div className={`bg-gradient-to-r ${fase.color} p-5 text-white`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaseIcon className="w-5 h-5" />
                        <span className="font-bold text-lg">{prediccion.nombre_cultivo}</span>
                    </div>
                    <span className="text-xs bg-white/20 rounded-full px-3 py-1 font-semibold">
                        {fase.emoji} {fase.label}
                    </span>
                </div>
                <p className="text-sm opacity-80 mt-1">
                    {prediccion.nombre_parcela && (
                        <span>{prediccion.nombre_parcela} · </span>
                    )}
                    Sembrado el {fmt(prediccion.fecha_siembra)} · {prediccion.dias_desde_siembra} días
                </p>
                <p className="text-xs opacity-70 mt-0.5 italic">{fase.desc}</p>
            </div>

            {/* ── GDD + Barra de progreso ── */}
            <div className="p-5 border-b border-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium">GDD Acumulado</span>
                        {prediccion.gdd_promedio_diario && (
                            <span className="text-xs text-gray-400">
                                ({prediccion.gdd_promedio_diario} GDD/día promedio)
                            </span>
                        )}
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{prediccion.gdd_acumulado}</span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full bg-gradient-to-r ${fase.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{pct}% hacia floración</p>
            </div>

            {/* ── Próxima fase ── */}
            {prox && prox.nombre !== 'completado' && (
                <div className={`mx-5 mt-4 ${fase.bgLight} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${fase.textColor}`} />
                            <span className={`text-xs font-bold uppercase tracking-wide ${fase.textColor}`}>
                                Próxima fase: {labelFase(prox.nombre)}
                            </span>
                        </div>
                        <button
                            onClick={refetch}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Actualizar predicción"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-lg font-bold text-gray-800">{prox.gdd_restante}</p>
                            <p className="text-xs text-gray-500">GDD restantes</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-800">
                                {prox.dias_estimados ?? '—'}
                            </p>
                            <p className="text-xs text-gray-500">días estimados</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{fmt(prox.fecha_estimada)}</p>
                            <p className="text-xs text-gray-500">fecha estimada</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Fechas de floración / madurez ── */}
            <div className="p-5 grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-700">Floración estimada</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{fmt(prediccion.fecha_estimada_floracion)}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-700">Madurez estimada</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{fmt(prediccion.fecha_estimada_madurez)}</p>
                </div>
            </div>

            {/* ── Fuente de datos climáticos ── */}
            {clima && (
                <div className="px-5 pb-5">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-500">
                        {clima.fuente_primaria === 'cache'
                            ? <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <Wifi className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        }
                        <span>
                            <span className="font-semibold text-gray-700">{clima.total_dias} días</span> de datos climáticos
                            {' · '}fuente:{' '}
                            <span className={`font-medium ${clima.fuente_primaria === 'cache' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                {clima.fuente_primaria}
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

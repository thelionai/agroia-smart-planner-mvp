import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Thermometer, Droplets, CloudRain, Wind, Zap,
    Sparkles, Brain, ShieldAlert, History, MapPin,
    ArrowRight, Loader2, Gauge, Activity
} from 'lucide-react';

export const DashboardMonitor = ({ growth, weather, recommendation, loading, recsLoading, onAIRequest, onAction }) => {

    // Skeleton Loader Component
    const CardSkeleton = () => (
        <div className="glass-card bg-white/5 border border-white/10 rounded-[24px] p-6 animate-pulse">
            <div className="flex justify-between mb-4">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="h-10 w-10 bg-white/10 rounded-full"></div>
            </div>
            <div className="h-8 w-3/4 bg-white/10 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-white/10 rounded-xl"></div>
                <div className="h-12 bg-white/10 rounded-xl"></div>
            </div>
        </div>
    );

    if (loading && !growth) {
        return (
            <div className="space-y-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        );
    }

    const activeGdd = growth?.gdd_acumulado || 0;
    const progressPercent = growth?.porcentaje_avance || 0;

    return (
        <div className="space-y-6">
            {/* 1. Tarjeta de Crecimiento Vegetativo (Live Monitor) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[28px] p-6 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
                {/* Neon Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF7F]/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[#00FF7F]/15 transition-all"></div>

                <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF7F] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF7F]"></span>
                            </span>
                            <span className="text-[10px] font-black text-[#00FF7F] uppercase tracking-[0.2em]">Monitoreo en Tiempo Real</span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {growth?.nombre_cultivo || "Buscando cultivo..."}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            Fase: <span className="text-white">{growth?.fase_actual || "---"}</span>
                        </p>
                    </div>

                    {/* Gauge Visual */}
                    <div className="relative size-20 flex items-center justify-center">
                        <svg className="size-full -rotate-90">
                            <circle className="text-white/5" cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="6" />
                            <motion.circle
                                initial={{ strokeDashoffset: 213.6 }}
                                animate={{ strokeDashoffset: 213.6 * (1 - progressPercent / 100) }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="text-[#00FF7F]" cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="213.6" strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-lg font-black text-white">{Math.round(progressPercent)}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-[#00FF7F]/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <Gauge className="size-3 text-[#00FF7F]" />
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">GDD Acumulados</p>
                        </div>
                        <p className="text-2xl font-black text-white">{activeGdd} <span className="text-[10px] text-slate-500 font-normal">pts</span></p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-[#00FF7F]/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <History className="size-3 text-[#00FF7F]" />
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Próxima Fase</p>
                        </div>
                        <p className="text-sm font-bold text-[#00FF7F]">{growth?.proxima_fase?.nombre || "Finalizado"}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Est. {growth?.proxima_fase?.fecha_estimada || "N/A"}</p>
                    </div>
                </div>
            </motion.div>

            {/* 2. Quick Control Grid */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'alertas', label: 'Alertas', icon: ShieldAlert, color: 'bg-red-500/10 text-red-500 border-red-500/10' },
                    { id: 'recs', label: 'Recs IA', icon: Brain, color: 'bg-[#00FF7F]/10 text-[#00FF7F] border-[#00FF7F]/10', isRecs: true },
                    { id: 'historial', label: 'Historial', icon: History, color: 'bg-blue-500/10 text-blue-500 border-blue-500/10' }
                ].map((action) => (
                    <button
                        key={action.id}
                        onClick={() => action.isRecs ? onAIRequest() : (onAction && onAction(action.id))}
                        disabled={action.isRecs && recsLoading}
                        className={`flex flex-col items-center justify-center py-5 px-2 rounded-[24px] border backdrop-blur-md active:scale-95 transition-all relative overflow-hidden group ${action.color}`}
                    >
                        {action.isRecs && recsLoading ? (
                            <Loader2 className="size-6 mb-2 animate-spin" />
                        ) : (
                            <action.icon className="size-6 mb-2 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-tighter">{recsLoading && action.isRecs ? 'Analizando...' : action.label}</span>
                    </button>
                ))}
            </div>

            {/* 3. IA Insights Panel */}
            <AnimatePresence>
                {(recsLoading || recommendation) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#00FF7F]/5 border border-[#00FF7F]/20 rounded-[24px] p-5 relative overflow-hidden"
                    >
                        {recsLoading ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-[#00FF7F] animate-pulse" />
                                    <div className="h-3 w-32 bg-[#00FF7F]/20 rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-[#00FF7F]/10 rounded animate-pulse"></div>
                                    <div className="h-2 w-2/3 bg-[#00FF7F]/10 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <div className="bg-[#00FF7F] p-2 rounded-xl h-fit">
                                    <Sparkles className="text-agro-navy size-4" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-[#00FF7F] uppercase tracking-widest mb-1">Diagnóstico Gemini 3.1 Pro</h4>
                                    <p className="text-xs leading-relaxed text-slate-200 font-medium">
                                        {recommendation}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. Live Weather Tape */}
            <div className="pt-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                    <Zap className="size-3 text-[#00FF7F]" /> Atmosfera Local
                </h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                    {[
                        { label: 'Temp', val: `${weather?.temperature || '--'}°C`, icon: Thermometer, color: 'text-orange-400' },
                        { label: 'Hum', val: `${weather?.humidity || '--'}%`, icon: Droplets, color: 'text-blue-400' },
                        { label: 'Viento', val: `${weather?.wind_speed || '--'}km/h`, icon: Wind, color: 'text-slate-400' },
                        { label: 'Lluvia', val: `${weather?.rain_probability || '--'}%`, icon: CloudRain, color: 'text-[#00FF7F]' }
                    ].map((item, i) => (
                        <div key={i} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-[20px] p-4 w-28 backdrop-blur-md flex flex-col items-center group hover:border-[#00FF7F]/30 transition-all">
                            <item.icon className={`size-5 mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{item.label}</p>
                            <p className="text-sm font-black text-white mt-0.5">{item.val}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

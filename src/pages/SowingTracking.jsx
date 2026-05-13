import React from 'react';
import { motion } from 'framer-motion';
import {
    ChevronRight, Zap, Brain, Sparkles,
    Droplets, Thermometer, Activity, Leaf,
    History, ShieldAlert
} from 'lucide-react';

export const SowingTracking = ({ sowing = {}, onBack }) => {
    // Use mock data if sowing is not fully populated for demo
    const data = {
        cultivo: sowing.cultivo_nombre || 'Corn Hybrid',
        parcela: sowing.parcela_nombre || 'Sector A-12',
        gdd: sowing.gdd_acumulado || 842,
        phase: 'Vegetative V3',
        ...sowing
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 pb-24"
        >
            {/* 1. Cockpit Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="size-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                    <ChevronRight className="rotate-180 size-5 text-slate-400" />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-white uppercase tracking-widest leading-none">{data.cultivo}</h1>
                    <p className="text-[10px] text-agro-green font-bold tracking-tighter mt-1">MONITOREO ACTIVO</p>
                </div>
                <div className="size-10 bg-agro-green/10 border border-agro-green/30 rounded-xl flex items-center justify-center">
                    <Zap className="text-agro-green size-4 fill-agro-green/20" />
                </div>
            </div>

            {/* 2. Phase Monitoring Card */}
            <div className="glass-card bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-agro-green/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>

                <div className="flex justify-between items-end mb-6">
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Estado de Crecimiento</span>
                        <h2 className="text-2xl font-black text-white leading-none mt-2">{data.phase === 'Vegetative V3' ? 'Vegetativa V3' : data.phase}</h2>
                    </div>
                    <div className="bg-agro-green/10 px-3 py-2 rounded-xl border border-agro-green/20">
                        <span className="text-sm font-black text-agro-green">{data.gdd} <span className="text-[9px] opacity-70">GDD</span></span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            className="h-full bg-agro-green shadow-[0_0_15px_#00ff87]"
                        ></motion.div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                        <span>Siembra</span>
                        <span className="text-agro-green">65% del ciclo medio</span>
                        <span>Cosecha</span>
                    </div>
                </div>
            </div>

            {/* 3. AI Predictive Insights */}
            <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 flex items-center gap-2">
                    <Brain className="size-3 text-agro-green" /> Análisis Biológico
                </h3>
                <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] relative group backdrop-blur-md">
                    <Sparkles className="absolute top-4 right-4 size-4 text-agro-green/40 animate-pulse" />
                    <p className="text-[11px] leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                        Fase de alta demanda hídrica detectada. La ventana óptima de fertilización cierra en <span className="text-agro-green font-bold">14 horas</span>. Transición a fase V4 acelerada en +1.2 días.
                    </p>
                </div>
            </div>

            {/* 4. Real-time Nodes (Grid) */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Metabolismo', val: 'Óptimo', icon: Activity, color: 'text-agro-green' },
                    { label: 'Biósfera', val: 'Riesgo Bajo', icon: ShieldAlert, color: 'text-agro-blue' },
                    { label: 'Humedad', val: '64%', icon: Droplets, color: 'text-agro-blue' },
                    { label: 'Temp', val: '24°C', icon: Thermometer, color: 'text-orange-400' }
                ].map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[24px] p-4 backdrop-blur-md transition-all active:scale-[0.98]">
                        <item.icon className={`size-4 mb-2 ${item.color}`} />
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{item.label}</p>
                        <p className="text-xs font-bold text-white mt-1">{item.val}</p>
                    </div>
                ))}
            </div>

            {/* 5. Sequence Timeline */}
            <div className="pt-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-5">Secuencia de Eventos</h3>
                <div className="space-y-6 ml-4 border-l border-white/5 pl-8 relative">
                    {[
                        { tag: 'Día 22', title: 'Fase V3 Confirmada', complete: true },
                        { tag: 'Día 24', title: 'Sinc. Nutricional', complete: true },
                        { tag: 'Día 26', title: 'V4 Estimada', complete: false }
                    ].map((m, i) => (
                        <div key={i} className="relative">
                            <div className={`absolute -left-[37px] top-1 size-3 rounded-full ring-[6px] ring-[#0A0F1E] z-10 ${m.complete ? 'bg-agro-green shadow-[0_0_10px_#00ff87]' : 'bg-slate-800'}`}></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${m.complete ? 'text-agro-green' : 'text-slate-600'}`}>{m.tag}</span>
                            <h4 className={`text-xs font-bold mt-1 ${m.complete ? 'text-white' : 'text-slate-600'}`}>{m.title}</h4>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

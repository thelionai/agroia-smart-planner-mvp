import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Droplets, Thermometer, Zap, Activity, ArrowUpRight } from 'lucide-react';

export const Stats = () => {
    const metrics = [
        { label: 'Potencial de Rendimiento', val: '88%', trend: '+14%', color: 'text-agro-green' },
        { label: 'Salud del Suelo', val: '92/100', trend: 'Estable', color: 'text-agro-blue' },
        { label: 'Compensación CO2', val: '12.4t', trend: '+2.1t', color: 'text-emerald-400' },
    ];

    const bars = [40, 70, 55, 90, 65, 85, 45, 95];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-24"
        >
            {/* Stats Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="bg-agro-secondary/20 p-2 rounded-full border border-agro-secondary/30">
                        <BarChart3 className="text-agro-secondary size-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Telemetría <span className="text-agro-secondary font-light">Estratégica</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Datos de Biósfera en Tiempo Real</p>
                    </div>
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400">Exportar Dataset</button>
            </div>

            {/* Main Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <TrendingUp className={`size-4 opacity-50 ${m.color}`} />
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{m.label}</p>
                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-bold text-white">{m.val}</h2>
                            <span className={`text-xs font-bold mb-1 ${m.color === 'text-agro-green' ? 'text-agro-green' : 'text-slate-400'}`}>
                                {m.trend}
                            </span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: m.val.includes('%') ? m.val : '92%' }}
                                className={`h-full ${m.color === 'text-agro-green' ? 'bg-agro-green' : 'bg-agro-blue'}`}
                            ></motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Large Chart Area */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-sm font-bold text-white">Índice de Eficiencia</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Últimos 8 Ciclos</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-agro-green"></div><span className="text-[8px] font-black text-slate-500">ÓPTIMO</span></div>
                        <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-white/10"></div><span className="text-[8px] font-black text-slate-500">PROMEDIO</span></div>
                    </div>
                </div>

                <div className="h-48 flex items-end justify-between gap-3 px-2">
                    {bars.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.05 }}
                                className={`w-full rounded-t-lg relative group transition-all
                  ${h > 80 ? 'bg-agro-green shadow-[0_0_15px_rgba(0,255,135,0.3)]' : 'bg-white/10 opacity-60'}`}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-agro-navy px-2 py-1 rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">{h}%</div>
                            </motion.div>
                            <span className="text-[8px] font-black text-slate-700">Q{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Log */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Registros de Auditoría</h4>
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between border-l-2 border-l-agro-green">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-agro-green/10 flex items-center justify-center"><Activity size={14} className="text-agro-green" /></div>
                            <div>
                                <p className="text-xs font-bold text-white">Dataset {1000 + i} Procesado</p>
                                <p className="text-[10px] text-slate-500">Nodo Sensor B-12 • Enlace Global</p>
                            </div>
                        </div>
                        <ArrowUpRight size={14} className="text-slate-600" />
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

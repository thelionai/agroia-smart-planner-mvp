import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, Bell, History, ArrowRight, ShieldAlert, Brain } from 'lucide-react';

export const Alerts = ({ alertsData = [] }) => {
    // Use mock data if empty
    const data = alertsData.length > 0 ? alertsData : [
        { type: 'warning', message: 'Posible helada en 48 horas', priority: 'high', time: '2h' },
        { type: 'info', message: 'Ventana óptima de siembra abierta', priority: 'medium', time: '5h' },
        { type: 'success', message: 'Humedad del suelo en niveles ideales', priority: 'low', time: '1d' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-24"
        >
            {/* Alerts Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="bg-red-500/20 p-2 rounded-full border border-red-500/30">
                        <Bell className="text-red-500 size-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Centro de <span className="text-red-500 font-light">Alertas</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Monitoreo biológico en vivo</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <History className="size-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Historial</span>
                </div>
            </div>

            {/* Alert Feed */}
            <div className="space-y-4">
                {data.map((alert, idx) => {
                    const isHigh = alert.priority === 'high';
                    const isMed = alert.priority === 'medium';
                    const priorityLabel = alert.priority === 'high' ? 'ALTA' : alert.priority === 'medium' ? 'MEDIA' : 'BAJA';

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`glass-card p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden group transition-all hover:scale-[1.01]
                ${isHigh ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' :
                                    isMed ? 'bg-yellow-500/5 border-yellow-500/20' :
                                        'bg-agro-green/5 border-agro-green/20'}`}
                        >
                            <div className="flex gap-4 items-start">
                                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border
                  ${isHigh ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                                        isMed ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                                            'bg-agro-green/20 border-agro-green/40 text-agro-green'}`}>
                                    {isHigh ? <ShieldAlert className="size-6" /> : isMed ? <AlertTriangle className="size-6" /> : <CheckCircle className="size-6" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold leading-tight ${isHigh ? 'text-red-400' : 'text-white'}`}>
                                            {alert.message}
                                        </h3>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">hace {alert.time}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
                                        Prioridad: <span className={isHigh ? 'text-red-500' : isMed ? 'text-yellow-500' : 'text-agro-green'}>{priorityLabel}</span>
                                    </p>
                                </div>
                                <ArrowRight className="size-4 text-slate-700 mt-1" />
                            </div>

                            {isHigh && (
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div className="size-6 rounded-full border-2 border-[#0A0F1E] bg-agro-green flex items-center justify-center">
                                            <Brain className="size-3 text-agro-navy" />
                                        </div>
                                        <div className="size-6 rounded-full border-2 border-[#0A0F1E] bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white">
                                            +
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'inicio' }))}
                                        className="bg-agro-green/10 hover:bg-agro-green/20 border border-agro-green/30 text-agro-green text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <Brain className="size-3" /> Consultar Diagnóstico IA
                                    </button>
                                </div>
                            )}

                            {isHigh && (
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="size-1.5 rounded-full bg-red-500 animate-ping"></div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Protocol Summary Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Protocolos de Seguridad</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-agro-navy/50 p-3 rounded-xl border border-white/5">
                        <span className="text-xl font-bold text-white">48h</span>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Próximo Riesgo</p>
                    </div>
                    <div className="bg-agro-navy/50 p-3 rounded-xl border border-white/5">
                        <span className="text-xl font-bold text-agro-green">Estable</span>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Estado General</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

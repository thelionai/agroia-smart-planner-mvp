import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, ArrowRight, Sprout, Shield, Activity, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listarParcelas, listarSiembras } from '../services/prediccionService';
import { useAgroData } from '../hooks/useAgroData';
import { DashboardMonitor } from '../components/dashboard/DashboardMonitor';

export const Dashboard = ({ onAction }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ parcels: [], siembras: [], loading: true });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [p, s] = await Promise.all([listarParcelas(), listarSiembras()]);
                setStats({ parcels: p, siembras: s, loading: false });
            } catch (err) {
                console.error("Error al cargar dashboard:", err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };
        fetchStats();
    }, []);

    const hasParcels = stats.parcels.length > 0;
    const hasSiembras = stats.siembras.length > 0;
    const primaryParcelaId = hasParcels ? stats.parcels[0].id : null;

    // Phase 4 - Advanced Monitoring Hook
    const {
        growth,
        weather,
        recommendation,
        loading: monitoringLoading,
        recsLoading,
        getAIAdvice
    } = useAgroData(primaryParcelaId);

    // Roadmap logic
    const roadmapSteps = [
        { label: 'Perfil', status: 'done', icon: Shield },
        { label: 'Parcela', status: hasParcels ? 'done' : 'current', icon: MapPin },
        { label: 'Siembra', status: hasSiembras ? 'done' : (!hasParcels ? 'pending' : 'current'), icon: Sprout }
    ];

    const completedPercentage = Math.round((roadmapSteps.filter(s => s.status === 'done').length / 3) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-12"
        >
            {/* Header de Bienvenida */}
            <div className="px-1">
                <h1 className="text-2xl font-black text-white tracking-tight">
                    Hola, <span className="text-[#00FF7F]">{user?.nombre || "Comandante"}</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Sistemas Operativos • Estación de Control</p>
            </div>

            {/* FASE 4: MONITOR DE MONITOREO EN VIVO */}
            {hasSiembras ? (
                <DashboardMonitor
                    growth={growth}
                    weather={weather}
                    recommendation={recommendation}
                    loading={monitoringLoading}
                    recsLoading={recsLoading}
                    onAIRequest={getAIAdvice}
                    onAction={onAction}
                />
            ) : (
                <div className="glass-card bg-white/5 border border-white/10 rounded-[28px] p-8 text-center space-y-4">
                    <div className="bg-[#00FF7F]/10 size-16 rounded-full flex items-center justify-center mx-auto">
                        <Sprout className="text-[#00FF7F] size-8" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Sin Misiones Activas</h3>
                        <p className="text-xs text-slate-400 mt-2">Inicia una siembra para activar el monitoreo fenológico por IA.</p>
                    </div>
                    <button
                        onClick={() => onAction('siembras')}
                        className="bg-[#00FF7F] text-agro-navy px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                        Comenzar Misión
                    </button>
                </div>
            )}

            {/* 2. Hoja de Ruta de Misión */}
            <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-[10px] font-black text-[#00FF7F] uppercase tracking-[0.2em]">Hoja de Ruta de Misión</h3>
                    <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{completedPercentage}% Completado</span>
                </div>

                <div className="flex justify-between items-start relative px-2">
                    <div className="absolute top-5 left-8 right-8 h-[1px] bg-white/10 -z-10"></div>
                    <div
                        className="absolute top-5 left-8 h-[1px] bg-[#00FF7F] shadow-[0_0_8px_#00FF7F] -z-10 transition-all duration-1000"
                        style={{ width: `${completedPercentage === 100 ? 80 : completedPercentage * 0.8}%` }}
                    ></div>

                    {roadmapSteps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step.status === 'done' ? 'bg-[#00FF7F] border-[#00FF7F] text-agro-navy' :
                                step.status === 'current' ? 'bg-[#0A0F1E] border-[#00FF7F] text-[#00FF7F] shadow-[0_0_15px_rgba(0,255,135,0.3)]' :
                                    'bg-[#0A0F1E] border-white/10 text-slate-700'
                                }`}>
                                <step.icon className="size-4" />
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${step.status === 'pending' ? 'text-slate-700' : 'text-slate-300'
                                }`}>{step.label}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex items-center justify-between bg-[#00FF7F]/10 border border-[#00FF7F]/20 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-[#00FF7F] p-2 rounded-lg flex items-center justify-center">
                            <Activity className="text-agro-navy size-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#00FF7F] font-black uppercase tracking-tighter leading-none">Próximo Objetivo</p>
                            <p className="text-[11px] text-white font-bold mt-1">
                                {!hasParcels ? "Registrar primera Parcela" : !hasSiembras ? "Iniciar primera Siembra" : "Optimizar Rendimiento"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onAction && onAction(!hasParcels ? 'parcelas' : 'siembras')}
                        className="bg-[#00FF7F] hover:bg-[#00FF7F]/90 text-agro-navy p-1.5 rounded-lg active:scale-90 transition-all font-bold"
                    >
                        <ArrowRight className="size-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

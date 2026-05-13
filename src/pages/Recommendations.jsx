import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout, AlertTriangle, CheckCircle, Search,
    Loader2, Brain, Sparkles, MapPin, Wind,
    Droplets, Zap, ArrowRight, Activity
} from 'lucide-react';

export const Recommendations = ({ aiRecommendations: initialRecs = [] }) => {
    const [recommendations, setRecommendations] = useState(initialRecs);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        crop: 'Potato',
        location: 'Cusco Highlands'
    });
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        try {
            // Logic from existing Recommendations.jsx preserved but adapted
            const response = await fetch('http://localhost:3002/api/recommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: formData.location,
                    lat: -13.5319,
                    lon: -71.9675,
                    crop: formData.crop
                }),
            });
            const data = await response.json();
            if (data.success) {
                const newRec = {
                    icon: Sprout,
                    title: `${formData.crop} — ${formData.location}`,
                    confidence: 99,
                    action: 'AgroIA Synthesis Complete',
                    reason: data.data.recommendation,
                    status: 'optimal'
                };
                setRecommendations([newRec, ...recommendations]);
            } else {
                setError('Synthesis engine offline: ' + (data.error || 'Unknown Error'));
            }
        } catch (err) {
            setError('Connection to AgroIA Core failed. Verify gateway status.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-24"
        >
            {/* Engine Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="bg-agro-green/20 p-2 rounded-full border border-agro-green/30">
                        <Brain className="text-agro-green size-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Motor de <span className="text-agro-green font-light">Bio-Inteligencia</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Análisis Predictivo + NASA POWER</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-agro-green/10 border border-agro-green/20 rounded-full">
                    <Sparkles className="size-3 text-agro-green animate-pulse" />
                    <span className="text-[10px] text-agro-green font-bold uppercase">En Línea</span>
                </div>
            </div>

            {/* Analysis Interface */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-agro-green/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-agro-green/10 transition-colors"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
                            <Wheat className="size-3" /> Cultivo Objetivo
                        </label>
                        <input
                            value={formData.crop}
                            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                            placeholder="Ej: Papa, Maíz..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none backdrop-blur-md"
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
                            <MapPin className="size-3" /> Zona Geoespacial
                        </label>
                        <input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Ej: Valle del Cusco..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none backdrop-blur-md"
                        />
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-red-400 text-xs font-medium mb-4"
                    >
                        <AlertTriangle className="size-4 shrink-0" /> {error}
                    </motion.div>
                )}

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-agro-green text-agro-navy font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,135,0.4)] hover:shadow-[0_0_30px_rgba(0,255,135,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin size-5" />
                            <span className="uppercase tracking-widest text-xs">Procesando Análisis Neural...</span>
                        </>
                    ) : (
                        <>
                            <Zap className="size-5 fill-agro-navy" />
                            <span className="uppercase tracking-widest text-xs">Ejecutar Análisis Profundo</span>
                        </>
                    )}
                </button>
            </div>

            {/* Results Feed */}
            <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Activity className="size-3 text-agro-green" /> Historial de Análisis
                </h3>

                <AnimatePresence>
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-xl"
                            >
                                <div className="bg-gradient-to-r from-agro-green to-agro-secondary p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <rec.icon className="text-white size-5" />
                                        </div>
                                        <h3 className="text-white font-bold tracking-tight">{rec.title}</h3>
                                    </div>
                                    <div className="bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                                        <span className="text-[10px] font-black text-white">{rec.confidence}% PRECISIÓN IA</span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div>
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Resultado de Síntesis</span>
                                        <div className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap selection:bg-agro-green/20">
                                            {rec.reason}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 grayscale opacity-50">
                                                <Wind className="size-3 text-agro-green" />
                                                <span className="text-[9px] font-bold text-slate-400">Viento: 14km/h</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Droplets className="size-3 text-agro-green" />
                                                <span className="text-[9px] font-bold text-white">Humedad: 68%</span>
                                            </div>
                                        </div>
                                        <button className="text-agro-green text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                            Exportar Informe <ArrowRight className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : !loading && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-4 opacity-30">
                            <Brain className="size-16" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">Esperando Datos de Sincronización</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout, Sliders, Search, Plus, BookOpen, Activity,
    Settings as SettingsIcon, Thermometer, TrendingUp, X, Loader2
} from 'lucide-react';
import { crearCultivo, listarCultivos } from '../services/prediccionService';
import { useListado } from '../hooks/usePrediccion';

const CULTIVOS_REFERENCIA = [
    { nombre: 'Maíz Amarillo Duro', tbase: 10, umbral_floracion: 500, umbral_madurez: 1200 },
    { nombre: 'Trigo', tbase: 0, umbral_floracion: 500, umbral_madurez: 1500 },
    { nombre: 'Papa', tbase: 7, umbral_floracion: 600, umbral_madurez: 1400 },
    { nombre: 'Arroz', tbase: 10, umbral_floracion: 600, umbral_madurez: 1200 },
    { nombre: 'Quinua', tbase: 3, umbral_floracion: 400, umbral_madurez: 900 },
];

export function Cultivos() {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({
        nombre: '', tbase: '', umbral_floracion: '', umbral_madurez: '', descripcion: ''
    });
    const [enviando, setEnviando] = useState(false);

    const { data: cultivos = [], loading, refetch } = useListado(useCallback(listarCultivos, []));

    const aplicarReferencia = (ref) => {
        setForm({
            nombre: ref.nombre,
            tbase: String(ref.tbase),
            umbral_floracion: String(ref.umbral_floracion),
            umbral_madurez: String(ref.umbral_madurez),
            descripcion: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            await crearCultivo({
                nombre: form.nombre.trim(),
                tbase: parseFloat(form.tbase),
                umbral_floracion: parseFloat(form.umbral_floracion),
                umbral_madurez: parseFloat(form.umbral_madurez),
                descripcion: form.descripcion.trim() || null,
            });
            setForm({ nombre: '', tbase: '', umbral_floracion: '', umbral_madurez: '', descripcion: '' });
            setShowForm(false);
            refetch();
        } catch (err) {
            console.error(err);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-24"
        >
            {/* Área de Cabecera */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Catálogo de <span className="text-agro-green">Cultivos</span></h1>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mt-1">Parámetros biológicos activos</p>
                    </div>
                    <button className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all">
                        <Sliders className="text-agro-green size-4" />
                    </button>
                </div>

                {/* Barra de Búsqueda Compacta */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 size-4" />
                    <input
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-agro-green/50 focus:border-agro-green outline-none placeholder:text-slate-600 text-xs text-slate-100 backdrop-blur-md transition-all"
                        placeholder="Buscar catálogo..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filtros Minimalistas */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button className="px-5 py-1.5 rounded-full bg-agro-green text-agro-navy text-[10px] font-black whitespace-nowrap shadow-[0_0_10px_rgba(0,255,135,0.3)] uppercase">Todos</button>
                    {['Cereales', 'Tubérculos', 'Legumbres'].map((cat) => (
                        <button key={cat} className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-500 text-[10px] font-bold whitespace-nowrap uppercase">{cat}</button>
                    ))}
                </div>
            </div>

            {/* Lista de Tarjetas de Cultivo */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-4">
                        <Loader2 className="size-8 animate-spin text-agro-green" />
                        <p className="text-[10px] font-black tracking-widest uppercase">Indexando...</p>
                    </div>
                ) : (
                    cultivos.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card rounded-[24px] p-5 relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-agro-green/30 transition-all active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h2 className="text-sm font-black text-white leading-tight">
                                        {c.nombre}
                                    </h2>
                                    <span className="text-[8px] bg-agro-green/10 text-agro-green/80 font-black px-1.5 py-0.5 rounded uppercase tracking-widest mt-1 inline-block">Verificado</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Base</p>
                                    <p className="text-xs font-black text-white">{c.tbase}°C</p>
                                </div>
                            </div>

                            <div className="flex gap-6 mt-4 pt-3 border-t border-white/5">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] text-slate-600 uppercase font-black">Floración</p>
                                    <p className="text-xs font-bold text-white">{c.umbral_floracion}<span className="text-[9px] text-slate-500 ml-0.5 font-normal tracking-tighter">GDD</span></p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] text-slate-600 uppercase font-black">Cosecha</p>
                                    <p className="text-xs font-bold text-white">{c.umbral_madurez}<span className="text-[9px] text-slate-500 ml-0.5 font-normal tracking-tighter">GDD</span></p>
                                </div>
                            </div>

                            {/* Gráfico de Fase Minimalista */}
                            <div className="h-4 w-full bg-white/5 rounded-full mt-4 overflow-hidden flex">
                                <div className="h-full bg-agro-green/20 w-1/3 border-r border-agro-green/10"></div>
                                <div className="h-full bg-agro-green/40 w-1/3 border-r border-agro-green/10"></div>
                                <div className="h-full bg-agro-green w-1/3"></div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Action Button - Floating within bounds */}
            <button
                onClick={() => setShowForm(true)}
                className="fixed bottom-24 right-1/2 translate-x-[180px] size-12 bg-agro-green rounded-full shadow-[0_0_20px_rgba(0,255,135,0.4)] flex items-center justify-center text-agro-navy z-50 active:scale-95 transition-all"
            >
                <Plus className="size-6 font-black" />
            </button>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            className="absolute inset-0 bg-agro-navy/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md glass-card rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sprout className="text-agro-green size-5" /> Nuevo Cultivo
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Cargar desde referencia:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {CULTIVOS_REFERENCIA.map((ref) => (
                                        <button
                                            key={ref.nombre}
                                            type="button"
                                            onClick={() => aplicarReferencia(ref)}
                                            className="text-[10px] px-2.5 py-1 rounded-full bg-agro-green/10 text-agro-green hover:bg-agro-green/20 border border-agro-green/20 transition-colors font-bold uppercase tracking-tighter"
                                        >
                                            {ref.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Nombre del cultivo</label>
                                    <input
                                        required value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        placeholder="Ej: Corn XL-90"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Tbase (°C)</label>
                                    <input
                                        required type="number" step="0.5"
                                        value={form.tbase}
                                        onChange={(e) => setForm({ ...form, tbase: e.target.value })}
                                        placeholder="10.0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">GDD Floración</label>
                                        <input
                                            required type="number"
                                            value={form.umbral_floracion}
                                            onChange={(e) => setForm({ ...form, umbral_floracion: e.target.value })}
                                            placeholder="750"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">GDD Madurez</label>
                                        <input
                                            required type="number"
                                            value={form.umbral_madurez}
                                            onChange={(e) => setForm({ ...form, umbral_madurez: e.target.value })}
                                            placeholder="1450"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={enviando}
                                    className="w-full bg-agro-green text-agro-navy font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(0,255,135,0.3)] mt-2 flex items-center justify-center gap-2"
                                >
                                    {enviando ? <Loader2 className="animate-spin size-5" /> : <><Plus className="size-5" /> Registrar Cultivo</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

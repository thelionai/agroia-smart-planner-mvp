import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Plus, Loader2, Map as MapIcon, Mountain,
    Search, Droplets, Sprout, ArrowRight, X, LayoutGrid, CheckCircle
} from 'lucide-react';
import { crearParcela, listarParcelas } from '../services/prediccionService';
import { useListado } from '../hooks/usePrediccion';

export function Parcelas() {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({
        nombre: '', latitud: '', longitud: '', altitud: '', descripcion: ''
    });
    const [enviando, setEnviando] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const { data: parcelas = [], loading, refetch } = useListado(useCallback(listarParcelas, []));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            await crearParcela({
                nombre: form.nombre.trim(),
                latitud: parseFloat(form.latitud),
                longitud: parseFloat(form.longitud),
                altitud: form.altitud ? parseFloat(form.altitud) : null,
                descripcion: form.descripcion.trim() || null,
            });
            setForm({ nombre: '', latitud: '', longitud: '', altitud: '', descripcion: '' });
            setShowForm(false);
            setSuccessData(form.nombre);
            refetch();
            // Automatically clear success after 10s if user doesn't act
            setTimeout(() => setSuccessData(null), 10000);
        } catch (err) {
            console.error(err);
        } finally {
            setEnviando(false);
        }
    };

    const filteredParcelas = parcelas.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-24"
        >
            {/* Modal de Éxito Contextual */}
            <AnimatePresence>
                {successData && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-agro-green p-6 rounded-[28px] shadow-[0_20px_50px_rgba(0,255,135,0.3)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                            <Sprout className="size-20 -mr-8 -mt-8 rotate-12" />
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-agro-navy p-3 rounded-full mb-4">
                                <CheckCircle className="text-agro-green size-8" />
                            </div>
                            <h2 className="text-agro-navy text-xl font-black uppercase tracking-tight">Parcela Registrada</h2>
                            <p className="text-agro-navy/60 text-xs font-bold mt-1 mb-6">"{successData}" está lista para su primera misión.</p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setSuccessData(null)}
                                    className="flex-1 bg-agro-navy/10 border border-agro-navy/20 text-agro-navy font-black py-3 rounded-xl text-[10px] uppercase tracking-widest"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => {
                                        setSuccessData(null);
                                        // Emit event to App.jsx to change tab
                                        window.dispatchEvent(new CustomEvent('changeTab', { detail: 'siembras' }));
                                    }}
                                    className="flex-1 bg-agro-navy text-agro-green font-black py-3 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Iniciar Siembra <ArrowRight className="size-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Área de Cabecera */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">Mis <span className="text-agro-green">Parcelas</span></h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{parcelas.length} unidades activas</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-agro-green p-2 rounded-xl active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,135,0.3)]"
                >
                    <Plus className="size-5 text-agro-navy" />
                </button>
            </div>

            {/* Búsqueda Moderna */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 size-4" />
                <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-agro-green/50 focus:border-agro-green outline-none text-sm text-slate-100 placeholder:text-slate-600 transition-all backdrop-blur-md"
                    placeholder="Filtrar parcelas..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista Compacta de Parcelas */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-4">
                        <Loader2 className="size-8 animate-spin text-agro-green" />
                        <p className="text-[10px] font-black tracking-widest uppercase">Escaneando...</p>
                    </div>
                ) : filteredParcelas.length === 0 ? (
                    <div className="py-20 bg-white/5 rounded-[24px] border border-dashed border-white/10 text-center text-slate-600">
                        <MapPin className="size-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">No se encontraron parcelas</p>
                    </div>
                ) : (
                    filteredParcelas.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card rounded-[24px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-agro-green/30 transition-all active:scale-[0.98]"
                        >
                            <div className="flex">
                                {/* Miniatura Visual */}
                                <div className="w-24 h-full relative overflow-hidden bg-white/10 shrink-0 min-h-[100px]">
                                    <div
                                        className="absolute inset-0 bg-center bg-cover opacity-60 grayscale-[0.3]"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=200')" }}
                                    ></div>
                                </div>
                                {/* Contenido */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">{p.nombre}</h3>
                                            <p className="text-[10px] text-agro-green font-mono mt-0.5">{p.latitud.toFixed(4)}°, {p.longitud.toFixed(4)}°</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-agro-green">94</span>
                                            <p className="text-[8px] uppercase tracking-tighter text-slate-500 font-bold">Salud</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Droplets className="size-3 text-agro-blue" /> 42% Humedad
                                        </span>
                                        <button className="text-agro-green text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                            Ver detalles <ArrowRight className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Registration Modal Form */}
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
                            className="relative w-full max-w-md glass-card rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur-xl shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MapPin className="text-agro-green size-5" /> Nueva Parcela
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Nombre</label>
                                    <input
                                        required
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        placeholder="Ej: Sector Norte A"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Latitud</label>
                                        <input
                                            required type="number" step="0.000001"
                                            value={form.latitud}
                                            onChange={(e) => setForm({ ...form, latitud: e.target.value })}
                                            placeholder="-12.046"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Longitud</label>
                                        <input
                                            required type="number" step="0.000001"
                                            value={form.longitud}
                                            onChange={(e) => setForm({ ...form, longitud: e.target.value })}
                                            placeholder="-77.042"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Altitud (msnm)</label>
                                    <input
                                        type="number"
                                        value={form.altitud}
                                        onChange={(e) => setForm({ ...form, altitud: e.target.value })}
                                        placeholder="3200"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                    />
                                </div>
                                <button
                                    disabled={enviando}
                                    className="w-full bg-agro-green text-agro-navy font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(0,255,135,0.3)] mt-2 flex items-center justify-center gap-2"
                                >
                                    {enviando ? <Loader2 className="animate-spin size-5" /> : <><MapPin className="size-5" /> Registrar Parcela</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

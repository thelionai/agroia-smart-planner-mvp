import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout, MapPin, Wheat, Calendar, Plus,
    Loader2, ChevronRight, X, Info, Thermometer
} from 'lucide-react';
import { useListado } from '../hooks/usePrediccion';
import {
    listarParcelas,
    listarCultivos,
    listarSiembras,
    registrarSiembra,
} from '../services/prediccionService';

export function Siembras({ onSelectSowing }) {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({
        parcela_id: '', cultivo_id: '', fecha_siembra: new Date().toISOString().split('T')[0], notas: ''
    });
    const [enviando, setEnviando] = useState(false);

    const { data: parcelas = [], loading: loadingParcelas } = useListado(useCallback(listarParcelas, []));
    const { data: cultivos = [], loading: loadingCultivos } = useListado(useCallback(listarCultivos, []));
    const { data: siembras = [], loading: loadingSiembras, refetch: recargarSiembras } = useListado(useCallback(listarSiembras, []));

    const filteredSiembras = siembras.filter(s =>
        s.cultivo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parcela_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            await registrarSiembra({
                parcela_id: Number(form.parcela_id),
                cultivo_id: Number(form.cultivo_id),
                fecha_siembra: form.fecha_siembra,
                notas: form.notas || null,
            });
            setShowForm(false);
            recargarSiembras();
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white mb-1">Siembras <span className="text-agro-green">Activas</span></h1>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Ciclos de crecimiento en curso</p>
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
                    placeholder="Filtrar siembras..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista de Tarjetas de Siembra */}
            <div className="space-y-4">
                {loadingSiembras ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-4">
                        <Loader2 className="size-8 animate-spin text-agro-green" />
                        <p className="text-[10px] font-black tracking-widest uppercase">Sincronizando...</p>
                    </div>
                ) : filteredSiembras.length === 0 ? (
                    <div className="py-16 bg-white/5 rounded-[28px] border border-dashed border-white/10 text-center flex flex-col items-center">
                        <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Sprout className="size-8 text-slate-700" />
                        </div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-tight">Sin Operaciones Activas</h4>
                        <p className="text-slate-500 text-[10px] mt-1 mb-6 px-10">Tu biosfera está en espera. Inicia una nueva misión de siembra para comenzar el monitoreo satelital.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-agro-green/10 border border-agro-green/30 text-agro-green text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-agro-green/20 transition-all flex items-center gap-2"
                        >
                            <Plus className="size-3" /> Nueva Siembra
                        </button>
                    </div>
                ) : (
                    filteredSiembras.map((s, i) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => onSelectSowing && onSelectSowing(s)} // Changed onSowingSelect to onSelectSowing to match prop
                            className="glass-card rounded-[24px] p-5 border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-agro-green/5 blur-2xl rounded-full"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-agro-green/10 border border-agro-green/30 rounded-xl flex items-center justify-center">
                                        <Sprout className="text-agro-green size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">{s.cultivo_nombre}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold">{s.parcela_nombre}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-agro-green/10 text-agro-green font-black px-2 py-1 rounded uppercase tracking-tighter">Activa</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                    <span>Progreso Actual</span>
                                    <span className="text-agro-green">74%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '74%' }}
                                        className="h-full bg-agro-green shadow-[0_0_10px_#00ff87]"
                                    ></motion.div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-600 uppercase font-black">Iniciada</span>
                                        <span className="text-[10px] font-bold text-white">{new Date(s.fecha_siembra).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-600 uppercase font-black">GDD Acum.</span>
                                        <span className="text-[10px] font-bold text-agro-green">{s.gdd_acumulado || 842} pts</span>
                                    </div>
                                </div>
                                <button className="flex items-center gap-1.5 text-agro-green text-[10px] font-black uppercase tracking-widest hover:gap-2 transition-all">
                                    Ver seguimiento <ArrowRight className="size-3" />
                                </button>
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
                                    <Plus className="text-agro-green size-5" /> Nueva Siembra
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Parcela</label>
                                    <select
                                        required
                                        value={form.parcela_id}
                                        onChange={(e) => setForm({ ...form, parcela_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none appearance-none"
                                    >
                                        <option value="" className="bg-agro-navy">Seleccionar Parcela</option>
                                        {parcelas.map(p => <option key={p.id} value={p.id} className="bg-agro-navy">{p.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Cultivo</label>
                                    <select
                                        required
                                        value={form.cultivo_id}
                                        onChange={(e) => setForm({ ...form, cultivo_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none appearance-none"
                                    >
                                        <option value="" className="bg-agro-navy">Seleccionar Cultivo</option>
                                        {cultivos.map(c => <option key={c.id} value={c.id} className="bg-agro-navy">{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-agro-green uppercase tracking-widest mb-1.5 ml-1">Fecha de Siembra</label>
                                    <input
                                        required type="date"
                                        value={form.fecha_siembra}
                                        onChange={(e) => setForm({ ...form, fecha_siembra: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-agro-green/30 focus:border-agro-green outline-none"
                                    />
                                </div>
                                <button
                                    disabled={enviando || loadingParcelas || loadingCultivos}
                                    className="w-full bg-agro-green text-agro-navy font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(0,255,135,0.3)] mt-2 flex items-center justify-center gap-2"
                                >
                                    {enviando ? <Loader2 className="animate-spin size-5" /> : <><Sprout className="size-5" /> Iniciar Misión</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

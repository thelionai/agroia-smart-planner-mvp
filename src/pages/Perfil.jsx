import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Settings, Bell, Globe, ChevronRight, Loader2 } from 'lucide-react';
import api from '../services/api';

export const Perfil = ({ onLogout }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/me');
                setUserData(response.data);
            } catch (err) {
                console.error("Error al cargar perfil:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const userEmail = userData?.email || localStorage.getItem('agroia_user_email') || 'usuario@agroia.ai';
    const userName = userData?.nombre || 'Administrador';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-24"
        >
            {/* Header Perfil */}
            <div className="flex flex-col items-center pt-4">
                {loading ? (
                    <div className="size-20 bg-agro-green/10 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="animate-spin text-agro-green" />
                    </div>
                ) : (
                    <div className="relative">
                        <div className="size-20 bg-agro-green/10 border border-agro-green/30 rounded-full flex items-center justify-center mb-4">
                            <User className="text-agro-green size-10" />
                        </div>
                        <div className="absolute bottom-4 right-0 size-6 bg-agro-green rounded-full border-4 border-[#0A0F1E] flex items-center justify-center">
                            <Shield className="text-agro-navy size-3" />
                        </div>
                    </div>
                )}
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">{userName}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                    <Mail className="size-3 text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">{userEmail}</span>
                </div>
            </div>

            {/* Ajustes de Cuenta */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Ajustes de Cuenta</h3>

                {[
                    { icon: Bell, label: 'Notificaciones', val: 'Activadas' },
                    { icon: Globe, label: 'Idioma', val: 'Español' },
                    { icon: Settings, label: 'Preferencias de IA', val: 'Avanzado' },
                ].map((item, i) => (
                    <div key={i} className="glass-card flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 active:scale-[0.98] transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center">
                                <item.icon className="text-slate-400 size-4" />
                            </div>
                            <span className="text-sm font-bold text-white">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-agro-green uppercase">{item.val}</span>
                            <ChevronRight className="size-4 text-slate-600" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Peligro / Sesión */}
            <div className="pt-4">
                <button
                    onClick={onLogout}
                    className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] group"
                >
                    <LogOut className="size-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm tracking-widest uppercase">CERRAR SESIÓN</span>
                </button>
                <p className="text-center text-[9px] text-slate-600 mt-6 font-bold uppercase tracking-widest">AgroIA v4.0.2-ALPHA • 2024</p>
            </div>
        </motion.div>
    );
};

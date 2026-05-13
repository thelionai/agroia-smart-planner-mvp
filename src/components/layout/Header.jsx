import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Cloud, Zap, MapPin } from 'lucide-react';

export const Header = ({ notificationCount }) => {
    return (
        <div className="flex flex-col w-full">
            {/* Satellite Syncing Bar (Simulated) */}
            <div className="bg-agro-green/5 border-b border-agro-green/10 py-1 px-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono">
                    <span className="size-1 bg-agro-green rounded-full animate-ping"></span>
                    <span className="text-[7px] text-agro-green/60 uppercase font-black tracking-[0.2em]">Enlace Satelital Activo: NASA POWER Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-[2px] w-8 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ x: [-32, 32] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="h-full w-full bg-agro-green/40"
                        />
                    </div>
                    <span className="text-[7px] text-agro-green/40 font-mono">Uplink: 98%</span>
                </div>
            </div>

            <header className="px-5 pt-4 pb-2 flex items-center justify-between bg-transparent z-50">
                {/* Logo pequeño + Nombre App */}
                <div className="flex items-center gap-2">
                    <div className="size-8 bg-agro-green/10 border border-agro-green/30 rounded-lg flex items-center justify-center">
                        <Zap className="text-agro-green size-4 fill-agro-green/20" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <MapPin className="size-2 text-agro-green" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Parcela A-12</span>
                        </div>
                        <h1 className="text-xs font-black tracking-tight text-white leading-none">AgroIA <span className="text-agro-green">Central</span></h1>
                    </div>
                </div>

                {/* Weather + Notifications */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                        <Cloud className="size-3 text-agro-green" />
                        <span className="text-[10px] font-bold text-white">24°C</span>
                    </div>

                    <div className="relative">
                        <button className="size-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative">
                            <Bell className="text-slate-400 size-4" />
                            {notificationCount > 0 && (
                                <span className="absolute top-0 right-0 size-2.5 bg-red-500 rounded-full border-2 border-[#0A0F1E]"></span>
                            )}
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
};

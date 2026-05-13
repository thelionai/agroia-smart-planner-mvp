import React from 'react';
import { motion } from 'framer-motion';
import {
    Home, MapPin, Sprout, Bell, User, LayoutGrid
} from 'lucide-react';

const TABS = [
    { id: 'inicio', icon: Home, label: 'Inicio' },
    { id: 'parcelas', icon: MapPin, label: 'Parcelas' },
    { id: 'cultivos', icon: Sprout, label: 'Cultivos' },
    { id: 'alertas', icon: Bell, label: 'Alertas' },
    { id: 'perfil', icon: User, label: 'Perfil' },
];

export const BottomNav = ({ activeTab, onTabChange }) => {
    return (
        <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-[60]">
            <div className="bg-[#111827]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all active:scale-90"
                        >
                            <tab.icon
                                className={`relative z-10 size-5 transition-all duration-300 ${isActive ? 'text-agro-green' : 'text-slate-600'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[8px] font-black mt-1 transition-all duration-300 tracking-tighter ${isActive ? 'text-agro-green opacity-100' : 'text-slate-700 opacity-0'}`}>
                                {tab.label.toUpperCase()}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeGlow"
                                    className="absolute bottom-0 size-1 bg-agro-green rounded-full shadow-[0_0_10px_#00ff87]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

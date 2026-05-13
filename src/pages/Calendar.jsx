import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';

export const Calendar = () => {
    const days = Array.from({ length: 35 }, (_, i) => i - 3); // Padding days
    const events = [
        { day: 12, title: 'Siembra de Maíz', type: 'planting', color: 'bg-agro-green' },
        { day: 15, title: 'Riego Sector A-12', type: 'maintenance', color: 'bg-agro-blue' },
        { day: 24, title: 'Cosecha de Papa', type: 'harvest', color: 'bg-orange-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-24"
        >
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="bg-agro-blue/20 p-2 rounded-full border border-agro-blue/30">
                        <CalendarIcon className="text-agro-blue size-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Hub de <span className="text-agro-blue font-light">Programación</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Ciclo Octubre 2023</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"><ChevronLeft size={18} /></button>
                    <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* Mini Event Feed */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                {events.map((ev, i) => (
                    <div key={i} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 w-48 backdrop-blur-md">
                        <div className={`size-1.5 rounded-full ${ev.color} mb-2`}></div>
                        <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                        <div className="flex items-center gap-2 mt-2 opacity-50">
                            <Clock size={10} /> <span className="text-[10px] uppercase font-bold">08:00 AM</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="glass-card rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                    {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(d => (
                        <div key={d} className="py-4 text-center text-[10px] font-black text-slate-500 tracking-widest">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((d, i) => {
                        const isToday = d === 14;
                        const isPadding = d <= 0 || d > 31;
                        const event = events.find(e => e.day === d);

                        return (
                            <div key={i} className={`h-24 border-b border-r border-white/5 p-2 transition-colors relative group
                ${isPadding ? 'opacity-10' : 'hover:bg-white/5'}`}>
                                <span className={`text-xs font-bold font-mono ${isToday ? 'bg-agro-green text-agro-navy w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                                    {d > 0 && d <= 31 ? d : ''}
                                </span>
                                {event && (
                                    <div className={`mt-1 h-1.5 w-full rounded-full ${event.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                                )}
                                <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 p-1 rounded-full text-agro-green">
                                    <Plus size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

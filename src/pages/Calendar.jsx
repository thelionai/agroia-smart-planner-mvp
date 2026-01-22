import React from 'react';
import { Card } from '../components/ui/Card';
import { Calendar as CalendarIcon } from 'lucide-react';

export const Calendar = () => {
    // Simplified calendar logic for demo
    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="px-1">
                <h2 className="text-2xl font-bold text-gray-800">Calendario Agrícola</h2>
                <p className="text-gray-500 text-sm">Diciembre 2025</p>
            </div>

            <Card>
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days.map(day => {
                        const isOptimal = day >= 12 && day <= 16;
                        const isToday = day === 22;

                        return (
                            <div
                                key={day}
                                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold relative
                  ${isOptimal ? 'bg-andean-foliage text-white shadow-md' : 'bg-gray-50 text-gray-700'}
                  ${isToday ? 'border-2 border-andean-maize' : ''}
                `}
                            >
                                {day}
                                {isOptimal && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex gap-4 text-xs font-bold text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-andean-foliage rounded-full"></div>
                        Días Óptimos
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-andean-maize rounded-lg"></div>
                        Hoy
                    </div>
                </div>
            </Card>
        </div>
    );
};

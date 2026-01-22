import React from 'react';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { Droplets, Thermometer, Calendar, CloudRain } from 'lucide-react';

export const Dashboard = ({ t, soilMetrics, weatherData }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Ventana de Siembra - HERO */}
            <div className="bg-gradient-to-br from-andean-foliage to-green-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 translate-y-[-10px]" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{t.optimalWindow}</h2>
                            <p className="text-green-100 text-sm opacity-90">{t.idealConditions}</p>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                            {t.aiActive}
                        </div>
                    </div>

                    <div className="mt-6 flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tight">3-5</span>
                        <span className="text-xl font-medium text-green-100">{t.days}</span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <CloudRain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-green-100">{t.rain}</div>
                                <div className="font-bold">20%</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-green-100">{t.moonPhase}</div>
                                <div className="font-bold">{t.waxing}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Metricas */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">{t.currentConditions}</h3>
                <div className="grid grid-cols-1 gap-4">
                    <MetricCard
                        label={t.soilMoisture}
                        value={68}
                        unit="%"
                        optimal={[60, 75]}
                        icon={Droplets}
                    />
                    <MetricCard
                        label={t.temperature}
                        value={18}
                        unit="°C"
                        optimal={[15, 25]}
                        icon={Thermometer}
                    />
                </div>
            </div>
        </div>
    );
};

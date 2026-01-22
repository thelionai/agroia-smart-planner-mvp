import React from 'react';
import { Card } from '../components/ui/Card';
import { TrendingUp, Activity, DollarSign } from 'lucide-react';

export const Stats = () => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="px-1">
                <h2 className="text-2xl font-bold text-gray-800">Mis Estadísticas</h2>
                <p className="text-gray-500 text-sm">Rendimiento y predicciones</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-andean-sky to-blue-600 text-white border-none">
                    <TrendingUp className="w-8 h-8 mb-2 text-blue-200" />
                    <div className="text-3xl font-black">7.2</div>
                    <div className="text-xs font-bold text-blue-100">Ton/Ha</div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none">
                    <Activity className="w-8 h-8 mb-2 text-purple-200" />
                    <div className="text-3xl font-black">+24%</div>
                    <div className="text-xs font-bold text-purple-100">Eficiencia</div>
                </Card>
            </div>

            <Card>
                <h3 className="font-bold text-gray-700 mb-4">Rendimiento por Cultivo</h3>
                <div className="space-y-4">
                    {[
                        { name: 'Papa', val: 85, color: 'bg-andean-earth' },
                        { name: 'Maíz', val: 72, color: 'bg-andean-maize' },
                        { name: 'Quinua', val: 90, color: 'bg-andean-foliage' }
                    ].map((item, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm font-bold mb-1">
                                <span>{item.name}</span>
                                <span>{item.val}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full ${item.color}`}
                                    style={{ width: `${item.val}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

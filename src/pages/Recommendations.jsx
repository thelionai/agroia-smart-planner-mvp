import React from 'react';
import { Card } from '../components/ui/Card';
import { Sprout, AlertTriangle, CheckCircle } from 'lucide-react';

export const Recommendations = ({ aiRecommendations }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="px-1">
                <h2 className="text-2xl font-bold text-gray-800">Recomendaciones</h2>
                <p className="text-gray-500 text-sm">Basado en datos de SENAMHI y NASA</p>
            </div>

            <div className="space-y-4">
                {aiRecommendations.map((rec, idx) => {
                    const statusColor =
                        rec.status === 'optimal' ? 'bg-andean-foliage' :
                            rec.status === 'warning' ? 'bg-orange-500' : 'bg-andean-sky';

                    return (
                        <Card key={idx} className="!p-0 overflow-hidden border-0 shadow-lg">
                            <div className={`${statusColor} p-4 text-white flex justify-between items-center`}>
                                <div className="flex items-center gap-3">
                                    <rec.icon className="w-6 h-6" />
                                    <span className="font-bold text-lg">{rec.title}</span>
                                </div>
                                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg border border-white/20">
                                    {rec.confidence}% Confianza
                                </span>
                            </div>

                            <div className="p-5">
                                <div className="mb-4">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Acción</div>
                                    <div className="text-lg font-bold text-gray-800 leading-tight">
                                        {rec.action}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Razón</div>
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        {rec.reason}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

import React from 'react';
import { Card } from '../components/ui/Card';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export const Alerts = ({ alertsData }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="px-1">
                <h2 className="text-2xl font-bold text-gray-800">Centro de Alertas</h2>
                <p className="text-gray-500 text-sm">Notificaciones urgentes y clima</p>
            </div>

            <div className="space-y-4">
                {alertsData.map((alert, idx) => (
                    <Card key={idx} className={`!p-4 border-l-8 ${alert.priority === 'high' ? 'border-l-red-500' :
                            alert.priority === 'medium' ? 'border-l-yellow-500' :
                                'border-l-andean-foliage'
                        }`}>
                        <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${alert.priority === 'high' ? 'bg-red-100 text-red-600' :
                                    alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-green-100 text-green-600'
                                }`}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800 leading-tight mb-1">
                                    {alert.message}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Hace {alert.time} • Prioridad {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Media' : 'Baja'}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

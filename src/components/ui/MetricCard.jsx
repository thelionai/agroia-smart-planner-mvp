import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from './Card';

export const MetricCard = ({ label, value, unit, optimal, icon: Icon }) => {
    const isOptimal = value >= optimal[0] && value <= optimal[1];

    return (
        <Card className={`relative overflow-hidden border-l-8 ${isOptimal ? 'border-l-andean-foliage' : 'border-l-orange-500'}`}>
            <div className="flex items-center justify-between mb-2">
                <Icon className={`w-8 h-8 ${isOptimal ? 'text-andean-foliage' : 'text-orange-500'}`} />
                {isOptimal ? (
                    <CheckCircle className="w-6 h-6 text-andean-foliage" />
                ) : (
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                )}
            </div>

            <div className="mt-2">
                <div className="text-4xl font-black text-andean-earth">
                    {value}<span className="text-xl font-bold ml-1 text-gray-400">{unit}</span>
                </div>
                <div className="text-lg font-bold text-gray-600 mt-1">{label}</div>
                <div className="text-sm text-gray-500 font-medium mt-1 bg-gray-100 inline-block px-2 py-1 rounded-lg">
                    Meta: {optimal[0]}-{optimal[1]}{unit}
                </div>
            </div>
        </Card>
    );
};

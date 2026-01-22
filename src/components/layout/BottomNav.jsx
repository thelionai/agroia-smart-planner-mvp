import React from 'react';
import { LayoutDashboard, Sprout, AlertTriangle, Calendar, BarChart2 } from 'lucide-react';

export const BottomNav = ({ activeTab, onTabChange, t }) => {
    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
        { id: 'recommendations', icon: Sprout, label: t.nav.recommendations },
        { id: 'alerts', icon: AlertTriangle, label: t.nav.alerts },
        { id: 'calendar', icon: Calendar, label: t.nav.calendar },
        { id: 'stats', icon: BarChart2, label: t.nav.stats },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 pb-safe">
            <div className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-andean-sky/10 text-andean-sky translate-y-[-8px]'
                                : 'text-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className={`w-7 h-7 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            <span className={`text-[10px] font-bold ${isActive ? 'text-andean-sky' : 'text-gray-400'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

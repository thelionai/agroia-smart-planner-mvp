import React from 'react';
import { Sprout, Bell } from 'lucide-react';

export const Header = ({ title, subtitle, language, setLanguage, notificationCount }) => {
    return (
        <header className="bg-gradient-to-r from-andean-earth to-andean-clay text-white sticky top-0 z-40 shadow-md">
            <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                        <Sprout className="w-6 h-6 text-andean-maize" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-none">{title}</h1>
                        <p className="text-xs text-amber-100 opacity-90 mt-0.5">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setLanguage(prev => prev === 'es' ? 'qu' : 'es')}
                        className="px-3 py-1.5 bg-white/10 border border-white/30 rounded-lg text-sm font-bold active:bg-white/20 transition-colors"
                    >
                        {language === 'es' ? '🇵🇪 ES' : '🇵🇪 QU'}
                    </button>

                    <div className="relative">
                        <Bell className="w-6 h-6 text-white" />
                        {notificationCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border border-white">
                                {notificationCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

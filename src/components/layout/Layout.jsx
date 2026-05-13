import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const Layout = ({ children, activeTab, onTabChange, notificationCount, hideNav }) => {
    return (
        <div className="min-h-screen bg-[#0A0F1E] font-sans flex flex-col relative overflow-hidden selection:bg-agro-green/30">
            {/* Centered Mobile Container */}
            <div className="flex-1 w-full max-w-[420px] mx-auto bg-[#0A0F1E] shadow-2xl shadow-black/50 flex flex-col relative overflow-hidden border-x border-white/5">

                {/* Dynamic Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-agro-green/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

                <Header
                    notificationCount={notificationCount}
                />

                <main className={`flex-1 w-full px-5 pt-4 ${hideNav ? 'pb-8' : 'pb-28'} overflow-y-auto no-scrollbar`}>
                    {children}
                </main>

                {!hideNav && <BottomNav activeTab={activeTab} onTabChange={onTabChange} />}
            </div>
        </div>
    );
};

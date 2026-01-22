import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const Layout = ({ children, activeTab, onTabChange, language, setLanguage, notificationCount, t }) => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <Header
                title="AgroIA"
                subtitle={t?.assistantTitle}
                language={language}
                setLanguage={setLanguage}
                notificationCount={notificationCount}
            />

            <main className="flex-1 pb-24 px-4 py-6 max-w-lg mx-auto w-full">
                {children}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={onTabChange} t={t} />
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Recommendations } from './pages/Recommendations';
import { Alerts } from './pages/Alerts';
import { Calendar } from './pages/Calendar';
import { Stats } from './pages/Stats';
import { Siembras } from './pages/Siembras';
import { Parcelas } from './pages/Parcelas';
import { Cultivos } from './pages/Cultivos';
import { LoginPage } from './pages/LoginPage';
import { SowingTracking } from './pages/SowingTracking';
import { Perfil } from './pages/Perfil';
import ChatAI from './components/ChatAI';
import { AuthProvider, useAuth } from './context/AuthContext';

const AgroIASmartPlanner = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedSiembra, setSelectedSiembra] = useState(null);
  const [notificaciones, setNotificaciones] = useState(3);


  // Listen for cross-component navigation events
  useEffect(() => {
    const handleTabEvent = (e) => {
      console.log("[App] Cambio de pestaña solicitado:", e.detail);
      setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabEvent);
    return () => window.removeEventListener('changeTab', handleTabEvent);
  }, []);

  // Debugging Login Transition
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[App] Usuario autenticado:", user?.email);
      setActiveTab('inicio');
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="bg-[#0A0F1E] min-h-screen flex items-center justify-center">
        <div className="size-12 border-4 border-agro-green/20 border-t-agro-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    if (selectedSiembra) {
      return (
        <SowingTracking
          siembra={selectedSiembra}
          onBack={() => setSelectedSiembra(null)}
        />
      );
    }

    switch (activeTab) {
      case 'inicio': return <Dashboard onAction={(tab) => {
        if (tab === 'historial') setSelectedSiembra({ id: 1, cultivo_nombre: 'Maíz Híbrido', parcela_nombre: 'Sector A-12' });
        else setActiveTab(tab);
      }} />;
      case 'recomendaciones': return <Recommendations aiRecommendations={[]} />;
      case 'parcelas': return <Parcelas />;
      case 'cultivos': return <Cultivos />;
      case 'alertas': return <Alerts alertsData={[]} />;
      case 'perfil': return <Perfil onLogout={logout} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="bg-[#0A0F1E] min-h-screen text-slate-100 selection:bg-agro-green/30">
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={notificaciones}
        hideNav={!!selectedSiembra}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSiembra ? `siembra-${selectedSiembra.id}` : activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
        <ChatAI />
      </Layout>
    </div>
  );
};

const Root = () => (
  <AuthProvider>
    <AgroIASmartPlanner />
  </AuthProvider>
);

export default Root;
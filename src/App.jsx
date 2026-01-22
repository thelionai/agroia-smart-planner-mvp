import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Recommendations } from './pages/Recommendations';
import { Alerts } from './pages/Alerts';
import { Calendar } from './pages/Calendar';
import { Stats } from './pages/Stats';
import { Sprout, Cloud, CloudRain, Sun, AlertTriangle, CheckCircle, TrendingUp, Droplets, Thermometer, Activity } from 'lucide-react';
import ChatAI from './components/ChatAI';

const AgroIASmartPlanner = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('es');
  const [notifications, setNotifications] = useState(3);

  // Data & Content
  const texts = {
    es: {
      optimalWindow: 'Ventana Óptima de Siembra',
      days: 'días',
      currentConditions: 'Condiciones Actuales',
      aiActive: 'IA Activa',
      idealConditions: 'Condiciones ideales detectadas',
      rain: 'Lluvia',
      moonPhase: 'Fase Lunar',
      waxing: 'Creciente',
      soilMoisture: 'Humedad del Suelo',
      temperature: 'Temperatura',
      assistantTitle: 'Asistente Inteligente',
      nav: {
        dashboard: 'Inicio',
        recommendations: 'Siembra',
        alerts: 'Alertas',
        calendar: 'Agenda',
        stats: 'Datos'
      },
      chat: {
        title: 'Agrónomo Virtual',
        subtitle: 'IA Activa • Responde en Quechua/Español',
        welcome: '¡Hola! Soy tu asistente experto. Pregúntame sobre tu siembra, plagas o el clima.',
        placeholder: 'Escribe o habla...',
        chips: {
          whenPlant: '¿Cuándo sembrar?',
          pests: 'Tengo plagas',
          price: 'Precio de la papa'
        }
      }
    },
    qu: {
      optimalWindow: 'Allin Pacha Tarpunapaq',
      days: 'p\'unchaw',
      currentConditions: 'Kunan Pacha',
      aiActive: 'IA Llamk\'achkan',
      idealConditions: 'Allin pacha tarisqa',
      rain: 'Para',
      moonPhase: 'Killa Pacha',
      waxing: 'Wiñay Killa',
      soilMoisture: 'Allpa Humedad',
      temperature: 'Rupay',
      assistantTitle: 'Yachaq Yanapakuq',
      nav: {
        dashboard: 'Qallariy',
        recommendations: 'Tarpuy',
        alerts: 'Willakuy',
        calendar: 'Pacha',
        stats: 'Yupay'
      },
      chat: {
        title: 'Chakra Yachaq',
        subtitle: 'IA Llamk\'achkan • Riman Quechua/Español',
        welcome: '¡Allin p\'unchay! Chakra yachaq kani. Tapuway tarpuy, kuru otaq pachaunamanta.',
        placeholder: 'Qillqay otaq rimay...',
        chips: {
          whenPlant: '¿Hayk\'aq tarpusaq?',
          pests: 'Kuru kan',
          price: 'Papa chanin'
        }
      }
    }
  };

  const t = texts[language];

  // SAFETY CHECK: Prevents crash if dictionary is missing
  if (!t) return <div className="min-h-screen flex items-center justify-center p-4">Cargando traducciones...</div>;

  const aiRecommendations = [
    {
      icon: Sprout,
      title: 'Papa (Solanum tuberosum)',
      confidence: 94,
      action: 'Iniciar siembra en 3-5 días',
      reason: 'Condiciones óptimas de humedad (68%) y temperatura (18-22°C)',
      status: 'optimal'
    },
    {
      icon: AlertTriangle,
      title: 'Maíz (Zea mays)',
      confidence: 67,
      action: 'Esperar 12-15 días',
      reason: 'Riesgo de heladas en la próxima semana',
      status: 'warning'
    },
    {
      icon: CheckCircle,
      title: 'Quinua (Chenopodium quinoa)',
      confidence: 88,
      action: 'Momento ideal para siembra',
      reason: 'Altitud óptima (3,200 msnm) y ciclo lunar favorable',
      status: 'optimal' // Using optimal for green color consistency
    },
  ];

  const alertsData = [
    { type: 'warning', message: 'Posible helada en 48 horas', priority: 'high', time: '2h' },
    { type: 'info', message: 'Ventana óptima de siembra abierta', priority: 'medium', time: '5h' },
    { type: 'success', message: 'Humedad del suelo en niveles ideales', priority: 'low', time: '1d' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard t={t} soilMetrics={{}} weatherData={{}} />;
      case 'recommendations': return <Recommendations aiRecommendations={aiRecommendations} />;
      case 'alerts': return <Alerts alertsData={alertsData} />;
      case 'calendar': return <Calendar />;
      case 'stats': return <Stats />;
      default: return <Dashboard t={t} soilMetrics={{}} weatherData={{}} />;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        notificationCount={notifications}
        t={t}
      >
        {renderContent()}
        <ChatAI t={t} />
      </Layout>
    </>
  );
};

export default AgroIASmartPlanner;
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader, Sprout, User, Bot } from 'lucide-react';

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu agrónomo virtual. Puedo ayudarte con:\n\n🌱 Recomendaciones de siembra\n🐛 Control de plagas\n💧 Riego y fertilización\n📅 Calendario agrícola\n🌾 Cultivos andinos\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaConnected, setIsOllamaConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/health');
      const data = await response.json();
      setIsOllamaConnected(data.status === 'ok');
    } catch (error) {
      console.error('Error al conectar con backend:', error);
      setIsOllamaConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          })),
          location: 'Junín, Perú',
          altitude: '3200 msnm'
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Error al obtener respuesta');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Lo siento, hubo un error al procesar tu consulta. Asegúrate de que:\n\n1. Ollama esté corriendo (ejecuta `ollama serve`)\n2. El servidor backend esté iniciado\n3. Tengas el modelo llama3.2 descargado\n\nPuedes verificar con: `ollama list`',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    '¿Cuándo sembrar papa?',
    '¿Cómo controlar plagas orgánicamente?',
    '¿Qué cultivo es más rentable?',
    'Calendario de siembra para quinua'
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-4 shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 z-50 animate-bounce"
        >
          <MessageCircle className="w-7 h-7" />
          {!isOllamaConnected && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-gray-200">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Agrónomo IA</h3>
                <p className="text-xs text-green-100">
                  {isOllamaConnected ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                      Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-300 rounded-full"></span>
                      Desconectado
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="bg-green-500 rounded-full p-2 h-fit">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="bg-gray-300 rounded-full p-2 h-fit">
                    <User className="w-4 h-4 text-gray-700" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-green-500 rounded-full p-2 h-fit">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border-2 border-gray-200 p-3 rounded-2xl">
                  <Loader className="w-5 h-5 text-green-500 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2 font-semibold">Preguntas frecuentes:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu consulta..."
                className="flex-1 p-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-green-500 text-sm"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAI;
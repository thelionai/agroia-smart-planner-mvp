import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mic, X, Send, Loader2 } from 'lucide-react';

const ChatAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const SPANISH_CHAT = {
        title: 'Asistente AgroIA',
        subtitle: 'Consultas Biológicas en Tiempo Real',
        welcome: 'Hola, soy tu asistente de AgroIA. ¿En qué puedo ayudarte hoy con tus cultivos?',
        placeholder: 'Escribe tu consulta aquí...',
        chips: {
            whenPlant: '¿Cuándo sembrar?',
            pests: 'Riesgo de plagas',
            price: 'Precio del mercado'
        }
    };

    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: SPANISH_CHAT.welcome }]);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3002/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    location: 'Junín, Perú',
                    altitude: '3200 msnm'
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                throw new Error(data.error || 'Error en la respuesta');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Lo siento, hubo un problema al conectar con el servidor central. ¿Está el nodo Ollama activo?'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Botón de Acción Flotante */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-4 bg-agro-green text-agro-navy rounded-full p-4 shadow-[0_0_20px_rgba(0,255,135,0.4)] z-30 transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <MessageSquare className="w-8 h-8 font-black" />
            </button>

            {/* Interfaz de Chat */}
            <div className={`fixed inset-0 z-[110] flex flex-col items-center justify-end sm:justify-center p-4 bg-agro-navy/80 backdrop-blur-md transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                <div
                    className={`w-full max-w-md bg-[#0D1425] rounded-[24px] border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ height: '80vh', maxHeight: '600px' }}
                >
                    {/* Cabecera */}
                    <div className="bg-white/5 p-4 flex items-center justify-between text-white shrink-0 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="bg-agro-green/20 p-2 rounded-full">
                                <MessageSquare className="w-5 h-5 text-agro-green" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight">{SPANISH_CHAT.title}</h3>
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{SPANISH_CHAT.subtitle}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Área de Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-agro-navy font-black text-[10px] shrink-0 ${msg.role === 'assistant' ? 'bg-agro-green' : 'bg-white/20 text-white'}`}>
                                    {msg.role === 'assistant' ? 'AI' : 'YO'}
                                </div>
                                <div className={`p-4 rounded-[20px] shadow-sm max-w-[85%] ${msg.role === 'assistant'
                                    ? 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                                    : 'bg-agro-green text-agro-navy font-medium border-agro-green rounded-tr-sm'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-agro-green flex items-center justify-center text-agro-navy font-black text-[10px] shrink-0">AI</div>
                                <div className="bg-white/5 p-3 rounded-[20px] rounded-tl-sm border border-white/10 flex items-center gap-2 text-slate-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Área de Entrada */}
                    <div className="p-4 bg-white/5 border-t border-white/5 shrink-0">
                        {/* Chips Rápidos */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                            {[SPANISH_CHAT.chips.whenPlant, SPANISH_CHAT.chips.pests, SPANISH_CHAT.chips.price].map(q => (
                                <button
                                    key={q}
                                    onClick={() => setInput(q)}
                                    className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:bg-white/10 active:scale-95 transition-all">
                                <Mic className="w-6 h-6" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={SPANISH_CHAT.placeholder}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-agro-green/50 placeholder:text-slate-600 text-sm transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="p-3 bg-agro-green text-agro-navy rounded-xl shadow-[0_0_15px_rgba(0,255,135,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                            >
                                <Send className="w-5 h-5 font-black" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatAI;

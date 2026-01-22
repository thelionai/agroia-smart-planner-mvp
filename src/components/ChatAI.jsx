import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mic, X, Send, Loader2 } from 'lucide-react';

const ChatAI = ({ t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Update welcome message when language changes
    useEffect(() => {
        setMessages(prev => {
            if (prev.length === 0) {
                return [{ role: 'assistant', content: t.chat.welcome }];
            }
            return prev;
        });
    }, [t]);

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
                content: 'Lo siento, hubo un problema al conectar con el servidor. ¿Está Ollama corriendo?'
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
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-4 bg-gradient-to-r from-andean-maize to-amber-400 text-gray-900 rounded-full p-4 shadow-xl z-30 transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <MessageSquare className="w-8 h-8" />
            </button>

            {/* Chat Interface */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                <div
                    className={`w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ height: '80vh', maxHeight: '600px' }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-andean-earth to-andean-clay p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-none">{t.chat.title}</h3>
                                <span className="text-xs text-amber-100">{t.chat.subtitle}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-andean-foliage flex items-center justify-center text-white font-bold shrink-0">
                                    IA
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-gray-800 max-w-[85%]">
                                    <p className="font-medium text-sm whitespace-pre-wrap">{t.chat.welcome}</p>
                                </div>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${msg.role === 'assistant' ? 'bg-andean-foliage' : 'bg-andean-sky'}`}>
                                    {msg.role === 'assistant' ? 'IA' : 'YO'}
                                </div>
                                <div className={`p-3 rounded-2xl shadow-sm border max-w-[85%] ${msg.role === 'assistant'
                                    ? 'bg-white border-gray-100 text-gray-800 rounded-tl-sm'
                                    : 'bg-andean-sky text-white border-andean-sky rounded-tr-sm'
                                    }`}>
                                    <p className="font-medium text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-andean-foliage flex items-center justify-center text-white font-bold shrink-0">IA</div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center gap-2 text-gray-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Pensando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                        {/* Quick Chips */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                            {[t.chat.chips.whenPlant, t.chat.chips.pests, t.chat.chips.price].map(q => (
                                <button
                                    key={q}
                                    onClick={() => setInput(q)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 active:scale-95 transition-all">
                                <Mic className="w-6 h-6" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t.chat.placeholder}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-andean-sky/50 focus:border-andean-sky transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="p-3 bg-andean-sky text-white rounded-xl shadow-lg hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatAI;

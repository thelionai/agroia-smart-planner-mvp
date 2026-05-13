import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, AtSign, Lock, Eye, EyeOff, Terminal, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
    const auth = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await auth.login(email, password);
            } else {
                await auth.register(nombre, email, password);
            }
        } catch (err) {
            console.error("[Auth] Error en operación:", err.message);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0A0F1E] min-h-screen flex items-center justify-center p-4 overflow-hidden relative font-display">
            {/* Subtle Grid & Satellite Texture Background */}
            <div className="absolute inset-0 agro-grid-bg pointer-events-none opacity-40"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-agro-green/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-agro-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-[420px] z-10"
            >
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-agro-green/10 border border-agro-green/20 mb-6 group">
                        <Globe className="text-agro-green size-9 group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-slate-100 text-3xl font-bold tracking-tight mb-2">
                        AgroIA <span className="text-agro-green">Smart Planner</span>
                    </h1>
                    <p className="text-agro-green/60 text-sm font-medium tracking-[0.1em] uppercase">
                        Inteligencia Agrícola con IA
                    </p>
                </div>

                {/* Glassmorphism Login Card */}
                <div className="glass-card rounded-xl p-8 border border-white/10 backdrop-blur-xl bg-white/5 shadow-2xl">
                    {/* Tabs con Jerarquía Clara */}
                    <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl mb-8 border border-white/10">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${isLogin
                                ? 'bg-agro-green text-agro-navy shadow-[0_4px_12px_rgba(0,255,135,0.3)] scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 border ${!isLogin
                                ? 'bg-transparent border-agro-green/20 text-agro-green'
                                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Crear cuenta
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                        >
                            {/* Mensaje de Error Crítico */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 overflow-hidden"
                                    >
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl flex items-center gap-3">
                                            <div className="size-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-5"
                                    >
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-agro-green/80 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Nombre Completo de Agricultor</label>
                                                <input
                                                    required={!isLogin}
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    className="block w-full px-4 py-4 bg-slate-100 border border-white/10 rounded-xl text-agro-navy placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-agro-green/50 focus:border-agro-green/50 transition-all font-display text-sm"
                                                    placeholder="Ej: Juan Pérez"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-agro-green/80 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Correo electrónico</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <AtSign className="text-slate-500 group-focus-within:text-agro-green transition-colors size-5" />
                                        </div>
                                        <input
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-100 border border-white/10 rounded-xl text-agro-navy placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-agro-green/50 focus:border-agro-green/50 transition-all font-display text-sm"
                                            placeholder="usuario@agroia.ai"
                                            type="email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2 ml-1">
                                        <label className="block text-agro-green/80 text-[10px] font-bold uppercase tracking-widest">Contraseña</label>
                                        <a className="text-[10px] text-slate-500 hover:text-agro-green transition-colors uppercase tracking-widest font-bold" href="#">¿Olvidaste?</a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="text-slate-500 group-focus-within:text-agro-green transition-colors size-5" />
                                        </div>
                                        <input
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-12 pr-12 py-4 bg-slate-100 border border-white/10 rounded-xl text-agro-navy placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-agro-green/50 focus:border-agro-green/50 transition-all font-display text-sm"
                                            placeholder="••••••••••••"
                                            type={showPassword ? "text" : "password"}
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="text-slate-400 hover:text-slate-600 size-5" /> : <Eye className="text-slate-400 hover:text-slate-600 size-5" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Acción Primaria Dinámica */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full ${isLoading ? 'bg-slate-700' : 'bg-agro-green hover:bg-agro-green/90'} text-agro-navy font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] group shadow-[0_4px_20px_rgba(0,255,135,0.4)] disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <span className="text-sm tracking-widest uppercase">
                                            {isLoading ? 'PROCESANDO...' : (isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA')}
                                        </span>
                                        <Terminal className={`size-5 ${isLoading ? 'animate-spin' : 'group-hover:translate-x-1'} transition-transform`} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    {/* Biometric Footer */}
                    <div className="mt-8 flex flex-col items-center">
                        <div className="h-[1px] w-12 bg-white/10 mb-6"></div>
                        <button className="relative flex items-center justify-center size-14 rounded-full border border-agro-green/30 bg-agro-green/5 hover:bg-agro-green/10 transition-colors group">
                            <Fingerprint className="text-agro-green size-8 animate-pulse" />
                            <div className="absolute -inset-1 border border-agro-green/20 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        <p className="mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Acceso biométrico seguro</p>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-8 flex justify-center items-center gap-4 text-[10px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="size-1.5 bg-agro-green rounded-full animate-pulse shadow-[0_0_8px_#00ff88]"></span>
                        <span className="uppercase tracking-widest">Conexión estable</span>
                    </div>
                    <span className="opacity-30">|</span>
                    <span className="uppercase tracking-widest">v4.0.2-ALPHA</span>
                </div>
            </motion.div>

            {/* Decorative Corner Accents */}
            <div className="fixed top-8 left-8 border-l border-t border-agro-green/20 w-8 h-8 rounded-tl-lg hidden md:block"></div>
            <div className="fixed top-8 right-8 border-r border-t border-agro-green/20 w-8 h-8 rounded-tr-lg hidden md:block"></div>
            <div className="fixed bottom-8 left-8 border-l border-b border-agro-green/20 w-8 h-8 rounded-bl-lg hidden md:block"></div>
            <div className="fixed bottom-8 right-8 border-r border-b border-agro-green/20 w-8 h-8 rounded-br-lg hidden md:block"></div>
        </div>
    );
};

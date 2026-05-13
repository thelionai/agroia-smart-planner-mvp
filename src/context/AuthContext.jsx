import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('agroia_token'));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        console.log("[Auth] Cerrando sesión...");
        localStorage.removeItem('agroia_token');
        localStorage.removeItem('agroia_authenticated');
        localStorage.removeItem('agroia_user_email');
        setToken(null);
        setUser(null);
    }, []);

    // Validar sesión al cargar u obtener perfil
    useEffect(() => {
        const validateSession = async () => {
            if (token) {
                try {
                    console.log("[Auth] Validando token existente...");
                    const res = await api.get('/users/me');
                    setUser(res.data);
                    localStorage.setItem('agroia_authenticated', 'true');
                } catch (err) {
                    console.error("[Auth] Token inválido o expirado:", err.message);
                    logout();
                }
            }
            setLoading(false);
        };
        validateSession();
    }, [token, logout]);

    const login = async (email, password) => {
        try {
            console.log("[Auth] Iniciando sesión real...");
            const res = await api.post('/users/login', { email, password });
            const { access_token } = res.data;

            localStorage.setItem('agroia_token', access_token);
            setToken(access_token);

            // Obtener datos del usuario inmediatamente
            const userRes = await api.get('/users/me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            setUser(userRes.data);
            localStorage.setItem('agroia_authenticated', 'true');
            localStorage.setItem('agroia_user_email', userRes.data.email);

            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Correo o contraseña incorrectos";
            throw new Error(errorMsg);
        }
    };

    const register = async (nombre, email, password) => {
        try {
            console.log("[Auth] Registrando nuevo usuario...");
            await api.post('/users/register', { nombre, email, password });
            console.log("[Auth] Registro exitoso, procediendo a login...");
            return await login(email, password);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "No se pudo crear la cuenta";
            throw new Error(errorMsg);
        }
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

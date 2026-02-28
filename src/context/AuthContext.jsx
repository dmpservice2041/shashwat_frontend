import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    if (res.success || res.status === 'success') {
                        setUser(res.data?.user || res.data || res.user);
                    } else {
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error("Token validation failed", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        console.log('Login API Response:', res);

        if (res.success || res.status === 'success' || res.token) {
            localStorage.setItem('token', res.data?.token || res.token);
            setUser(res.data?.user || res.data || res.user);
            return { success: true };
        }
        return { success: false, message: res.message || 'Login failed' };
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

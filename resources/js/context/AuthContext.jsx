import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();
const TOKEN_KEY = 'relieflink_token';
const USER_KEY = 'relieflink_authenticated_user';

const readCachedUser = () => {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
        localStorage.removeItem(USER_KEY);
        return null;
    }
};

const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readCachedUser);
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)) && !readCachedUser());

    const refresh = async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            clearSession();
            setUser(null);
            setLoading(false);
            return null;
        }

        // Restore only the basic authenticated user snapshot; the server still validates
        // the token and replaces this value with the authoritative account record.
        const cachedUser = readCachedUser();
        if (cachedUser) {
            setUser(cachedUser);
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const { data } = await api.get('/user');
            const authenticatedUser = data.data || data;
            localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
            setUser(authenticatedUser);
            return authenticatedUser;
        } catch {
            clearSession();
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const login = async (values, register = false) => {
        const { data } = await api.post(register ? '/register' : '/login', values);
        const authenticatedUser = data.user.data || data.user;
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
        setLoading(false);
        return authenticatedUser;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            clearSession();
            setUser(null);
            setLoading(false);
        }
    };

    return <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>;
}

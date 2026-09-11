import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider.');
    return context;
};

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [state, setState] = useState({ items: [], unreadCount: 0, loading: false, error: '' });
    const revision = useRef(0);
    const refreshInFlight = useRef(null);

    const reset = useCallback(() => {
        revision.current += 1;
        setState({ items: [], unreadCount: 0, loading: false, error: '' });
    }, []);

    const refresh = useCallback(async ({ showLoading = false } = {}) => {
        if (!user?.id) {
            reset();
            return;
        }

        // Coalesce focus, polling, and local-mutation refreshes into one request.
        if (refreshInFlight.current) return refreshInFlight.current;

        const requestRevision = revision.current;
        if (showLoading) setState((current) => ({ ...current, loading: true, error: '' }));

        const request = (async () => {
            try {
                const { data } = await api.get('/notifications');
                // Never allow an older response to undo a more recent read/delete action.
                if (requestRevision !== revision.current) return;

                setState({
                    items: Array.isArray(data.data) ? data.data : [],
                    unreadCount: Number(data.unread_count || 0),
                    loading: false,
                    error: '',
                });
            } catch (error) {
                if (requestRevision !== revision.current) return;
                setState((current) => ({
                    ...current,
                    loading: false,
                    error: current.items.length ? 'Could not refresh notifications.' : 'Could not load notifications.',
                }));
            } finally {
                refreshInFlight.current = null;
            }
        })();

        refreshInFlight.current = request;
        return request;
    }, [reset, user?.id]);

    useEffect(() => {
        if (!user?.id) {
            reset();
            return undefined;
        }

        refresh({ showLoading: true });
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') refresh();
        };

        window.addEventListener('focus', refreshWhenVisible);
        window.addEventListener('relieflink:notification-source-changed', refreshWhenVisible);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        // A single provider means there is only one lightweight poll for the whole application.
        const interval = window.setInterval(refreshWhenVisible, 10000);

        return () => {
            window.removeEventListener('focus', refreshWhenVisible);
            window.removeEventListener('relieflink:notification-source-changed', refreshWhenVisible);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
            window.clearInterval(interval);
        };
    }, [refresh, reset, user?.id]);

    const applyServerMutation = useCallback((updater) => {
        revision.current += 1;
        setState(updater);
    }, []);

    const markAsRead = useCallback(async (id) => {
        await api.patch(`/notifications/${id}/read`);
        applyServerMutation((current) => {
            const notification = current.items.find((item) => item.id === id);
            if (!notification || notification.is_read) return current;
            return {
                ...current,
                items: current.items.map((item) => item.id === id ? { ...item, is_read: true } : item),
                unreadCount: Math.max(0, current.unreadCount - 1),
            };
        });
    }, [applyServerMutation]);

    const markAllAsRead = useCallback(async () => {
        await api.patch('/notifications/read-all');
        applyServerMutation((current) => ({
            ...current,
            items: current.items.map((item) => ({ ...item, is_read: true })),
            unreadCount: 0,
        }));
    }, [applyServerMutation]);

    const removeNotification = useCallback(async (id) => {
        await api.delete(`/notifications/${id}`);
        applyServerMutation((current) => {
            const notification = current.items.find((item) => item.id === id);
            return {
                ...current,
                items: current.items.filter((item) => item.id !== id),
                unreadCount: Math.max(0, current.unreadCount - (notification && !notification.is_read ? 1 : 0)),
            };
        });
    }, [applyServerMutation]);

    const clearNotifications = useCallback(async () => {
        await api.delete('/notifications');
        applyServerMutation(() => ({ items: [], unreadCount: 0, loading: false, error: '' }));
    }, [applyServerMutation]);

    return (
        <NotificationContext.Provider value={{ ...state, refresh, markAsRead, markAllAsRead, removeNotification, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

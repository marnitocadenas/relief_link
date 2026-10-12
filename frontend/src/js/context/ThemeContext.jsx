import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

const ADMIN_THEME_KEY = 'relieflink_theme_admin';
const STAFF_THEME_KEY = 'relieflink_theme_staff';
const MEMBER_THEME_KEY = 'relieflink_theme_member';

export const getPanelForPathAndUser = (pathname, user) => {
    if (pathname && pathname.startsWith('/staff')) {
        return 'staff';
    }
    if (pathname && (pathname.startsWith('/admin') || pathname === '/dashboard' || pathname === '/users' || pathname === '/reports')) {
        return 'admin';
    }
    if (user?.role === 'staff') {
        return 'staff';
    }
    if (user?.role === 'admin') {
        return 'admin';
    }
    if (['donor', 'beneficiary'].includes(user?.role)) {
        return 'member';
    }
    return null;
};

export function ThemeProvider({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    // Keep separate preferences for operations staff, administrators, and campus users.
    const [adminTheme, setAdminThemeState] = useState(() => {
        try {
            return localStorage.getItem(ADMIN_THEME_KEY) || 'light';
        } catch {
            return 'light';
        }
    });

    const [staffTheme, setStaffThemeState] = useState(() => {
        try {
            return localStorage.getItem(STAFF_THEME_KEY) || 'light';
        } catch {
            return 'light';
        }
    });

    const [memberTheme, setMemberThemeState] = useState(() => {
        try {
            return localStorage.getItem(MEMBER_THEME_KEY) || 'light';
        } catch {
            return 'light';
        }
    });

    const currentPanel = getPanelForPathAndUser(location.pathname, user);

    // Active theme depends strictly on which panel is active
    const theme = currentPanel === 'admin'
        ? adminTheme
        : currentPanel === 'staff'
            ? staffTheme
            : currentPanel === 'member'
                ? memberTheme
                : 'light';

    const isDark = theme === 'dark';

    // Toggle theme for the CURRENT active panel only
    const toggleTheme = () => {
        if (currentPanel === 'admin') {
            const next = adminTheme === 'dark' ? 'light' : 'dark';
            setAdminThemeState(next);
            try {
                localStorage.setItem(ADMIN_THEME_KEY, next);
            } catch {
                // Storage exception safety
            }
        } else if (currentPanel === 'staff') {
            const next = staffTheme === 'dark' ? 'light' : 'dark';
            setStaffThemeState(next);
            try {
                localStorage.setItem(STAFF_THEME_KEY, next);
            } catch {
                // Storage exception safety
            }
        } else if (currentPanel === 'member') {
            const next = memberTheme === 'dark' ? 'light' : 'dark';
            setMemberThemeState(next);
            try {
                localStorage.setItem(MEMBER_THEME_KEY, next);
            } catch {
                // Storage exception safety
            }
        }
    };

    const setAdminTheme = (newTheme) => {
        const next = newTheme === 'dark' ? 'dark' : 'light';
        setAdminThemeState(next);
        try {
            localStorage.setItem(ADMIN_THEME_KEY, next);
        } catch {
            // Storage exception safety
        }
    };

    const setStaffTheme = (newTheme) => {
        const next = newTheme === 'dark' ? 'dark' : 'light';
        setStaffThemeState(next);
        try {
            localStorage.setItem(STAFF_THEME_KEY, next);
        } catch {
            // Storage exception safety
        }
    };

    const setMemberTheme = (newTheme) => {
        const next = newTheme === 'dark' ? 'dark' : 'light';
        setMemberThemeState(next);
        try {
            localStorage.setItem(MEMBER_THEME_KEY, next);
        } catch {
            // Storage exception safety
        }
    };

    // Apply or remove .dark on document.documentElement
    useEffect(() => {
        const isPanelDark = (currentPanel === 'admin' && adminTheme === 'dark') ||
                            (currentPanel === 'staff' && staffTheme === 'dark') ||
                            (currentPanel === 'member' && memberTheme === 'dark');

        if (isPanelDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }, [currentPanel, adminTheme, staffTheme, memberTheme]);

    return (
        <ThemeContext.Provider
            value={{
                isDark,
                theme,
                currentPanel,
                adminTheme,
                staffTheme,
                memberTheme,
                isAdminDark: adminTheme === 'dark',
                isStaffDark: staffTheme === 'dark',
                isMemberDark: memberTheme === 'dark',
                toggleTheme,
                setAdminTheme,
                setStaffTheme,
                setMemberTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            isDark: false,
            theme: 'light',
            currentPanel: null,
            adminTheme: 'light',
            staffTheme: 'light',
                memberTheme: 'light',
            isAdminDark: false,
            isStaffDark: false,
                isMemberDark: false,
            toggleTheme: () => {},
            setAdminTheme: () => {},
            setStaffTheme: () => {},
            setMemberTheme: () => {},
        };
    }
    return context;
};

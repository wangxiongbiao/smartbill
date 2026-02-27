'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';

export interface GoogleUser {
    name: string;
    email: string;
    picture: string;
    sub: string;
}

interface AuthContextType {
    user: GoogleUser | null;
    isLoginModalOpen: boolean;
    login: (user: GoogleUser) => void;
    logout: () => void;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'invoicefiy_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
    }, []);

    const login = useCallback((googleUser: GoogleUser) => {
        setUser(googleUser);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
        } catch {
            // ignore
        }
        setIsLoginModalOpen(false);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    }, []);

    const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
    const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

    if (!mounted) return null;

    return (
        <AuthContext.Provider
            value={{ user, isLoginModalOpen, login, logout, openLoginModal, closeLoginModal }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

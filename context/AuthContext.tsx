'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import { type User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-browser';

interface AuthContextType {
    user: User | null;
    isLoginModalOpen: boolean;
    isLoggingOut: boolean;
    logout: () => Promise<void>;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Load the current session from the Cookie (set by middleware / callback)
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });

        // Listen for auth state changes (login / logout / token refresh)
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);

                // Sync user profile to the `profiles` table on first login
                if (event === 'SIGNED_IN' && session?.user) {
                    const { user } = session;
                    await supabase.from('profiles').upsert({
                        id: user.id,
                        full_name: user.user_metadata?.full_name ?? null,
                        avatar_url: user.user_metadata?.avatar_url ?? null,
                        updated_at: new Date().toISOString(),
                    });
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const logout = useCallback(async () => {
        try {
            setIsLoggingOut(true);
            await supabase.auth.signOut();
            // Force local state update even if the listener is slow
            setUser(null);
            // hard redirect is the most reliable way to clear all Next.js server/client state
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
            // Fallback: clear state anyway
            setUser(null);
            window.location.href = '/';
        } finally {
            // Usually the redirect happens first, but for safety:
            setIsLoggingOut(false);
        }
    }, []);

    const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
    const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

    if (!mounted) return null;

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoginModalOpen,
                isLoggingOut,
                logout,
                openLoginModal,
                closeLoginModal
            }}
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

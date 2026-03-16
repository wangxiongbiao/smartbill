"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { getProfile } from '@/lib/api/invoice';
import type { User, ViewType } from '@/types';

const PRIVATE_VIEWS: ViewType[] = ['home', 'records', 'profile', 'editor', 'templates', 'template-detail', 'school-records', 'school-editor'];

interface UsePersistentAuthSessionParams {
  activeView: ViewType;
}

export function usePersistentAuthSession({ activeView }: UsePersistentAuthSessionParams) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const syncRef = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);
  const bootstrappedRef = useRef(false);
  const activeViewRef = useRef(activeView);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseClient();

    const persistSessionSnapshot = (nextUser: User | null) => {
      try {
        if (nextUser) localStorage.setItem('sb_user_session', JSON.stringify(nextUser));
        else localStorage.removeItem('sb_user_session');
      } catch (error) {
        console.warn('[AuthSession] Failed to persist local session snapshot:', error);
      }
    };

    const finishBootstrapping = () => {
      if (!mounted) return;
      bootstrappedRef.current = true;
      setIsBootstrapping(false);
    };

    const clearSessionState = () => {
      syncRef.current = null;
      setUser(null);
      persistSessionSnapshot(null);
    };

    const syncUser = async (authUser: any, options?: { force?: boolean }) => {
      if (!mounted) return;
      if (!options?.force && syncRef.current === authUser.id && userRef.current?.id === authUser.id) {
        finishBootstrapping();
        return;
      }

      syncRef.current = authUser.id;
      try {
        const { profile } = await getProfile(authUser.id);
        if (!mounted) return;

        const nextUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
          provider: authUser.app_metadata?.provider || 'google',
          profile: profile || undefined
        };

        setUser(nextUser);
      } catch (error) {
        console.error('[AuthSession] Sync failed:', error);
      } finally {
        finishBootstrapping();
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          await syncUser(session.user);
          return;
        }

        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (!mounted) return;

        if (userError) {
          console.warn('[AuthSession] getUser fallback failed:', userError);
        }

        if (authUser) {
          await syncUser(authUser);
          return;
        }

        clearSessionState();
        finishBootstrapping();
      } catch (error) {
        console.error('[AuthSession] Initial session restore failed:', error);
        if (mounted) {
          clearSessionState();
          finishBootstrapping();
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        await syncUser(session.user, { force: event !== 'TOKEN_REFRESHED' });
        return;
      }

      if (event === 'SIGNED_OUT') {
        clearSessionState();
      }

      if (!session?.user && PRIVATE_VIEWS.includes(activeViewRef.current)) {
        // 保持壳子稳定，不在这里做整屏跳转
      }

      finishBootstrapping();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!bootstrappedRef.current) return;
    try {
      if (user) localStorage.setItem('sb_user_session', JSON.stringify(user));
      else localStorage.removeItem('sb_user_session');
    } catch (error) {
      console.warn('[AuthSession] Failed to sync local session snapshot:', error);
    }
  }, [user]);

  const logout = useCallback(async (onAfter?: () => void) => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    syncRef.current = null;
    setUser(null);
    bootstrappedRef.current = true;
    setIsBootstrapping(false);
    try {
      localStorage.removeItem('sb_user_session');
    } catch (error) {
      console.warn('[AuthSession] Failed to clear local session snapshot during logout:', error);
    }

    const supabase = createSupabaseClient();
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('[AuthSession] Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      onAfter?.();
    }
  }, []);

  return {
    isBootstrapping,
    isLoggingOut,
    user,
    setUser,
    logout,
  };
}

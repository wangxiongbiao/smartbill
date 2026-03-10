"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { getProfile } from '@/lib/api/invoice';
import type { User, ViewType } from '@/types';

const PRIVATE_VIEWS: ViewType[] = ['records', 'profile', 'editor', 'templates', 'template-detail'];

interface UsePersistentAuthSessionParams {
  activeView: ViewType;
}

export function usePersistentAuthSession({ activeView }: UsePersistentAuthSessionParams) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const syncRef = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseClient();

    const syncUser = async (authUser: any) => {
      if (!mounted) return;
      if (syncRef.current === authUser.id && userRef.current?.id === authUser.id) {
        setIsBootstrapping(false);
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
        if (mounted) {
          setIsBootstrapping(false);
        }
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

        setUser(null);
        setIsBootstrapping(false);
      } catch (error) {
        console.error('[AuthSession] Initial session restore failed:', error);
        if (mounted) {
          setUser(null);
          setIsBootstrapping(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        await syncUser(session.user);
        return;
      }

      if (event === 'SIGNED_OUT') {
        syncRef.current = null;
        setUser(null);
        localStorage.removeItem('sb_user_session');
      }

      if (!session?.user && PRIVATE_VIEWS.includes(activeView)) {
        // 保持壳子稳定，不在这里做整屏跳转
      }

      setIsBootstrapping(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [activeView]);

  useEffect(() => {
    if (user) localStorage.setItem('sb_user_session', JSON.stringify(user));
    else localStorage.removeItem('sb_user_session');
  }, [user]);

  const logout = useCallback(async (onAfter?: () => void) => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    syncRef.current = null;
    setUser(null);
    localStorage.removeItem('sb_user_session');

    const supabase = createSupabaseClient();
    supabase.auth.signOut().catch(console.error).finally(() => {
      onAfter?.();
    });
  }, []);

  return {
    isBootstrapping,
    isLoggingOut,
    user,
    setUser,
    logout,
  };
}

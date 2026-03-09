'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { batchSaveInvoiceRecords, getProfile, listInvoices } from '@/lib/api/invoice';
import type { Invoice, User, ViewType } from '@/types';

const PRIVATE_VIEWS: ViewType[] = ['records', 'profile', 'editor', 'templates', 'template-detail'];
const ALLOWED_VIEWS: ViewType[] = ['home', 'records', 'profile', 'editor', 'about', 'help', 'login', 'templates', 'template-detail'];

function getRequestedView(): ViewType {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const targetView = params.get('view') as ViewType | null;
  return targetView && ALLOWED_VIEWS.includes(targetView) ? targetView : 'home';
}

export function useAuthSession() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<Invoice[]>([]);
  const [activeView, setActiveView] = useState<ViewType>(getRequestedView);
  const syncRef = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);
  const requestedView = useMemo(() => getRequestedView(), []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const hydrateLocalRecords = () => {
      const savedRecords = localStorage.getItem('invoice_records_v2');
      if (!savedRecords) return;
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        console.warn('[useAuthSession] Failed to parse local invoice records');
      }
    };

    const applyViewForAuth = (hasUser: boolean) => {
      if (!hasUser && PRIVATE_VIEWS.includes(requestedView)) {
        setActiveView('login');
        return;
      }
      setActiveView(requestedView === 'login' && hasUser ? 'records' : requestedView);
    };

    const syncUser = async (authUser: any) => {
      if (!mounted) return;
      if (syncRef.current === authUser.id && userRef.current?.id === authUser.id) {
        setIsInitialized(true);
        applyViewForAuth(true);
        return;
      }

      syncRef.current = authUser.id;

      try {
        const [{ profile }, { invoices }] = await Promise.all([
          getProfile(authUser.id),
          listInvoices(authUser.id)
        ]);

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
        applyViewForAuth(true);

        if (invoices.length > 0) {
          setRecords(invoices);
        } else {
          const localRecords = JSON.parse(localStorage.getItem('invoice_records_v2') || '[]');
          if (localRecords.length > 0) {
            try {
              await batchSaveInvoiceRecords(localRecords);
              const refreshed = await listInvoices(authUser.id);
              if (mounted) setRecords(refreshed.invoices);
            } catch (error) {
              console.error('[useAuthSession] Batch sync failed:', error);
              if (mounted) setRecords(localRecords);
            }
          }
        }
      } catch (error) {
        console.error('[useAuthSession] Sync failed:', error);
      } finally {
        if (mounted) setIsInitialized(true);
      }
    };

    hydrateLocalRecords();

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          await syncUser(session.user);
          return;
        }

        setUser(null);
        applyViewForAuth(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('[useAuthSession] Initial session restore failed:', error);
        if (mounted) {
          setUser(null);
          applyViewForAuth(false);
          setIsInitialized(true);
        }
      }
    };

    const timeout = setTimeout(() => {
      if (!mounted) return;
      applyViewForAuth(!!userRef.current);
      setIsInitialized(true);
    }, 5000);

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
        setRecords([]);
        localStorage.removeItem('invoice_records_v2');
        localStorage.removeItem('sb_user_session');
      }

      applyViewForAuth(false);
      setIsInitialized(true);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [requestedView]);

  useEffect(() => {
    if (!isInitialized) return;
    if (user) localStorage.setItem('sb_user_session', JSON.stringify(user));
    else localStorage.removeItem('sb_user_session');
  }, [user, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('invoice_records_v2', JSON.stringify(records));
  }, [records, isInitialized]);

  const logout = async () => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    syncRef.current = null;
    setUser(null);
    setRecords([]);
    localStorage.removeItem('sb_user_session');
    localStorage.removeItem('invoice_records_v2');

    const supabase = createClient();
    supabase.auth.signOut().catch(console.error);
    window.location.href = '/';
  };

  return {
    isInitialized,
    isLoggingOut,
    user,
    setUser,
    records,
    setRecords,
    activeView,
    setActiveView,
    logout
  };
}

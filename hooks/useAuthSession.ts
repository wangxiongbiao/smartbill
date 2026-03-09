'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { batchSaveInvoiceRecords, getProfile, listInvoices } from '@/lib/api/invoice';
import type { Invoice, User, ViewType } from '@/types';

export function useAuthSession() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<Invoice[]>([]);
  const [activeView, setActiveView] = useState<ViewType>(() => {
    if (typeof window === 'undefined') return 'records';
    return localStorage.getItem('sb_user_session') ? 'records' : 'login';
  });
  const syncRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    const savedRecords = localStorage.getItem('invoice_records_v2');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {}
    }

    const syncUser = async (authUser: any) => {
      if (!mounted || syncRef.current === authUser.id) {
        setIsInitialized(true);
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
        setIsInitialized(true);

        const params = new URLSearchParams(window.location.search);
        const targetView = params.get('view') as ViewType | null;
        if (targetView && ['records', 'profile', 'editor', 'about', 'help', 'login', 'templates'].includes(targetView)) {
          setActiveView(targetView);
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          setActiveView('records');
        }

        if (invoices.length > 0) {
          setRecords(invoices);
        } else {
          const localRecords = JSON.parse(localStorage.getItem('invoice_records_v2') || '[]');
          if (localRecords.length > 0) {
            await batchSaveInvoiceRecords(localRecords);
            const refreshed = await listInvoices(authUser.id);
            if (mounted) setRecords(refreshed.invoices);
          }
        }
      } catch (error) {
        console.error('[useAuthSession] Sync failed:', error);
      } finally {
        if (mounted) setIsInitialized(true);
      }
    };

    const timeout = setTimeout(() => mounted && setIsInitialized(true), 5000);

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

      setIsInitialized(true);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

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

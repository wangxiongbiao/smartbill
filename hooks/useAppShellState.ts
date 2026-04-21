"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { useEditorUiState } from '@/hooks/useEditorUiState';
import { usePersistentAuthSession } from '@/hooks/usePersistentAuthSession';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { buildLangHref, getStoredLanguage, persistLanguage, resolveLanguage } from '@/lib/marketing';
import { getDocumentLanguage, resolveBrowserLanguage } from '@/lib/language';
import { getViewFromPath } from '@/lib/routes';
import type { DashboardShellProps } from '@/components/app/DashboardShellProps';
import { PRIVATE_VIEWS, type AppShellContextValue } from '@/components/app/app-shell.types';
import type { Language } from '@/types';

export function useAppShellState() {
  const pathname = usePathname();
  const search = typeof window === 'undefined' ? '' : window.location.search.replace(/^\?/, '');
  const activeView = getViewFromPath(pathname);

  const [lang, setLang] = useState<Language>('en');
  const [editorState, setEditorState] = useState<DashboardShellProps['editorState']>(null);
  const { toast, showToast, hideToast } = useToast();
  const editorUi = useEditorUiState();
  const navigation = useAppNavigation(activeView, pathname);
  const { prevView, setView, navigateToView, router } = navigation;
  const auth = usePersistentAuthSession({ activeView });
  const { isBootstrapping, isLoggingOut, user, setUser } = auth;

  useEffect(() => {
    const queryLang = resolveLanguage(new URLSearchParams(search).get('lang'));
    if (new URLSearchParams(search).has('lang')) {
      setLang(queryLang);
      persistLanguage(queryLang);
      return;
    }

    const savedLang = getStoredLanguage();
    if (savedLang) {
      setLang(savedLang);
      return;
    }

    if (typeof window !== 'undefined') {
      setLang(resolveBrowserLanguage(window.navigator.language));
    }
  }, [search]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = getDocumentLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (isBootstrapping || isLoggingOut || user) return;
    if (!PRIVATE_VIEWS.includes(activeView)) return;

    const nextPath = search ? `${pathname}?${search}` : pathname;
    const next = encodeURIComponent(nextPath);
    router.replace(`/?next=${next}`);
  }, [activeView, isBootstrapping, isLoggingOut, pathname, router, search, user]);

  const setConsoleLang = useCallback((nextLang: Language) => {
    setLang(nextLang);
    persistLanguage(nextLang);
  }, []);

  const logout = useCallback(async () => {
    await auth.logout(() => {
      window.location.replace(buildLangHref('/', lang));
    });
  }, [auth, lang]);

  const contextValue = useMemo<AppShellContextValue>(() => ({
    lang,
    setLang: setConsoleLang,
    activeView,
    prevView,
    isBootstrapping,
    isLoggingOut,
    user,
    setUser,
    toast,
    showToast,
    hideToast,
    isLogoutConfirmOpen: editorUi.isLogoutConfirmOpen,
    openLogoutConfirm: editorUi.openLogoutConfirm,
    closeLogoutConfirm: editorUi.closeLogoutConfirm,
    setView,
    navigateToView,
    logout,
    editorState,
    setEditorState,
  }), [
    activeView,
    editorUi.closeLogoutConfirm,
    editorUi.isLogoutConfirmOpen,
    editorUi.openLogoutConfirm,
    editorState,
    hideToast,
    isBootstrapping,
    isLoggingOut,
    lang,
    logout,
    navigateToView,
    prevView,
    setConsoleLang,
    setEditorState,
    setUser,
    setView,
    showToast,
    toast,
    user,
  ]);

  const dashboardShellProps = useMemo<Omit<DashboardShellProps, 'children'>>(() => ({
    user,
    lang,
    activeView,
    onSetView: setView,
    onSetLang: setConsoleLang,
    onLogout: editorUi.openLogoutConfirm,
    isLoggingOut,
    isLogoutConfirmOpen: editorUi.isLogoutConfirmOpen,
    onCloseLogoutConfirm: editorUi.closeLogoutConfirm,
    onConfirmLogout: logout,
    toast,
    onCloseToast: hideToast,
    editorState,
  }), [
    activeView,
    editorUi.closeLogoutConfirm,
    editorUi.isLogoutConfirmOpen,
    editorUi.openLogoutConfirm,
    editorState,
    hideToast,
    isLoggingOut,
    lang,
    logout,
    setConsoleLang,
    setView,
    toast,
    user,
  ]);

  return {
    contextValue,
    dashboardShellProps,
    lang,
  };
}

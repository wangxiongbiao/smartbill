'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPromptDialog from '@/components/LoginPromptDialog';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { createClient } from '@/lib/supabase/client';
import { buildLangHref, getStoredLanguage } from '@/lib/marketing';
import type { Language } from '@/types';

interface MarketingProfile {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

interface MarketingAuthContextValue {
  isLoggedIn: boolean;
  profile: MarketingProfile;
  isGoogleLoading: boolean;
  openProtectedRoute: (targetPath: string) => void;
}

const MarketingAuthContext = createContext<MarketingAuthContextValue | null>(null);

export function MarketingAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<MarketingProfile>({});
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginTargetPath, setLoginTargetPath] = useState('/dashboard');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPromptLang, setLoginPromptLang] = useState<Language>('en');

  const handleAuthSuccess = useCallback((target: string) => {
    setLoginError(null);
    setIsLoginPromptOpen(false);
    router.push(target || '/dashboard');
  }, [router]);

  const handleAuthError = useCallback((message: string) => {
    setLoginError(message);
  }, []);

  const authOptions = useMemo(() => ({
    onSuccess: handleAuthSuccess,
    onError: handleAuthError,
  }), [handleAuthError, handleAuthSuccess]);

  const { isGoogleLoading, handleGoogleLogin } = useGoogleAuth(authOptions);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const syncSession = (sessionUser: any) => {
      if (!mounted) return;

      setIsLoggedIn(!!sessionUser);
      setProfile({
        name: sessionUser?.user_metadata?.full_name ?? null,
        email: sessionUser?.email ?? null,
        avatar: sessionUser?.user_metadata?.avatar_url ?? null,
      });
    };

    supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session?.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openProtectedRoute = useCallback((targetPath: string) => {
    const currentLang = getStoredLanguage() || 'en';
    const nextTargetPath = buildLangHref(targetPath, currentLang);

    if (isLoggedIn) {
      router.push(nextTargetPath);
      return;
    }

    setLoginError(null);
    setLoginPromptLang(currentLang);
    setLoginTargetPath(nextTargetPath);
    setIsLoginPromptOpen(true);
  }, [isLoggedIn, router]);

  const closeLoginPrompt = useCallback(() => {
    if (isGoogleLoading) return;
    setIsLoginPromptOpen(false);
    setLoginError(null);
  }, [isGoogleLoading]);

  const continueWithGoogle = useCallback(() => {
    setLoginError(null);
    void handleGoogleLogin(loginTargetPath);
  }, [handleGoogleLogin, loginTargetPath]);

  const contextValue = useMemo<MarketingAuthContextValue>(() => ({
    isLoggedIn,
    profile,
    isGoogleLoading,
    openProtectedRoute,
  }), [isGoogleLoading, isLoggedIn, openProtectedRoute, profile]);

  return (
    <MarketingAuthContext.Provider value={contextValue}>
      {children}
      <LoginPromptDialog
        isOpen={isLoginPromptOpen}
        onClose={closeLoginPrompt}
        onContinue={continueWithGoogle}
        isProcessing={isGoogleLoading}
        targetPath={loginTargetPath}
        errorMessage={loginError}
        lang={loginPromptLang}
      />
    </MarketingAuthContext.Provider>
  );
}

export function useMarketingAuth() {
  const context = useContext(MarketingAuthContext);
  if (!context) {
    throw new Error('useMarketingAuth must be used within MarketingAuthProvider');
  }
  return context;
}

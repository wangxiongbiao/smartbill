'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ViewType } from '@/types';

declare global {
  interface Window {
    google: any;
  }
}

interface UseGoogleAuthOptions {
  targetView?: ViewType;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const currentPath = typeof window !== 'undefined' && window.location.pathname === '/' ? '' : window.location.pathname;
      const viewParam = options.targetView ? `view=${options.targetView}` : '';

      let nextUrl = currentPath;
      if (viewParam) nextUrl += (nextUrl.includes('?') ? '&' : '?') + viewParam;

      const redirectTo = `${window.location.origin}/auth/callback${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Failed to get Google login URL');

      window.location.href = data.url;
    } catch (error: any) {
      setIsGoogleLoading(false);
      options.onError?.(error.message || 'Google login failed');
    }
  }, [options]);

  useEffect(() => {
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;

    const initializeOneTap = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        callback: async (response: any) => {
          setIsGoogleLoading(true);
          try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential
            });

            if (error) throw error;
            if (data.session) options.onSuccess?.();
          } catch (error: any) {
            options.onError?.(error.message || 'One Tap login failed');
          } finally {
            setIsGoogleLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false
      });

      window.google.accounts.id.prompt();
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeOneTap;
      document.body.appendChild(script);
    } else if (window.google) {
      initializeOneTap();
    }
  }, [options]);

  return { isGoogleLoading, handleGoogleLogin };
}

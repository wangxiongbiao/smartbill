'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseGoogleAuthOptions {
  nextPath?: string;
  onSuccess?: (nextPath: string) => void;
  onError?: (message: string) => void;
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const nextPath = options.nextPath || '/dashboard';
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}&popup=1`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
          skipBrowserRedirect: true,
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Failed to get Google login URL');

      const popup = window.open(
        data.url,
        'smartbill-google-login',
        'popup=yes,width=520,height=680,menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes,status=no'
      );

      if (!popup) throw new Error('Popup was blocked. Please allow popups and try again.');

      await new Promise<void>((resolve, reject) => {
        let handled = false;

        const cleanup = () => {
          window.clearTimeout(timeout);
          window.clearInterval(poll);
          window.removeEventListener('message', onMessage);
          try { popup.close(); } catch {}
          setIsGoogleLoading(false);
        };

        const timeout = window.setTimeout(() => {
          if (handled) return;
          handled = true;
          cleanup();
          reject(new Error('Google login timed out. Please try again.'));
        }, 120000);

        const poll = window.setInterval(() => {
          if (!popup.closed || handled) return;

          window.setTimeout(() => {
            if (handled) return;
            handled = true;
            cleanup();
            reject(new Error('Google login was cancelled.'));
          }, 800);
        }, 500);

        const onMessage = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin || handled) return;
          const type = event.data?.type;

          if (type === 'SMARTBILL_AUTH_SUCCESS') {
            handled = true;
            const target = event.data?.next || nextPath;

            try {
              await supabase.auth.getUser();
            } catch (refreshError) {
              console.warn('[GoogleAuth] Failed to refresh auth state after popup login:', refreshError);
            }

            cleanup();
            options.onSuccess?.(target);
            resolve();
          }

          if (type === 'SMARTBILL_AUTH_ERROR') {
            handled = true;
            cleanup();
            reject(new Error('Google login failed.'));
          }
        };

        window.addEventListener('message', onMessage);
      });
    } catch (error: any) {
      setIsGoogleLoading(false);
      options.onError?.(error.message || 'Google login failed');
    }
  }, [options]);

  return { isGoogleLoading, handleGoogleLogin };
}

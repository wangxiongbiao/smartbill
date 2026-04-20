import type { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import {
  API_BASE_URL,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  getAuthRedirectUrl,
  hasSupabaseConfig,
} from '@/shared/auth/config';
import {
  buildNativeGoogleSignInConfig,
  getGoogleIdTokenFromSignInResult,
} from '@/shared/auth/native-google';
import { registerSupabaseAppStateListener, supabase } from '@/shared/auth/supabase';

WebBrowser.maybeCompleteAuthSession();

type AppProfile = {
  id?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  profile?: AppProfile | null;
};

type AuthContextValue = {
  accessToken: string | null;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseAuthUrl(url: string) {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  if (parsedUrl.hash.startsWith('#')) {
    const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));

    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }

  return params;
}

function buildAuthUser(authUser: User, profile?: AppProfile | null): AuthUser {
  return {
    id: authUser.id,
    email: authUser.email || '',
    name:
      profile?.fullName ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split('@')[0] ||
      'User',
    avatar:
      profile?.avatarUrl ||
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      undefined,
    provider: authUser.app_metadata?.provider || 'google',
    profile,
  };
}

async function fetchCurrentUserProfile(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Auth bootstrap failed with status ${response.status}`);
  }

  const payload = await response.json();
  const profile = payload?.profile ?? null;

  return {
    profile: profile
      ? {
        id: payload?.user?.id || undefined,
        fullName: profile.full_name ?? null,
        avatarUrl: profile.avatar_url ?? null,
      }
      : null,
  };
}

async function signInWithGoogleNative() {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');

  GoogleSignin.configure(
    buildNativeGoogleSignInConfig({
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
    })
  );

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const nativeResult = await GoogleSignin.signIn();
  const idToken = getGoogleIdTokenFromSignInResult(nativeResult);

  if (!idToken) {
    throw new Error('Google sign-in completed without an ID token. Check your Google client configuration.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) {
    throw error;
  }

  return { data, nativeResult };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeAuthFromUrl = useCallback(async (url: string) => {
    const params = parseAuthUrl(url);
    const errorDescription = params.get('error_description') || params.get('error');

    if (errorDescription) {
      throw new Error(errorDescription);
    }

    const code = params.get('code');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        throw exchangeError;
      }

      return;
    }

    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        throw sessionError;
      }
    }
  }, []);

  const hydrateUser = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession?.user) {
      setUser(null);
      return;
    }

    try {
      const profilePayload = nextSession.access_token
        ? await fetchCurrentUserProfile(nextSession.access_token).catch(() => null)
        : null;

      setUser(buildAuthUser(nextSession.user, profilePayload?.profile));
    } catch (authError) {
      console.warn('[AuthProvider] Failed to load remote profile, falling back to auth metadata:', authError);
      setUser(buildAuthUser(nextSession.user));
    }
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setError(
        'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them before testing login.'
      );
      setIsLoading(false);
      return;
    }

    const unregisterRefreshListener = registerSupabaseAppStateListener();
    let mounted = true;

    const bootstrap = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        await hydrateUser(initialSession);
      } catch (bootstrapError) {
        console.error('[AuthProvider] Failed to restore session:', bootstrapError);
        if (mounted) {
          setError('Unable to restore your session. Please sign in again.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrateUser(nextSession).catch((authError) => {
        console.error('[AuthProvider] Failed to sync auth state:', authError);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      unregisterRefreshListener();
    };
  }, [completeAuthFromUrl, hydrateUser]);

  const signInWithGoogle = useCallback(async () => {
    if (!hasSupabaseConfig()) {
      setError(
        'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them before testing login.'
      );
      return;
    }

    setIsSigningIn(true);
    setError(null);

    try {
      if (Platform.OS !== 'web') {
        await signInWithGoogleNative();
        return;
      }

      const redirectTo = getAuthRedirectUrl();
      console.log('[AuthProvider] Web fallback redirectTo:', redirectTo);
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: true,
        },
      });

      if (signInError) {
        throw signInError;
      }

      if (!data?.url) {
        throw new Error('Failed to start Google sign-in.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'cancel') {
        throw new Error('Google sign-in was cancelled by the user.');
      }

      if (result.type === 'dismiss') {
        throw new Error('Google sign-in browser closed before the app callback completed.');
      }

      if (result.type !== 'success' || !result.url) {
        throw new Error('Google sign-in did not complete.');
      }

      await completeAuthFromUrl(result.url);
    } catch (authError) {
      if (
        authError &&
        typeof authError === 'object' &&
        'code' in authError &&
        authError.code === 'SIGN_IN_CANCELLED'
      ) {
        setError('Google sign-in was cancelled by the user.');
      } else {
        const message =
          authError instanceof Error ? authError.message : 'Google sign-in failed.';
        setError(message);
      }
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      console.warn('[AuthProvider] Global signout failed, clearing local session anyway', e);
    } finally {
      setSession(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session?.access_token || null,
      error,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      isSigningIn,
      session,
      signInWithGoogle,
      signOut,
      user,
    }),
    [error, isLoading, isSigningIn, session, signInWithGoogle, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

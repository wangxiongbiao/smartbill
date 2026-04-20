import 'react-native-url-polyfill/auto';

import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from '@/shared/auth/config';

const memoryStorage = new Map<string, string>();

const canUseSecureStore =
  typeof SecureStore.getItemAsync === 'function' &&
  typeof SecureStore.setItemAsync === 'function' &&
  typeof SecureStore.deleteItemAsync === 'function';

const storage = {
  getItem: async (key: string) => {
    if (canUseSecureStore && Platform.OS !== 'web') {
      return SecureStore.getItemAsync(key);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }

    return memoryStorage.get(key) ?? null;
  },
  setItem: async (key: string, value: string) => {
    if (canUseSecureStore && Platform.OS !== 'web') {
      return SecureStore.setItemAsync(key, value);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }

    memoryStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    if (canUseSecureStore && Platform.OS !== 'web') {
      return SecureStore.deleteItemAsync(key);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }

    memoryStorage.delete(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    persistSession: true,
    storage,
  },
  global: {
    headers: {
      'X-Client-Info': 'smartbill-mobile',
    },
  },
});

let refreshListenerRegistered = false;

export function registerSupabaseAppStateListener() {
  if (refreshListenerRegistered || !hasSupabaseConfig()) {
    return () => undefined;
  }

  refreshListenerRegistered = true;
  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      supabase.auth.startAutoRefresh();
      return;
    }

    supabase.auth.stopAutoRefresh();
  });

  return () => {
    refreshListenerRegistered = false;
    subscription.remove();
  };
}

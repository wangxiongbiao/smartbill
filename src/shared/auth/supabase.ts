import 'react-native-url-polyfill/auto';

import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from '@/shared/auth/config';

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
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

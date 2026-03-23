import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://smartbillpro.com'
).replace(/\/+$/, '');

export const AUTH_CALLBACK_PATH = 'auth/callback';

export function getAuthRedirectUrl() {
  return Linking.createURL(AUTH_CALLBACK_PATH);
}

export function requiresNativeAuthBuild() {
  return Constants.executionEnvironment === 'storeClient';
}

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

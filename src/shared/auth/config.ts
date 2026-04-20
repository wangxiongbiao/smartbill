import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

import { shouldBlockGoogleSignInForExecutionEnvironment } from '@/shared/auth/runtime';

export const SUPABASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

export const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const API_BASE_URL = (
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://smartbillpro.com'
).replace(/\/+$/, '');

export const GOOGLE_WEB_CLIENT_ID =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '';

export const GOOGLE_IOS_CLIENT_ID =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
  '';

export const AUTH_CALLBACK_PATH='***';

export function getAuthRedirectUrl() {
  return Linking.createURL(AUTH_CALLBACK_PATH);
}

export function requiresNativeAuthBuild() {
  return shouldBlockGoogleSignInForExecutionEnvironment(Constants.executionEnvironment);
}

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}


'use client';
import React, { useState } from 'react';
import { User, Language, ViewType } from '../types';
import { translations } from '../i18n';
import { createClient } from '@/lib/supabase/client';

interface AuthViewProps {
  onLogin: (user: User) => void;
  lang: Language;
  targetView?: ViewType;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, lang, targetView, showToast }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const t = translations[lang] || translations['en'];

  const handleGoogleLogin = async () => {
    console.log('[AuthView] Google login button clicked');
    setIsGoogleLoading(true);

    try {
      console.log('[AuthView] Creating Supabase client...');
      const supabase = createClient();
      console.log('[AuthView] Supabase client created');

      // 获取当前路径和视图，以便登录后跳回
      const currentPath = window.location.pathname === '/' ? '' : window.location.pathname;
      const viewParam = targetView ? `view=${targetView}` : '';

      let nextUrl = currentPath;
      if (viewParam) {
        nextUrl += (nextUrl.includes('?') ? '&' : '?') + viewParam;
      }

      const redirectTo = `${window.location.origin}/auth/callback${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`;

      console.log('[AuthView] Redirect URL:', redirectTo);
      console.log('[AuthView] Calling signInWithOAuth...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('[AuthView] signInWithOAuth response:', { data, error });

      if (error) {
        console.error('Google login error:', error);
        showToast?.(`Google login failed: ${error.message || 'Unknown error'}`, 'error');
        setIsGoogleLoading(false);
        return;
      } else if (data?.url) {
        console.log('[AuthView] ✅ OAuth URL received, redirecting to:', data.url);
        // CRITICAL: Supabase doesn't auto-redirect, we must manually navigate
        window.location.href = data.url;
      } else {
        console.error('[AuthView] ❌ No OAuth URL returned');
        showToast?.('Failed to get Google login URL', 'error');
        setIsGoogleLoading(false);
      }
    } catch (error: any) {
      console.error('[AuthView] ❌ Google login exception:', error);
      showToast?.(`Google login error: ${error.message || 'Unknown error'}`, 'error');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative z-10">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-[1.5rem] text-white text-3xl shadow-xl shadow-blue-100 mb-6">
              <i className="fas fa-file-invoice"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              SmartBill <span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-3 px-4">
              {lang === 'zh-TW'
                ? '立即登录以开启您的智能账单云同步体验'
                : lang === 'en'
                  ? 'Sign in to start your smart bill cloud sync experience'
                  : 'Anmelden, um Ihre intelligente Rechnungs-Cloud-Synchronisierung zu starten'}
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-16 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-3xl font-black transition-all active:scale-95 flex items-center justify-center gap-4 shadow-sm hover:shadow-md group"
            >
              {isGoogleLoading ? (
                <i className="fas fa-circle-notch fa-spin text-slate-600"></i>
              ) : (
                <>
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-slate-800 tracking-tight text-lg">
                    {lang === 'zh-TW' ? '使用 Google 帳戶登錄' : lang === 'en' ? 'Sign in with Google' : 'Mit Google anmelden'}
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8">
              Privacy Secure • Cloud Sync • AI Powered
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;


'use client';
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../i18n';

interface AuthViewProps {
  onLogin: (user: User) => void;
  lang: Language;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, lang }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[lang] || translations['en'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'u-' + Date.now(),
        email: email || 'user@example.com',
        name: email.split('@')[0] || 'Smart User',
        provider: 'email'
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative z-10">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-[1.5rem] text-white text-3xl shadow-xl shadow-blue-100 mb-4">
              <i className="fas fa-file-invoice"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              SmartBill <span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-2">
              {mode === 'login' ? t.welcomeSub : t.joinPro}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.email}</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.password}</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-blue-600 hover:underline">{t.forgotPassword}</button>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                mode === 'login' ? t.submitLogin : t.submitRegister
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm font-medium">
            {mode === 'login' ? t.noAccount : t.hasAccount}
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 font-bold ml-1 hover:underline"
            >
              {mode === 'login' ? t.register : t.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

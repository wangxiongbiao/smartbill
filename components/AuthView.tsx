
import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 模拟 API 调用
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

  const handleFacebookLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'fb-' + Date.now(),
        email: 'fb_user@facebook.com',
        name: 'Facebook User',
        provider: 'facebook'
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative z-10 transition-all duration-500">
        <div className="p-8 sm:p-12">
          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-[1.5rem] text-white text-3xl shadow-xl shadow-blue-100 mb-4">
              <i className="fas fa-file-invoice"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              SmartBill <span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-2">
              {mode === 'login' ? '欢迎回来，请登录您的账户' : '开启您的专业开票之旅'}
            </p>
          </div>

          {/* Social Login */}
          <button 
            onClick={handleFacebookLogin}
            className="w-full h-14 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-100 mb-6"
          >
            <i className="fab fa-facebook text-xl"></i>
            <span>通过 Facebook {mode === 'login' ? '登录' : '注册'}</span>
          </button>

          <div className="relative flex items-center gap-4 mb-6 text-slate-300">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">或使用邮箱</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">邮箱地址</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">安全密码</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-blue-600 hover:underline">忘记密码？</button>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                mode === 'login' ? '立即登录' : '立即注册'
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <p className="text-center mt-8 text-slate-500 text-sm font-medium">
            {mode === 'login' ? '还没有账户？' : '已经有账户了？'}
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 font-bold ml-1 hover:underline"
            >
              {mode === 'login' ? '现在注册' : '返回登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

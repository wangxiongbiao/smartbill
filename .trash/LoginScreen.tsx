"use client";

import Link from 'next/link';
import AuthView from '@/components/AuthView';
import type { Language, ViewType } from '@/types';

interface LoginScreenProps {
  lang: Language;
  targetView?: ViewType;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function LoginScreen({ lang, targetView = 'records', showToast }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
            <i className="fas fa-file-invoice text-xl"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to access your dashboard</p>
        </div>
        <AuthView lang={lang} targetView={targetView} showToast={showToast} />
        <div className="mt-8 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors inline-flex items-center">
            <i className="fas fa-arrow-left mr-2"></i>Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

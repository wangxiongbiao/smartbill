'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { translations } from '../i18n';
import SEOContent from './SEOContent';
import { Language } from '../types';

const LandingPage: React.FC = () => {
    const [lang, setLang] = useState<Language>('en');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const t = translations[lang];
    const router = useRouter();

    const languages: { id: Language; label: string }[] = [
        { id: 'en', label: 'English' },
        { id: 'zh-TW', label: '繁体中文' },
    ];

    const currentLangLabel = languages.find(l => l.id === lang)?.label || 'English';

    return (
        <div className="min-h-screen bg-white">
            {/* Minimal Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">SmartBill</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <i className="fas fa-globe"></i>
                                <span>{currentLangLabel}</span>
                                <i className={`fas fa-chevron-down text-xs transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i>
                            </button>

                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-0" onClick={() => setShowLangMenu(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                                        {languages.map((l) => (
                                            <button
                                                key={l.id}
                                                onClick={() => {
                                                    setLang(l.id);
                                                    setShowLangMenu(false);
                                                }}
                                                className={`w-full px-4 py-3 text-left text-xs font-bold flex items-center justify-between transition-colors ${lang === l.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {l.label}
                                                {lang === l.id && <i className="fas fa-check text-blue-600"></i>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <a
                            href="/dashboard?view=login"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all hover:shadow-lg hover:shadow-blue-200 flex items-center gap-2 group border border-blue-100/50"
                        >
                            <span>Login</span>
                            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                        Professional Invoice Generator
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                        {t.heroTitle?.split(' ')[0]} <span className="text-blue-600">{t.heroTitle?.split(' ').slice(1).join(' ')}</span>
                    </h1>

                    <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium px-4 leading-relaxed">
                        {t.heroSub}
                    </p>

                    <div className="flex justify-center pt-8">
                        <a
                            href="/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-lg group"
                        >
                            <span>Go to Dashboard</span>
                            <i className="fas fa-external-link-alt group-hover:rotate-45 transition-transform"></i>
                        </a>
                    </div>
                </div>

                {/* Preview Image or Content */}
                <div className="max-w-6xl mx-auto mt-20 relative">
                    <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-10 rounded-full"></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 sm:p-4 overflow-hidden">
                        <img src="/images/app-preview.png" alt="App Preview" className="w-full h-auto rounded-xl bg-slate-50" onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2000'; // Fallback
                        }} />
                    </div>
                </div>

                <section className="mt-20">
                    <SEOContent lang={lang} />
                </section>
            </main>

            <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                        <div className="md:col-span-4 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                                    <i className="fas fa-file-invoice text-lg"></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                                        SmartBill
                                    </span>
                                    <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
                                        Professional Pro
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
                                Create professional invoices in seconds. The most intelligent invoicing tool for freelancers and small businesses.
                            </p>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Product</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-600">
                                <li>
                                    <a href="/dashboard" className="hover:text-blue-600 transition-colors">
                                        Dashboard
                                    </a>
                                </li>
                                <li>
                                    <a href="/dashboard?view=editor" className="hover:text-blue-600 transition-colors">
                                        Make Invoice
                                    </a>
                                </li>
                                <li>
                                    <a href="/dashboard?view=templates" className="hover:text-blue-600 transition-colors">
                                        Templates
                                    </a>
                                </li>
                                <li>
                                    <a href="/dashboard?view=editor" className="text-blue-600/60 hover:text-blue-600 transition-colors flex items-center gap-2">
                                        <i className="fas fa-bolt text-[10px]"></i> AI Assistant
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Support</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-600">
                                <li><a href="/dashboard?view=about" className="hover:text-blue-600 transition-colors">About Us</a></li>
                                <li><a href="/dashboard?view=help" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-4 space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Contact Us</h4>
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 shadow-sm flex items-center justify-center text-blue-600">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Support Email</p>
                                        <p className="text-sm font-black text-slate-900">smartbillpro@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 shadow-sm flex items-center justify-center text-emerald-600">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Time</p>
                                        <p className="text-sm font-black text-slate-900">Mon - Fri</p>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Pacific Time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
                            © {new Date().getFullYear()} SmartBill Pro. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                System Operational
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

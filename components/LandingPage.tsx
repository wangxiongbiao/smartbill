'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translations } from '../i18n';
import SEOContent from './SEOContent';
import { Language } from '../types';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { createClient } from '@/lib/supabase/client';

const LandingPage: React.FC<{ initialNext?: string; authError?: boolean }> = ({ initialNext, authError }) => {
    const [lang, setLang] = useState<Language>('en');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const t = translations[lang];
    const router = useRouter();
    const nextPath = initialNext || '/dashboard';
    const { isGoogleLoading, handleGoogleLogin } = useGoogleAuth({
        nextPath,
        onSuccess: (target) => router.replace(target || '/dashboard'),
    });

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        supabase.auth.getSession().then(({ data }) => {
            if (mounted) setIsLoggedIn(!!data.session?.user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) setIsLoggedIn(!!session?.user);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const languages: { id: Language; label: string }[] = [
        { id: 'en', label: 'English' },
        { id: 'zh-TW', label: '繁体中文' },
    ];

    const currentLangLabel = languages.find(l => l.id === lang)?.label || 'English';

    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200"><i className="fas fa-file-invoice"></i></div><span className="text-xl font-black text-slate-900 tracking-tight">SmartBill</span></div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"><i className="fas fa-globe"></i><span>{currentLangLabel}</span><i className={`fas fa-chevron-down text-xs transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i></button>
                            {showLangMenu && <><div className="fixed inset-0 z-0" onClick={() => setShowLangMenu(false)}></div><div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">{languages.map((l) => <button key={l.id} onClick={() => { setLang(l.id); setShowLangMenu(false); }} className={`w-full px-4 py-3 text-left text-xs font-bold flex items-center justify-between transition-colors ${lang === l.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>{l.label}{lang === l.id && <i className="fas fa-check text-blue-600"></i>}</button>)}</div></>}
                        </div>
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 flex items-center gap-2 group border border-blue-600/20"><span>控制台</span><i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i></Link>
                        ) : (
                            <button type="button" onClick={() => { void handleGoogleLogin(); }} disabled={isGoogleLoading} className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all hover:shadow-lg hover:shadow-blue-200 flex items-center gap-2 group border border-blue-100/50 disabled:opacity-70">
                                <span>{isGoogleLoading ? '登录中...' : (t.login || 'Login')}</span><i className={`fas ${isGoogleLoading ? 'fa-circle-notch fa-spin' : 'fa-arrow-right group-hover:translate-x-1 transition-transform'}`}></i>
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>Professional Invoice Generator</div>
                    <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">{t.heroTitle?.split(' ')[0]} <span className="text-blue-600">{t.heroTitle?.split(' ').slice(1).join(' ')}</span></h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium px-4 leading-relaxed">{t.heroSub}</p>
                    {authError ? <p className="text-rose-500 font-bold text-sm">Google 登录失败，请再试一次。</p> : null}
                    <div className="flex justify-center pt-8">
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-lg group"><span>进入控制台</span><i className="fas fa-external-link-alt group-hover:rotate-45 transition-transform"></i></Link>
                        ) : (
                            <button type="button" onClick={() => { void handleGoogleLogin(); }} disabled={isGoogleLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-lg group disabled:opacity-70"><span>{isGoogleLoading ? '正在打开 Google 登录…' : '使用 Google 登录'}</span><i className={`fas ${isGoogleLoading ? 'fa-circle-notch fa-spin' : 'fa-external-link-alt group-hover:rotate-45 transition-transform'}`}></i></button>
                        )}
                    </div>
                </div>
                <section className="mt-20"><SEOContent lang={lang} /></section>
            </main>
            <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                        <div className="md:col-span-4 space-y-6"><div className="flex items-center gap-3"><div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100"><i className="fas fa-file-invoice text-lg"></i></div><div className="flex flex-col"><span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">SmartBill</span><span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Professional Pro</span></div></div><p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">Create professional invoices in seconds. The most intelligent invoicing tool for freelancers and small businesses.</p></div>
                        <div className="md:col-span-2 space-y-6"><h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Product</h4><ul className="space-y-4 text-sm font-bold text-slate-600"><li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li><li><Link href="/invoices/new" className="hover:text-blue-600 transition-colors">Make Invoice</Link></li><li><Link href="/templates" className="hover:text-blue-600 transition-colors">Templates</Link></li><li><Link href="/invoices/new" className="text-blue-600/60 hover:text-blue-600 transition-colors flex items-center gap-2"><i className="fas fa-bolt text-[10px]"></i> AI Assistant</Link></li></ul></div>
                        <div className="md:col-span-2 space-y-6"><h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Support</h4><ul className="space-y-4 text-sm font-bold text-slate-600"><li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">About Us</Link></li><li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Help Center</Link></li></ul></div>
                        <div className="md:col-span-4 space-y-6"><h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Contact Us</h4><div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-5 shadow-sm"><div className="flex items-start gap-4"><div className="w-10 h-10 rounded-2xl bg-slate-50 shadow-sm flex items-center justify-center text-blue-600"><i className="fas fa-envelope"></i></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Support Email</p><p className="text-sm font-black text-slate-900">smartbillpro@gmail.com</p></div></div><div className="flex items-start gap-4"><div className="w-10 h-10 rounded-2xl bg-slate-50 shadow-sm flex items-center justify-center text-emerald-600"><i className="fas fa-clock"></i></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Time</p><p className="text-sm font-black text-slate-900">Mon - Fri</p><p className="text-xs font-medium text-slate-500 mt-1">Pacific Time</p></div></div></div></div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">© {new Date().getFullYear()} SmartBill Pro. All rights reserved.</p><div className="flex items-center gap-6"><span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>System Operational</span></div></div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

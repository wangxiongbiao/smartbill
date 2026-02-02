'use client';
import React, { useState } from 'react';
import { ViewType, Language, User } from '../types';
import { translations } from '../i18n';

interface DashboardSidebarProps {
    user: User | null;
    activeView: ViewType;
    setView: (v: ViewType) => void;
    lang: Language;
    setLang: (l: Language) => void;
    onLogout: () => void;
    onNewInvoice: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    user,
    activeView,
    setView,
    lang,
    setLang,
    onLogout,
    onNewInvoice
}) => {
    const [showLangMenu, setShowLangMenu] = useState(false);
    const t = translations[lang];

    const navItems: { id: ViewType; label: string; icon: string }[] = [
        { id: 'records', label: t.records, icon: 'fas fa-file-invoice' },
        { id: 'templates', label: t.myTemplates, icon: 'fas fa-file-contract' },
        { id: 'profile', label: t.profile, icon: 'fas fa-user' },
    ];

    const languages: { id: Language; label: string }[] = [
        { id: 'zh-TW', label: '繁體中文' },
        { id: 'en', label: 'English' },
    ];

    const currentLangLabel = languages.find(l => l.id === lang)?.label || 'Language';

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 left-0 transition-all duration-300 shadow-sm z-50">
            {/* Brand */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 transition-transform hover:scale-105 cursor-pointer">
                    <i className="fas fa-file-invoice text-lg"></i>
                </div>
                <div className="flex flex-col select-none">
                    <span className="text-xl font-black text-slate-900 leading-none tracking-tight">
                        SmartBill
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] leading-none mt-1.5">
                        PRO EDITION
                    </span>
                </div>
            </div>

            <div className="px-4 py-6">
                <button
                    onClick={onNewInvoice}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group ring-4 ring-transparent hover:ring-blue-50"
                >
                    <i className="fas fa-plus group-hover:rotate-90 transition-transform"></i>
                    <span>{t.newInvoiceShort || 'New Invoice'}</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = activeView === item.id ||
                        (item.id === 'records' && activeView === 'editor') ||
                        (item.id === 'templates' && activeView === 'template-detail');

                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative font-bold tracking-wide ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <i className={`${item.icon} w-6 text-center text-sm transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                            <span className="text-sm">
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full"></div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 space-y-4">
                {/* Language Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${showLangMenu
                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <i className="fas fa-globe text-xs"></i>
                            <span className="text-xs font-bold uppercase tracking-wider">{currentLangLabel}</span>
                        </div>
                        <i className={`fas fa-chevron-up text-[10px] transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i>
                    </button>

                    {showLangMenu && (
                        <>
                            <div className="fixed inset-0 z-0" onClick={() => setShowLangMenu(false)}></div>
                            <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-20">
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

                {/* User Profile / Logout */}
                {user ? (
                    <div className="flex items-center gap-3 px-2 group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 text-xs font-bold shadow-sm ring-2 ring-white">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                user.name?.charAt(0).toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{user.name}</p>
                            <p className="text-[10px] text-slate-400 truncate font-medium">{user.email}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Logout"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setView('records')} // Trigger auth view
                        className="w-full py-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 border border-blue-100"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </aside>
    );
};

export default DashboardSidebar;

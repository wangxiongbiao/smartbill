'use client';
import Link from 'next/link';
import React from 'react';
import { Language, User, ViewType } from '../types';
import { translations } from '../i18n';
import { buildLangHref } from '@/lib/marketing';
import { getPrimaryNavItems, isNavItemActive } from '@/lib/navigation';

interface DashboardSidebarProps {
    user: User | null;
    activeView: ViewType;
    setView: (v: ViewType) => void;
    lang: Language;
    onLogout: () => void;
    onNewInvoice: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    user,
    activeView,
    setView,
    lang,
    onLogout,
    onNewInvoice
}) => {
    const t = translations[lang];
    const copy = lang === 'zh-TW'
        ? {
            returnHome: '返回首頁',
            logout: '登出',
            proMember: 'PRO 會員',
        }
        : {
            returnHome: 'Back Home',
            logout: 'Logout',
            proMember: 'PRO MEMBER',
        };

    const navItems = getPrimaryNavItems(lang).filter((item) => item.id !== 'editor');

    return (
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 left-0 transition-all duration-300 z-50">
            {/* Brand */}
            <div className="h-[72px] px-5 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                    <div className="bg-blue-600 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-[0_10px_22px_-12px_rgba(37,99,235,0.58)]">
                        <i className="fas fa-file-lines text-[14px]"></i>
                    </div>
                    <div className="flex flex-col select-none min-w-0">
                        <span className="text-[18px] font-bold text-slate-900 leading-none tracking-[-0.02em]">
                            SmartBill Pro
                        </span>
                    </div>
                </div>
                <Link
                    href={buildLangHref('/', lang)}
                    aria-label={copy.returnHome}
                    title={copy.returnHome}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                    <i className="fas fa-house text-[13px]"></i>
                </Link>
            </div>

            <div className="px-4 py-5">
                <button
                    onClick={onNewInvoice}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold shadow-[0_16px_30px_-18px_rgba(37,99,235,0.52)] transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                    <i className="fas fa-plus group-hover:rotate-90 transition-transform"></i>
                    <span>{t.newInvoiceShort || 'New Invoice'}</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = isNavItemActive(item.id, activeView);

                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 px-3.5 h-11 rounded-xl transition-all duration-200 group relative font-medium ${isActive
                                ? 'bg-blue-600 text-white shadow-[0_12px_24px_-16px_rgba(37,99,235,0.56)]'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <i className={`${item.icon} w-5 text-center text-[14px] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                            <span className="text-[12px] tracking-normal">
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute inset-0 rounded-xl ring-1 ring-white/10"></div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-4 px-4 pb-8 border-t border-slate-100 space-y-4">
                {/* User Profile / Logout */}
                {user ? (
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-3">
                        <div className="flex items-center gap-3 px-1">
                            <div className="relative">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-50 to-sky-100 flex items-center justify-center text-blue-700 text-[12px] font-bold shadow-sm ring-2 ring-white overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-800 truncate leading-none">{user.name}</p>
                                <p className="text-[10px] text-slate-400 truncate font-semibold mt-1 uppercase tracking-[0.12em]">
                                    {copy.proMember}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="mt-3 w-full h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all text-[11px] font-black uppercase tracking-[0.18em]"
                        >
                            {copy.logout}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setView('records')} // Trigger auth view
                        className="w-full py-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 border border-blue-100"
                    >
                        {t.login}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default DashboardSidebar;

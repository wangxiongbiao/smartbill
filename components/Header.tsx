'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import LanguageToggle from '@/components/LanguageToggle';
import { useMarketingAuth } from '@/components/marketing/MarketingAuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import { buildLangHref } from '@/lib/marketing';
import type { Language } from '@/types';

export function Header() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, isGoogleLoading, openProtectedRoute, profile } = useMarketingAuth();
  const { lang, setLang } = useMarketingLanguage();

  const copyByLang: Record<Language, {
    navFeatures: string;
    navTemplates: string;
    navAudience: string;
    navFaq: string;
    badge: string;
    liveDemo: string;
    startFree: string;
    openingLogin: string;
    dashboard: string;
    signOut: string;
    signingOut: string;
    user: string;
    language: string;
    home: string;
    userMenu: string;
  }> = {
    en: {
      navFeatures: 'Features',
      navTemplates: 'Templates',
      navAudience: 'Who it’s for',
      navFaq: 'FAQ',
      badge: 'Invoice workflow',
      liveDemo: 'Live demo',
      startFree: 'Start free',
      openingLogin: 'Opening login...',
      dashboard: 'Dashboard',
      signOut: 'Sign out',
      signingOut: 'Signing out...',
      user: 'User',
      language: 'Language switcher',
      home: 'SmartBill home',
      userMenu: 'User menu',
    },
    'zh-CN': {
      navFeatures: '功能特色',
      navTemplates: '模板',
      navAudience: '适用对象',
      navFaq: '常见问题',
      badge: '开票流程',
      liveDemo: '查看演示',
      startFree: '免费开始',
      openingLogin: '正在打开登录...',
      dashboard: '控制台',
      signOut: '退出登录',
      signingOut: '退出中...',
      user: '用户',
      language: '语言切换',
      home: 'SmartBill 首页',
      userMenu: '用户菜单',
    },
    'zh-TW': {
      navFeatures: '功能特色',
      navTemplates: '模板',
      navAudience: '適用對象',
      navFaq: '常見問題',
      badge: '開票流程',
      liveDemo: '查看示範',
      startFree: '免費開始',
      openingLogin: '正在開啟登入...',
      dashboard: '控制台',
      signOut: '登出',
      signingOut: '登出中...',
      user: '使用者',
      language: '語言切換',
      home: 'SmartBill 首頁',
      userMenu: '使用者選單',
    },
    th: {
      navFeatures: 'ฟีเจอร์',
      navTemplates: 'เทมเพลต',
      navAudience: 'เหมาะกับใคร',
      navFaq: 'คำถามที่พบบ่อย',
      badge: 'เวิร์กโฟลว์ใบแจ้งหนี้',
      liveDemo: 'ดูเดโม',
      startFree: 'เริ่มใช้ฟรี',
      openingLogin: 'กำลังเปิดหน้าเข้าสู่ระบบ...',
      dashboard: 'แดชบอร์ด',
      signOut: 'ออกจากระบบ',
      signingOut: 'กำลังออกจากระบบ...',
      user: 'ผู้ใช้',
      language: 'ตัวสลับภาษา',
      home: 'หน้าแรก SmartBill',
      userMenu: 'เมนูผู้ใช้',
    },
    id: {
      navFeatures: 'Fitur',
      navTemplates: 'Template',
      navAudience: 'Cocok untuk siapa',
      navFaq: 'FAQ',
      badge: 'Alur kerja invoice',
      liveDemo: 'Lihat demo',
      startFree: 'Mulai gratis',
      openingLogin: 'Membuka login...',
      dashboard: 'Dashboard',
      signOut: 'Keluar',
      signingOut: 'Sedang keluar...',
      user: 'Pengguna',
      language: 'Pengganti bahasa',
      home: 'Beranda SmartBill',
      userMenu: 'Menu pengguna',
    },
  };
  const copy = copyByLang[lang];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsLogoutConfirmOpen(false);
      setDropdownOpen(false);
      router.replace(buildLangHref('/', lang));
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-blue-100/80 bg-white/90 backdrop-blur-xl" data-purpose="navigation">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-3" href={buildLangHref('/', lang)} aria-label={copy.home}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-[0_0.75rem_1.625rem_-1rem_rgba(37,99,235,0.55)]">
              <i className="fas fa-file-invoice text-sm"></i>
            </div>
            <div className="leading-none">
              <div className="text-lg font-semibold tracking-tight text-slate-950">SmartBill</div>
              <div className="text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-[#60a5fa]">{copy.badge}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex text-sm font-semibold text-slate-600">
            <a className="transition-colors hover:text-[#1d4ed8]" href="#features">{copy.navFeatures}</a>
            <a className="transition-colors hover:text-[#1d4ed8]" href="#templates">{copy.navTemplates}</a>
            <a className="transition-colors hover:text-[#1d4ed8]" href="#audience">{copy.navAudience}</a>
            <a className="transition-colors hover:text-[#1d4ed8]" href="#faq">{copy.navFaq}</a>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle lang={lang} onChange={setLang} ariaLabel={copy.language} />
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:border-[#dbeafe] hover:bg-[#eff6ff]"
                aria-label={copy.userMenu}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name ?? copy.user}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb] text-xs font-semibold text-white">
                    {(profile.name || profile.email || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="hidden max-w-[8.125rem] truncate text-sm font-semibold text-slate-700 sm:block">
                  {profile.name ?? profile.email}
                </span>
                <i className="fas fa-chevron-down text-xs text-slate-400"></i>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_1.25rem_2.8125rem_-1.5rem_rgba(37,99,235,0.2)]">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{profile.name ?? copy.user}</p>
                    <p className="truncate text-xs text-slate-400">{profile.email}</p>
                  </div>
                  <Link
                    href={buildLangHref('/dashboard', lang)}
                    onClick={() => setDropdownOpen(false)}
                    className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
                  >
                    <i className="fas fa-table-columns text-sm"></i>
                    {copy.dashboard}
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsLogoutConfirmOpen(true);
                    }}
                    disabled={isLoggingOut}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <i className={`fas ${isLoggingOut ? 'fa-circle-notch fa-spin' : 'fa-right-from-bracket'}`}></i>
                    {isLoggingOut ? copy.signingOut : copy.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => openProtectedRoute('/dashboard')}
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8] md:inline-flex"
                type="button"
              >
                {copy.liveDemo}
              </button>
              <button
                onClick={() => openProtectedRoute('/dashboard')}
                disabled={isGoogleLoading}
                className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-70 shadow-[0_0.875rem_1.625rem_-1.125rem_rgba(37,99,235,0.5)]"
              >
                {isGoogleLoading ? copy.openingLogin : copy.startFree}
              </button>
            </>
          )}
        </div>
      </div>
      <LogoutConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        isProcessing={isLoggingOut}
        lang={lang}
      />
    </header>
  );
}

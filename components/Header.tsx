
'use client';
import React, { useState } from 'react';
import { ViewType, Language } from '../types';
import { translations } from '../i18n';

interface HeaderProps {
  onPrint: () => void;
  isExporting?: boolean;
  activeView: ViewType;
  setView: (v: ViewType) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ onPrint, isExporting, activeView, setView, lang, setLang }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = translations[lang];

  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'home', label: t.home, icon: 'fas fa-home' },
    { id: 'records', label: t.records, icon: 'fas fa-file-invoice' },
    { id: 'templates', label: t.myTemplates, icon: 'fas fa-file-contract' },
    { id: 'profile', label: t.profile, icon: 'fas fa-user' },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'zh-TW', label: '繁體中文' },
    { id: 'en', label: 'English' },
    // { id: 'fr', label: 'Français' },
    // { id: 'de', label: 'Deutsch' },
    // { id: 'ja', label: '日本語' },
  ];

  const currentLangLabel = languages.find(l => l.id === lang)?.label || 'Language';

  return (
    <header className="bg-white/95 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-[100] no-print shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      {/* 核心對齊容器：統一 max-w 和 px 以確保與下方內容垂直對齊 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-20 flex items-center justify-between">

        {/* 左側：品牌標識 */}
        <div
          className="flex items-center gap-3 cursor-pointer group select-none"
          onClick={() => setView('home')}
        >
          <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 transition-all group-hover:rotate-6 group-hover:scale-105">
            <i className="fas fa-file-invoice text-lg"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent leading-none tracking-tight">
              SmartBill
            </span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mt-1.5">
              PRO EDITION
            </span>
          </div>
        </div>

        {/* 右側：功能區塊 */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* 桌面端主導航 */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 uppercase tracking-wider ${activeView === item.id
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                  }`}
              >
                <i className={`${item.icon} text-[10px] ${activeView === item.id ? 'opacity-100' : 'opacity-60'}`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block w-px h-6 bg-slate-200"></div>

          {/* 語言切換與導出 */}
          <div className="flex items-center gap-2 relative">
            {/* 增強版語言選擇按鈕：顯示當前語言名稱 */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className={`h-11 px-4 flex items-center gap-3 rounded-2xl border transition-all shadow-sm group ${showLangMenu
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <i className={`fas fa-globe text-sm transition-transform ${showLangMenu ? 'rotate-12' : 'group-hover:rotate-12'}`}></i>
                <span className="text-[11px] font-black whitespace-nowrap uppercase tracking-tight hidden sm:inline">
                  {currentLangLabel}
                </span>
                <i className={`fas fa-chevron-down text-[9px] opacity-40 transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)}></div>
                  <div className="absolute right-0 mt-4 w-60 bg-white rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 z-20 py-2.5 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1.5">Select Language</div>
                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                      {languages.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => {
                            setLang(l.id);
                            setShowLangMenu(false);
                          }}
                          className={`w-full px-5 py-3.5 text-left text-sm font-bold flex items-center justify-between transition-colors ${lang === l.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {l.label}
                          {lang === l.id && <i className="fas fa-check-circle text-blue-500"></i>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 導出按鈕 - 僅在編輯器視圖顯示 */}
            {activeView === 'editor' && (
              <button
                onClick={onPrint}
                disabled={isExporting}
                className={`bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-widest ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isExporting ? (
                  <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fas fa-file-export"></i>
                )}
                <span>{isExporting ? t.generating : t.exportPdf}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

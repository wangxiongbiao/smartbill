
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
    { id: 'records', label: t.records, icon: 'fas fa-history' },
    { id: 'profile', label: t.profile, icon: 'fas fa-user' },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'zh-TW', label: '繁體中文' },
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Français' },
    { id: 'de', label: 'Deutsch' },
    { id: 'ja', label: '日本語' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 no-print shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2 cursor-pointer flex-shrink-0" 
          onClick={() => setView('home')}
        >
          <div className="bg-blue-600 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <i className="fas fa-file-invoice text-sm sm:text-base"></i>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1">
            <span className="text-base sm:text-xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
              SmartBill
            </span>
            <span className="text-[10px] sm:text-sm font-black text-blue-600 uppercase tracking-wider leading-none">
              Pro
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeView === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <i className={item.icon}></i>
              {item.label}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 relative">
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200 shadow-sm"
              title="Change Language"
            >
              <i className="fas fa-globe text-base"></i>
            </button>
            
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 z-20 py-2 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {languages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setLang(l.id);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-5 py-3 text-left text-sm font-bold flex items-center justify-between transition-colors ${
                        lang === l.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {l.label}
                      {lang === l.id && <i className="fas fa-check text-xs"></i>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {activeView === 'editor' && (
            <button 
              onClick={onPrint}
              disabled={isExporting}
              className={`hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 rounded-xl font-black shadow-lg shadow-blue-100 items-center gap-2 transition-all active:scale-95 text-xs sm:text-sm ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isExporting ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                <i className="fas fa-cloud-download-alt"></i>
              )}
              <span className="hidden xs:inline">{isExporting ? t.generating : t.exportPdf}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

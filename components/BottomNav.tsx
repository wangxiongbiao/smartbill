
import React from 'react';
import { ViewType, Language } from '../types';
import { translations } from '../i18n';

interface BottomNavProps {
  activeView: ViewType;
  setView: (v: ViewType) => void;
  lang: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView, lang }) => {
  const t = translations[lang];
  const tabs: { id: ViewType; label: string; icon: string; activeIcon: string }[] = [
    { id: 'home', label: t.home, icon: 'fa-home', activeIcon: 'fa-home' },
    { id: 'editor', label: t.make, icon: 'fa-plus-circle', activeIcon: 'fa-plus-circle' },
    { id: 'records', label: t.records, icon: 'fa-file-invoice', activeIcon: 'fa-file-invoice' },
    { id: 'profile', label: t.profile, icon: 'fa-user', activeIcon: 'fa-user' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] px-6 sm:hidden pointer-events-none">
      <nav className="max-w-md mx-auto h-16 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2rem] flex items-center justify-around px-2 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300"
            >
              <div className="flex flex-col items-center gap-1">
                <i className={`fas ${isActive ? tab.activeIcon : tab.icon} text-xl transition-all duration-300 ${
                  isActive ? 'text-blue-500 scale-110' : 'text-slate-500'
                }`}></i>
                <span className={`text-[9px] font-black tracking-widest uppercase transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;

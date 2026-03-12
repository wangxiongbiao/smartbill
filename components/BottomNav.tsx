
'use client';
import React from 'react';
import { ViewType, Language } from '../types';
import { getPrimaryNavItems, isNavItemActive } from '@/lib/navigation';

interface BottomNavProps {
  activeView: ViewType;
  setView: (v: ViewType) => void;
  lang: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView, lang }) => {
  const tabs = getPrimaryNavItems(lang).filter((tab) => tab.id !== 'editor');

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] px-4 sm:hidden pointer-events-none">
      <nav className="max-w-lg mx-auto h-16 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2rem] flex items-center justify-around px-1 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = isNavItemActive(tab.id, activeView);

          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="relative flex flex-col items-center justify-center w-full h-full transition-all duration-300"
            >
              <div className="flex flex-col items-center gap-1">
                <i className={`${isActive ? tab.activeIcon || tab.icon : tab.icon} text-lg transition-all duration-300 ${isActive ? 'text-blue-500 scale-110' : 'text-slate-500'
                  }`}></i>
                <span className={`text-[8px] font-semibold tracking-tighter uppercase transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500'
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

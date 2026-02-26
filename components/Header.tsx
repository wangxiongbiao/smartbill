import React from 'react';
import Image from 'next/image';

interface HeaderProps {
  isHardMode: boolean;
  onModeChange: (isHard: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isHardMode, onModeChange }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shadow-sm">
            <Image
              src="/logo.png"
              alt="Help Wordle Logo"
              width={40}
              height={40}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900">
            Help Wordle
          </h1>
        </div>

        <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-full border border-slate-200">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="mode"
              className="peer sr-only"
              checked={!isHardMode}
              onChange={() => onModeChange(false)}
            />
            <span className="px-2.5 py-1 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-500 peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm transition-all duration-200 block">
              Classic
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="mode"
              className="peer sr-only"
              checked={isHardMode}
              onChange={() => onModeChange(true)}
            />
            <span className="px-2.5 py-1 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-500 peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm transition-all duration-200 block whitespace-nowrap">
              Hard
            </span>
          </label>
        </div>

        {/* <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
             <img 
                alt="Avatar" 
                className="w-full h-full object-cover opacity-90" 
                src="https://picsum.photos/100/100" 
            />
          </div>
        </div> */}
      </div>
    </header>
  );
};

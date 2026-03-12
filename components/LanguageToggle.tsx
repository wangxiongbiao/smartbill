'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Language } from '@/types';
import { LANGUAGE_OPTIONS } from '@/lib/language';

interface LanguageToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
  ariaLabel: string;
}

export default function LanguageToggle({ lang, onChange, ariaLabel }: LanguageToggleProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLanguage = LANGUAGE_OPTIONS.find((option) => option.code === lang) || LANGUAGE_OPTIONS[2];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={ariaLabel}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <i className="fas fa-globe text-[0.6875rem]"></i>
        <span className="sm:hidden">{currentLanguage.shortLabel}</span>
        <span className="hidden sm:inline">{currentLanguage.label}</span>
        <i className={`fas fa-chevron-down text-[0.625rem] transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_1.125rem_2.375rem_-1.5rem_rgba(15,23,42,0.2)]">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                onChange(option.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                lang === option.code
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{option.label}</span>
              {lang === option.code && <i className="fas fa-check text-[0.6875rem]"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

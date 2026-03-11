'use client';

import React from 'react';
import type { Language } from '@/types';

interface LanguageToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
  ariaLabel: string;
}

export default function LanguageToggle({ lang, onChange, ariaLabel }: LanguageToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('en')}
        aria-label={ariaLabel}
        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange('zh-TW')}
        aria-label={ariaLabel}
        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${lang === 'zh-TW' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
      >
        繁
      </button>
    </div>
  );
}

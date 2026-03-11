'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Language } from '@/types';
import {
  buildLangHref,
  getStoredLanguage,
  persistLanguage,
  resolveLanguage,
} from '@/lib/marketing';

type MarketingLanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
};

const MarketingLanguageContext = createContext<MarketingLanguageContextValue | null>(null);

export function MarketingLanguageProvider({
  children,
  initialLang = 'en',
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLangState] = useState<Language>(initialLang);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const queryLang = searchParams.get('lang');

    if (queryLang === 'en' || queryLang === 'zh-TW') {
      setLangState(queryLang);
      persistLanguage(queryLang);
      return;
    }

    const saved = getStoredLanguage();
    if (saved) {
      setLangState(saved);
      if (saved === 'zh-TW') {
        router.replace(buildLangHref(pathname || '/', 'zh-TW'), { scroll: false });
      }
      return;
    }

    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.includes('zh')) {
      setLangState('zh-TW');
      router.replace(buildLangHref(pathname || '/', 'zh-TW'), { scroll: false });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-Hant' : 'en';
  }, [lang]);

  const updateLang = (nextLang: Language) => {
    const resolvedLang = resolveLanguage(nextLang);

    setLangState(resolvedLang);
    persistLanguage(resolvedLang);

    const params = new URLSearchParams(searchParams.toString());
    if (resolvedLang === 'zh-TW') {
      params.set('lang', 'zh-TW');
    } else {
      params.delete('lang');
    }

    const nextPath = params.toString()
      ? `${pathname || '/'}?${params.toString()}`
      : (pathname || '/');

    router.replace(nextPath, { scroll: false });
  };

  const value = useMemo(
    () => ({
      lang,
      setLang: updateLang,
      toggleLang: () => updateLang(lang === 'en' ? 'zh-TW' : 'en'),
    }),
    [lang, updateLang],
  );

  return <MarketingLanguageContext.Provider value={value}>{children}</MarketingLanguageContext.Provider>;
}

export function useMarketingLanguage() {
  const context = useContext(MarketingLanguageContext);
  if (!context) {
    throw new Error('useMarketingLanguage must be used within MarketingLanguageProvider');
  }
  return context;
}

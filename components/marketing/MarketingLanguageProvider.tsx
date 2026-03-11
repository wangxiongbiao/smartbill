'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Language } from '@/types';
import {
  getStoredLanguage,
  persistLanguage,
  resolveLanguage,
} from '@/lib/marketing';
import {
  DEFAULT_LANGUAGE,
  getDocumentLanguage,
  getNextLanguage,
  isSupportedLanguage,
  resolveBrowserLanguage,
} from '@/lib/language';

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

  const buildPathWithLang = useCallback((nextLang: Language) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextLang === DEFAULT_LANGUAGE) {
      params.delete('lang');
    } else {
      params.set('lang', nextLang);
    }

    return params.toString()
      ? `${pathname || '/'}?${params.toString()}`
      : (pathname || '/');
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const queryLang = searchParams.get('lang');

    if (isSupportedLanguage(queryLang)) {
      setLangState(queryLang);
      persistLanguage(queryLang);
      return;
    }

    const saved = getStoredLanguage();
    if (saved) {
      setLangState(saved);
      if (saved !== DEFAULT_LANGUAGE) {
        router.replace(buildPathWithLang(saved), { scroll: false });
      }
      return;
    }

    const browserLang = resolveBrowserLanguage(window.navigator.language);
    if (browserLang !== DEFAULT_LANGUAGE) {
      setLangState(browserLang);
      router.replace(buildPathWithLang(browserLang), { scroll: false });
    }
  }, [buildPathWithLang, pathname, router, searchParams]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = getDocumentLanguage(lang);
  }, [lang]);

  const updateLang = (nextLang: Language) => {
    const resolvedLang = resolveLanguage(nextLang);

    setLangState(resolvedLang);
    persistLanguage(resolvedLang);

    router.replace(buildPathWithLang(resolvedLang), { scroll: false });
  };

  const value = useMemo(
    () => ({
      lang,
      setLang: updateLang,
      toggleLang: () => updateLang(getNextLanguage(lang)),
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

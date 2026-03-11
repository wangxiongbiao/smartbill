import type { Language } from '@/types';

export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES: readonly Language[] = [
  'zh-CN',
  'zh-TW',
  'en',
  'th',
  'id',
] as const;

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  code: Language;
  label: string;
  shortLabel: string;
}> = [
  { code: 'zh-CN', label: '简体中文', shortLabel: '简体' },
  { code: 'zh-TW', label: '繁體中文', shortLabel: '繁體' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'th', label: 'ไทย', shortLabel: 'ไทย' },
  { code: 'id', label: 'Bahasa Indonesia', shortLabel: 'ID' },
];

export function isSupportedLanguage(value?: string | null): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

export function isChineseLanguage(lang: Language) {
  return lang === 'zh-CN' || lang === 'zh-TW';
}

export function isTraditionalChineseLanguage(lang: Language) {
  return lang === 'zh-TW';
}

export function getFallbackTranslationLanguage(lang: Language): 'en' | 'zh-TW' {
  return isChineseLanguage(lang) ? 'zh-TW' : 'en';
}

export function getLocaleForLanguage(lang: Language) {
  switch (lang) {
    case 'zh-CN':
      return 'zh-CN';
    case 'zh-TW':
      return 'zh-TW';
    case 'th':
      return 'th-TH';
    case 'id':
      return 'id-ID';
    default:
      return 'en-US';
  }
}

export function getDocumentLanguage(lang: Language) {
  switch (lang) {
    case 'zh-CN':
      return 'zh-Hans';
    case 'zh-TW':
      return 'zh-Hant';
    case 'th':
      return 'th';
    case 'id':
      return 'id';
    default:
      return 'en';
  }
}

export function getDefaultCurrencyForLanguage(lang: Language) {
  switch (lang) {
    case 'zh-CN':
      return 'CNY';
    case 'zh-TW':
      return 'TWD';
    case 'th':
      return 'THB';
    case 'id':
      return 'IDR';
    default:
      return 'USD';
  }
}

export function resolveBrowserLanguage(browserLanguage: string): Language {
  const normalized = browserLanguage.toLowerCase();

  if (normalized.startsWith('zh')) {
    if (
      normalized.includes('tw') ||
      normalized.includes('hk') ||
      normalized.includes('mo') ||
      normalized.includes('hant')
    ) {
      return 'zh-TW';
    }

    return 'zh-CN';
  }

  if (normalized.startsWith('th')) return 'th';
  if (normalized.startsWith('id')) return 'id';

  return 'en';
}

export function getNextLanguage(lang: Language): Language {
  const index = SUPPORTED_LANGUAGES.indexOf(lang);
  return SUPPORTED_LANGUAGES[(index + 1) % SUPPORTED_LANGUAGES.length];
}

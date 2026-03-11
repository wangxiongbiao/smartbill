import type { Metadata } from 'next';
import type { Language } from '@/types';

const SITE_URL = 'https://smartbillpro.com';
export const LANGUAGE_STORAGE_KEY = 'smartbill-marketing-lang';

type PublicPageKey = 'home' | 'templates' | 'share';

type PublicPageCopy = {
  path: string;
  title: string;
  description: string;
  openGraphTitle: string;
  openGraphDescription: string;
  ogView?: string;
};

const PUBLIC_PAGE_COPY: Record<PublicPageKey, Record<Language, PublicPageCopy>> = {
  home: {
    en: {
      path: '/',
      title: 'Invoice Generator for Freelancers & Small Businesses',
      description:
        'Create invoices with your logo, payment details, reusable templates, and PDF export. SmartBill is built for freelancers, contractors, agencies, and small teams.',
      openGraphTitle: 'SmartBill Invoice Generator for Freelancers & Small Businesses',
      openGraphDescription:
        'Create branded invoices, reuse templates, manage records, and export PDFs with SmartBill.',
      ogView: 'home',
    },
    'zh-TW': {
      path: '/',
      title: '適合自由工作者與小型企業的發票產生器',
      description:
        '用 SmartBill 建立含品牌標誌、付款資訊與可重用模板的專業發票，並快速匯出 PDF。適合自由接案者、工作室、顧問與小型團隊。',
      openGraphTitle: 'SmartBill 專業發票產生器',
      openGraphDescription:
        '建立品牌化發票、重用模板、管理記錄，並匯出精緻 PDF。',
      ogView: 'home',
    },
  },
  templates: {
    en: {
      path: '/invoice-templates',
      title: 'Invoice Templates for Freelancers, Agencies & Small Businesses',
      description:
        'Explore invoice template ideas for consultants, agencies, freelancers, and service businesses. Use SmartBill to reuse structures, keep branding consistent, and export clean PDFs.',
      openGraphTitle: 'SmartBill Invoice Templates',
      openGraphDescription:
        'Explore reusable invoice template ideas for repeat billing, branding, and clean PDF exports.',
      ogView: 'templates',
    },
    'zh-TW': {
      path: '/invoice-templates',
      title: '適合自由工作者、代理商與小型企業的發票模板',
      description:
        '探索顧問、代理商、自由工作者與服務業可直接套用的發票模板思路。用 SmartBill 重用結構、維持品牌一致，並匯出乾淨 PDF。',
      openGraphTitle: 'SmartBill 發票模板',
      openGraphDescription:
        '探索可重用的發票模板，用於重複開票、品牌一致性與專業 PDF 匯出。',
      ogView: 'templates',
    },
  },
  share: {
    en: {
      path: '/',
      title: 'Shared Invoice',
      description: 'View a professional invoice shared through SmartBill.',
      openGraphTitle: 'SmartBill Shared Invoice',
      openGraphDescription: 'Open a professional invoice share link from SmartBill.',
      ogView: 'home',
    },
    'zh-TW': {
      path: '/',
      title: '分享發票',
      description: '查看透過 SmartBill 分享的專業發票。',
      openGraphTitle: 'SmartBill 分享發票',
      openGraphDescription: '打開來自 SmartBill 的專業發票分享連結。',
      ogView: 'home',
    },
  },
};

export function resolveLanguage(value?: string | null): Language {
  return value === 'zh-TW' ? 'zh-TW' : 'en';
}

export function buildLangHref(href: string, lang: Language) {
  const url = new URL(href, SITE_URL);

  if (lang === 'zh-TW') {
    url.searchParams.set('lang', 'zh-TW');
  } else {
    url.searchParams.delete('lang');
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildAbsoluteLangUrl(href: string, lang: Language) {
  return new URL(buildLangHref(href, lang), SITE_URL).toString();
}

export function buildOgImageHref(view: string, lang: Language) {
  const params = new URLSearchParams({ view });

  if (lang === 'zh-TW') {
    params.set('lang', 'zh-TW');
  }

  return `/og?${params.toString()}`;
}

export function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === 'en' || saved === 'zh-TW' ? saved : null;
}

export function persistLanguage(lang: Language) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export function getPublicPageMetadata(page: PublicPageKey, lang: Language): Metadata {
  const copy = PUBLIC_PAGE_COPY[page][lang];
  const image = copy.ogView ? [buildOgImageHref(copy.ogView, lang)] : undefined;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: buildLangHref(copy.path, lang),
      languages: {
        'en-US': buildLangHref(copy.path, 'en'),
        'zh-TW': buildLangHref(copy.path, 'zh-TW'),
      },
    },
    openGraph: {
      title: copy.openGraphTitle,
      description: copy.openGraphDescription,
      url: buildAbsoluteLangUrl(copy.path, lang),
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.openGraphTitle,
      description: copy.openGraphDescription,
      images: image,
    },
  };
}

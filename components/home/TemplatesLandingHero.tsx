'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

export function TemplatesLandingHero() {
  const { lang } = useMarketingLanguage();

  const copy = lang === 'zh-TW'
    ? {
        badge: '公開 SEO 落地頁',
        title: '能幫你更快開票、維持一致性的發票模板。',
        desc: '這個頁面是承接模板相關搜尋流量的合適位置。它說明 SmartBill 模板如何幫助自由工作者、代理商、顧問與小型企業重用發票結構、維持品牌一致，並匯出專業 PDF。',
      }
    : {
        badge: 'Public SEO landing page',
        title: 'Invoice templates that help you bill faster and stay consistent.',
        desc: 'This page is the right place to target template-related search traffic. It explains how SmartBill templates help freelancers, agencies, consultants, and small businesses reuse invoice structures, keep branding consistent, and export professional PDFs.',
      };

  return (
    <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_55%,#f8fafc_100%)] py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
          <i className="fas fa-layer-group"></i>
          {copy.badge}
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
          {copy.desc}
        </p>
      </div>
    </section>
  );
}

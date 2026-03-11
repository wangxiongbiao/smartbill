'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

export function TemplatesLandingHero() {
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, { badge: string; title: string; desc: string }> = {
    en: {
      badge: 'Public SEO landing page',
      title: 'Invoice templates that help you bill faster and stay consistent.',
      desc: 'This page is the right place to target template-related search traffic. It explains how SmartBill templates help freelancers, agencies, consultants, and small businesses reuse invoice structures, keep branding consistent, and export professional PDFs.',
    },
    'zh-CN': {
      badge: '公开 SEO 落地页',
      title: '能帮你更快开票、保持一致性的发票模板。',
      desc: '这个页面是承接模板相关搜索流量的合适位置。它说明 SmartBill 模板如何帮助自由职业者、代理商、顾问与小型企业复用发票结构、保持品牌一致，并导出专业 PDF。',
    },
    'zh-TW': {
      badge: '公開 SEO 落地頁',
      title: '能幫你更快開票、維持一致性的發票模板。',
      desc: '這個頁面是承接模板相關搜尋流量的合適位置。它說明 SmartBill 模板如何幫助自由工作者、代理商、顧問與小型企業重用發票結構、維持品牌一致，並匯出專業 PDF。',
    },
    th: {
      badge: 'หน้าแลนดิ้งเพจ SEO สาธารณะ',
      title: 'เทมเพลตใบแจ้งหนี้ที่ช่วยให้คุณออกบิลได้เร็วขึ้นและคงความสม่ำเสมอ',
      desc: 'หน้านี้เหมาะสำหรับรองรับทราฟฟิกจากการค้นหาเกี่ยวกับเทมเพลต โดยอธิบายว่าเทมเพลตของ SmartBill ช่วยฟรีแลนซ์ เอเจนซี ที่ปรึกษา และธุรกิจขนาดเล็กใช้โครงสร้างใบแจ้งหนี้ซ้ำ รักษาแบรนด์ให้สม่ำเสมอ และส่งออก PDF แบบมืออาชีพได้อย่างไร',
    },
    id: {
      badge: 'Landing page SEO publik',
      title: 'Template invoice yang membantu Anda menagih lebih cepat dan tetap konsisten.',
      desc: 'Halaman ini adalah tempat yang tepat untuk menargetkan traffic pencarian terkait template. Halaman ini menjelaskan bagaimana template SmartBill membantu freelancer, agensi, konsultan, dan bisnis kecil memakai ulang struktur invoice, menjaga konsistensi branding, dan mengekspor PDF profesional.',
    },
  };
  const copy = copyByLang[lang];

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

"use client";

import React from 'react';
import InvoicePreview from '@/components/InvoicePreview';
import ScalableInvoiceContainer from '@/components/ScalableInvoiceContainer';
import { useMarketingAuth } from '@/components/marketing/MarketingAuthProvider';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import { calculateInvoiceTotals } from '@/lib/invoice';
import { getLocaleForLanguage, isChineseLanguage } from '@/lib/language';
import {
  PUBLIC_TEMPLATE_ITEMS,
  buildPublicTemplatePreviewInvoice,
  type PublicTemplateItem,
} from '@/lib/public-templates';
import type { Language } from '@/types';

function TemplatePreviewCard({
  item,
  isLoggedIn,
  lang,
  onOpenTemplate,
}: {
  item: PublicTemplateItem;
  isLoggedIn: boolean;
  lang: Language;
  onOpenTemplate: () => void;
}) {
  const previewInvoice = buildPublicTemplatePreviewInvoice(item.template);
  const { total } = calculateInvoiceTotals(previewInvoice.items, previewInvoice.taxRate);

  const copyByLang: Record<Language, { use: string; signInToUse: string; usedTimes: string; typicalTotal: string; cta: string }> = {
    en: {
      use: 'Use',
      signInToUse: 'Sign in to use',
      usedTimes: `Used ${item.template.usage_count || 0} times`,
      typicalTotal: 'Typical total',
      cta: isLoggedIn ? 'Use this template' : 'Sign in to use',
    },
    'zh-CN': {
      use: '使用',
      signInToUse: '登录后使用',
      usedTimes: `已使用 ${item.template.usage_count || 0} 次`,
      typicalTotal: '典型总额',
      cta: isLoggedIn ? '使用此模板' : '登录后使用',
    },
    'zh-TW': {
      use: '使用',
      signInToUse: '登入後使用',
      usedTimes: `已使用 ${item.template.usage_count || 0} 次`,
      typicalTotal: '典型總額',
      cta: isLoggedIn ? '使用此模板' : '登入後使用',
    },
    th: {
      use: 'ใช้',
      signInToUse: 'เข้าสู่ระบบเพื่อใช้',
      usedTimes: `ใช้งานแล้ว ${item.template.usage_count || 0} ครั้ง`,
      typicalTotal: 'ยอดรวมทั่วไป',
      cta: isLoggedIn ? 'ใช้เทมเพลตนี้' : 'เข้าสู่ระบบเพื่อใช้',
    },
    id: {
      use: 'Gunakan',
      signInToUse: 'Masuk untuk menggunakan',
      usedTimes: `Dipakai ${item.template.usage_count || 0} kali`,
      typicalTotal: 'Total umum',
      cta: isLoggedIn ? 'Gunakan template ini' : 'Masuk untuk menggunakan',
    },
  };
  const copy = copyByLang[lang];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenTemplate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenTemplate();
        }
      }}
      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
      aria-label={`${isLoggedIn ? copy.use : copy.signInToUse} ${item.template.name}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
          {item.category}
        </span>
        <span className="text-xs font-semibold text-slate-400">{copy.usedTimes}</span>
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{item.template.name}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">{item.template.description}</p>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3">
        <ScalableInvoiceContainer baseWidth={794} className="pointer-events-none">
          <div className="w-[794px]">
            <InvoicePreview
              invoice={previewInvoice}
              template={previewInvoice.template || 'minimalist'}
              isHeaderReversed={previewInvoice.isHeaderReversed}
              lang={lang}
            />
          </div>
        </ScalableInvoiceContainer>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.typicalTotal}</div>
          <div className="mt-1 text-lg font-semibold text-slate-950">
            {new Intl.NumberFormat(getLocaleForLanguage(lang), { style: 'currency', currency: previewInvoice.currency }).format(total)}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span>{copy.cta}</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </article>
  );
}

export function TemplatesGallery() {
  const { isLoggedIn, openProtectedRoute } = useMarketingAuth();
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, { badge: string; title: string; desc: string }> = {
    en: {
      badge: 'Real template previews built from SmartBill invoice data',
      title: 'Start from realistic invoice templates instead of abstract placeholder cards.',
      desc: 'These previews now use real SmartBill invoice structures — sender, client, items, totals, payment info, currency, and due date — so the section looks like an actual product template gallery.',
    },
    'zh-CN': {
      badge: '以 SmartBill 真实发票数据构建的模板预览',
      title: '从接近真实使用情境的发票模板开始，而不是抽象的占位卡片。',
      desc: '这些预览直接使用 SmartBill 的真实发票结构，包括寄件人、客户、明细、总额、付款信息、币别与到期日，所以这个区块看起来更像真正的产品模板库。',
    },
    'zh-TW': {
      badge: '以 SmartBill 真實發票資料構建的模板預覽',
      title: '從接近真實使用情境的發票模板開始，而不是抽象的佔位卡片。',
      desc: '這些預覽直接使用 SmartBill 的真實發票結構——寄件人、客戶、明細、總額、付款資訊、幣別與到期日——所以這個區塊看起來更像真正的產品模板庫。',
    },
    th: {
      badge: 'พรีวิวเทมเพลตจริงที่สร้างจากข้อมูลใบแจ้งหนี้ของ SmartBill',
      title: 'เริ่มจากเทมเพลตใบแจ้งหนี้ที่ใกล้เคียงการใช้งานจริง แทนการ์ดตัวอย่างแบบนามธรรม',
      desc: 'พรีวิวเหล่านี้ใช้โครงสร้างใบแจ้งหนี้จริงของ SmartBill ทั้งผู้ส่ง ลูกค้า รายการ ยอดรวม ข้อมูลการชำระเงิน สกุลเงิน และวันครบกำหนด จึงดูเหมือนคลังเทมเพลตของผลิตภัณฑ์จริงมากกว่า',
    },
    id: {
      badge: 'Pratinjau template nyata yang dibangun dari data invoice SmartBill',
      title: 'Mulai dari template invoice yang realistis, bukan kartu placeholder yang abstrak.',
      desc: 'Pratinjau ini memakai struktur invoice SmartBill yang nyata — pengirim, klien, item, total, info pembayaran, mata uang, dan jatuh tempo — sehingga bagian ini terlihat seperti galeri template produk sungguhan.',
    },
  };
  const copy = copyByLang[lang];

  return (
    <section id="templates" className="bg-white py-14 md:py-20" data-purpose="templates">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
            <i className="fas fa-clone"></i>
            {copy.badge}
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            {copy.desc}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {PUBLIC_TEMPLATE_ITEMS.map((item) => (
            <TemplatePreviewCard
              key={item.template.id}
              item={item}
              isLoggedIn={isLoggedIn}
              lang={lang}
              onOpenTemplate={() => {
                openProtectedRoute(`/invoices/new?template=${encodeURIComponent(item.template.id)}`);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

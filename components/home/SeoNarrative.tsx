'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

export function SeoNarrative() {
  const { lang } = useMarketingLanguage();

  const copy = lang === 'zh-TW'
    ? {
        badge: 'SmartBill SEO 敘事',
        title: '一個實用的發票工具，適合需要更乾淨計費流程，而不是臃腫會計軟體的業務。',
        p1: 'SmartBill 是為自由工作者、顧問、代理商、承包商與小型企業打造的發票工具，特別適合那些需要經常向客戶開票的場景。與其把計費塞進笨重的後台流程，SmartBill 更聚焦在使用者真正關心的部分：快速建立專業發票、讓付款資訊更清楚、重用模板，並匯出精緻 PDF。',
        p2: '這讓 SmartBill 特別適合 invoice maker、invoice template、freelance invoice generator、small business invoicing、invoice PDF export 與 branded invoice creation 等搜尋意圖。產品本身已經具備發票記錄、模板重用、付款資訊區塊、品牌自訂與即時編輯，所以首頁與相關落地頁就應該持續強化這些能力。',
        p3: '如果有人正在找一個可以線上建立發票、把舊發票重用成模板、加入銀行轉帳或 QR 付款資訊，最後再匯出成 PDF 的工具，那 SmartBill 就是最合理的定位方向。這也是目前專案最強的 SEO 入口。',
      }
    : {
        badge: 'SmartBill SEO narrative',
        title: 'A practical invoice generator for businesses that need cleaner billing, not bloated accounting software.',
        p1: 'SmartBill is an invoice generator designed for freelancers, consultants, agencies, contractors, and small businesses that send client invoices regularly. Instead of forcing billing into a generic back-office flow, SmartBill focuses on the part users actually care about: creating a professional invoice quickly, keeping payment details clear, reusing templates, and exporting a polished PDF.',
        p2: 'That makes SmartBill especially relevant for searches around invoice maker, invoice template, freelance invoice generator, small business invoicing, invoice PDF export, and branded invoice creation. The product already supports invoice records, template reuse, payment information blocks, custom branding, and live editing, so the homepage and supporting landing pages should keep reinforcing those exact capabilities.',
        p3: 'If someone is looking for a way to create invoices online, reuse a previous invoice as a template, add bank transfer details or QR payment instructions, and export the final result as a PDF, SmartBill is the right positioning target. That is the strongest SEO lane for the current project.',
      };

  return (
    <section className="bg-white py-14 md:py-20" data-purpose="seo-narrative">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="rounded-[32px] border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-8 md:p-12 xl:p-14 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
            <i className="fas fa-magnifying-glass-chart"></i>
            {copy.badge}
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            {copy.title}
          </h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
            <p>{copy.p1}</p>
            <p>{copy.p2}</p>
            <p>{copy.p3}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

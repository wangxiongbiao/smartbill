'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

export function FeaturesGrid() {
  const { lang } = useMarketingLanguage();

  const features = lang === 'zh-TW'
    ? [
        { icon: 'fa-save', title: '自動保存草稿', desc: '編輯中的發票會自動保存，切換客戶或文件時也不容易丟失內容。' },
        { icon: 'fa-file-pdf', title: 'PDF 匯出', desc: '下載乾淨俐落的 PDF 發票，方便發送、列印或歸檔。' },
        { icon: 'fa-layer-group', title: '可重用模板', desc: '把一套好用的發票設定沉澱成模板，之後同類型專案直接套用。' },
        { icon: 'fa-wallet', title: '付款區塊', desc: '加入轉帳資訊、QR 圖與備註，讓客戶清楚知道如何付款。' },
        { icon: 'fa-globe', title: '多幣別支援', desc: '面對不同幣別客戶時，不用重建整份文件結構。' },
        { icon: 'fa-brush', title: '品牌自訂', desc: '可加入 logo、發票文字與視覺風格，交付更專業。' },
        { icon: 'fa-clock-rotate-left', title: '發票記錄', desc: '在同一個面板中保留可搜尋的發票、狀態與最近動態。' },
        { icon: 'fa-chart-line', title: '營收概覽', desc: '從 dashboard 首頁快速查看開票趨勢與逾期金額。' },
        { icon: 'fa-share-nodes', title: '分享流程', desc: '讓發票的發送、分享與後續跟進少一點手工整理。' },
      ]
    : [
        { icon: 'fa-save', title: 'Auto-save drafts', desc: 'Invoice edits save automatically so you do not lose work while switching between clients and documents.' },
        { icon: 'fa-file-pdf', title: 'PDF export', desc: 'Download clean PDF invoices that are ready to send, print, or archive.' },
        { icon: 'fa-layer-group', title: 'Reusable templates', desc: 'Turn a good invoice setup into a repeatable template for similar projects.' },
        { icon: 'fa-wallet', title: 'Payment sections', desc: 'Add transfer instructions, QR images, and notes so clients know exactly how to pay.' },
        { icon: 'fa-globe', title: 'Multi-currency support', desc: 'Bill clients in different currencies without rebuilding your document structure.' },
        { icon: 'fa-brush', title: 'Brand customization', desc: 'Include your logo, invoice text, and visual style for more professional delivery.' },
        { icon: 'fa-clock-rotate-left', title: 'Invoice records', desc: 'Keep a searchable list of invoices, statuses, and recent activity in one dashboard.' },
        { icon: 'fa-chart-line', title: 'Revenue overview', desc: 'Track billing trends from the dashboard homepage and spot overdue amounts faster.' },
        { icon: 'fa-share-nodes', title: 'Share workflow', desc: 'Prepare invoices for sending, sharing, and follow-up with less manual formatting work.' },
      ];

  const copy = lang === 'zh-TW'
    ? {
        title: '值得在 SEO 上重點強調的核心產品能力',
        desc: '你現在這個項目最強的地方，其實就是發票建立、模板重用、付款資訊、匯出與記錄管理，所以首頁應該直接講這些，而不是泛泛的 SaaS 詞。',
      }
    : {
        title: 'Core product capabilities that deserve SEO emphasis',
        desc: 'Your current project is strongest around invoice creation, template reuse, payment info, export, and records. So the homepage should talk about those directly instead of generic SaaS claims.',
      };

  return (
    <section className="bg-white py-14 md:py-20" data-purpose="features-grid">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            {copy.desc}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

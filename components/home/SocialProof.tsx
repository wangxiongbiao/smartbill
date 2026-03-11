'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

export function SocialProof() {
  const { lang } = useMarketingLanguage();
  const points = lang === 'zh-TW'
    ? [
        '可即時預覽的發票編輯器',
        '可重複使用的模板',
        'PDF 匯出與分享流程',
        '支援付款資訊、QR 與品牌元素',
      ]
    : [
        'Invoice editor with live preview',
        'Reusable templates for repeat billing',
        'PDF export and sharing workflow',
        'Payment details, QR, and branding support',
      ];

  return (
    <section className="border-y border-blue-100 bg-white py-5" data-purpose="trust-badges">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <p className="text-center text-[11px] font-black uppercase tracking-[0.28em] text-blue-500">
          {lang === 'zh-TW' ? '圍繞高頻開票業務真正會用的工作流打造' : 'Built around the workflow invoice-heavy businesses actually use'}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {points.map((point) => (
            <div key={point} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <i className="fas fa-circle-check text-blue-500"></i>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

export function SocialProof() {
  const { lang } = useMarketingLanguage();
  const copyByLang: Record<Language, { headline: string; points: string[] }> = {
    en: {
      headline: 'Built around the workflow invoice-heavy businesses actually use',
      points: [
        'Invoice editor with live preview',
        'Reusable templates for repeat billing',
        'PDF export and sharing workflow',
        'Payment details, QR, and branding support',
      ],
    },
    'zh-CN': {
      headline: '围绕高频开票业务真正会用的工作流打造',
      points: [
        '可实时预览的发票编辑器',
        '可重复使用的模板',
        'PDF 导出与分享流程',
        '支持付款信息、QR 与品牌元素',
      ],
    },
    'zh-TW': {
      headline: '圍繞高頻開票業務真正會用的工作流打造',
      points: [
        '可即時預覽的發票編輯器',
        '可重複使用的模板',
        'PDF 匯出與分享流程',
        '支援付款資訊、QR 與品牌元素',
      ],
    },
    th: {
      headline: 'สร้างขึ้นจากเวิร์กโฟลว์ที่ธุรกิจซึ่งออกบิลบ่อยใช้งานจริง',
      points: [
        'ตัวแก้ไขใบแจ้งหนี้พร้อมพรีวิวแบบสด',
        'เทมเพลตใช้ซ้ำสำหรับการออกบิลซ้ำ',
        'เวิร์กโฟลว์ส่งออก PDF และแชร์',
        'รองรับข้อมูลการชำระเงิน QR และองค์ประกอบแบรนด์',
      ],
    },
    id: {
      headline: 'Dibangun untuk alur kerja yang benar-benar dipakai bisnis dengan volume invoice tinggi',
      points: [
        'Editor invoice dengan pratinjau langsung',
        'Template yang dapat dipakai ulang untuk penagihan berulang',
        'Alur ekspor PDF dan berbagi',
        'Dukungan detail pembayaran, QR, dan elemen branding',
      ],
    },
  };
  const copy = copyByLang[lang];
  const points = copy.points;

  return (
    <section className="border-y border-blue-100 bg-white py-5" data-purpose="trust-badges">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <p className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-blue-500">
          {copy.headline}
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

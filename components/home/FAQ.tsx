'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

export function FAQ() {
  const { lang } = useMarketingLanguage();

  const faqs = lang === 'zh-TW'
    ? [
        {
          question: 'SmartBill 是做什麼的？',
          answer: 'SmartBill 是面向自由工作者與小型企業的線上發票工具。你可以在同一套流程裡建立發票、重用模板、管理記錄並匯出 PDF。',
        },
        {
          question: '我可以加入 logo 和付款資訊嗎？',
          answer: '可以。SmartBill 支援 logo、付款資訊區塊、備註，以及 QR 付款指引等內容。',
        },
        {
          question: '我可以把之前的發票重用成模板嗎？',
          answer: '可以。SmartBill 提供模板流程，讓你把一套好用的發票配置存下來，下一次直接沿用。',
        },
        {
          question: 'SmartBill 可以匯出 PDF 發票嗎？',
          answer: '可以。產品本身就是為了產出可交付、可留檔的精緻 PDF 發票而設計。',
        },
        {
          question: 'SmartBill 最適合哪些人？',
          answer: '它最適合自由工作者、承包商、代理商、顧問，以及需要快速開票、但不想用複雜會計軟體的小型服務業務。',
        },
      ]
    : [
        {
          question: 'What does SmartBill do?',
          answer: 'SmartBill is a web-based invoice generator for freelancers and small businesses. You can create invoices, reuse templates, manage billing records, and export PDFs from one workflow.',
        },
        {
          question: 'Can I add my logo and payment details?',
          answer: 'Yes. SmartBill supports branding elements like logo placement as well as payment information blocks, notes, and QR-based payment instructions.',
        },
        {
          question: 'Can I reuse a previous invoice as a template?',
          answer: 'Yes. SmartBill includes template workflows so you can save a good invoice setup and start the next one from the same structure.',
        },
        {
          question: 'Does SmartBill export invoice PDFs?',
          answer: 'Yes. The product is designed to generate polished invoices that can be exported as PDF documents for client delivery and record keeping.',
        },
        {
          question: 'Who is SmartBill best for?',
          answer: 'It is best for freelancers, contractors, agencies, consultants, and small service businesses that need fast billing without complex accounting software.',
        },
      ];

  const copy = lang === 'zh-TW'
    ? {
        badge: '常見問題',
        title: '在試用發票工具前，大家真的會先問的那些問題',
        desc: '這些回答不只是給使用者看，也能強化你目前產品已經支援的搜尋意圖與工作流。',
      }
    : {
        badge: 'FAQ',
        title: 'Questions people actually ask before trying an invoice tool',
        desc: 'These answers also reinforce the search terms and workflows your current product already supports.',
      };

  return (
    <section id="faq" className="bg-white py-14 md:py-20" data-purpose="faq">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
            <i className="fas fa-circle-question"></i>
            {copy.badge}
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{copy.desc}</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group rounded-[24px] border border-blue-100 bg-white p-0 shadow-sm transition-colors hover:border-blue-200">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5">
                <span className="pr-4 text-left text-base font-black text-slate-900">{faq.question}</span>
                <span className="ml-4 shrink-0 text-blue-400 transition-transform group-open:rotate-45">
                  <i className="fas fa-plus"></i>
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm leading-7 text-slate-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

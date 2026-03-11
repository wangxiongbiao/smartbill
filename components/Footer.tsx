'use client';

import React from 'react';
import { useMarketingAuth } from '@/components/marketing/MarketingAuthProvider';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

export function Footer() {
  const { openProtectedRoute } = useMarketingAuth();
  const { lang } = useMarketingLanguage();

  const copy = lang === 'zh-TW'
    ? {
        badge: '開票流程',
        description: 'SmartBill 幫助自由工作者與小型企業更快建立專業發票、重用模板、整理記錄，並匯出精緻 PDF。',
        product: '產品',
        dashboard: '控制台',
        createInvoice: '建立發票',
        templates: '模板',
        features: '功能特色',
        useCases: '使用場景',
        case1: '自由接案開票',
        case2: '代理商長期合作',
        case3: '顧問服務計費',
        case4: '小型企業發票',
        contact: '聯絡方式',
        contactText: '產品回饋、支援與商務合作請來信。',
        rights: '版權所有',
        keyword1: '發票生成器',
        keyword2: '模板',
        keyword3: 'PDF 匯出',
      }
    : {
        badge: 'Invoice workflow',
        description: 'SmartBill helps freelancers and small businesses create professional invoices, reuse templates, organize records, and export polished PDFs with less manual work.',
        product: 'Product',
        dashboard: 'Dashboard',
        createInvoice: 'Create invoice',
        templates: 'Templates',
        features: 'Features',
        useCases: 'Use cases',
        case1: 'Freelance invoicing',
        case2: 'Agency retainers',
        case3: 'Consulting billing',
        case4: 'Small business invoices',
        contact: 'Contact',
        contactText: 'For product feedback, support, and business inquiries.',
        rights: 'All rights reserved.',
        keyword1: 'Invoice generator',
        keyword2: 'Templates',
        keyword3: 'PDF export',
      };

  return (
    <footer className="border-t border-blue-100 bg-white text-slate-900" data-purpose="footer">
      <div className="px-4 py-14 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-[0_12px_28px_-18px_rgba(37,99,235,0.52)]">
                <i className="fas fa-file-invoice"></i>
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">SmartBill</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#60a5fa]">{copy.badge}</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
              {copy.description}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#60a5fa]">{copy.product}</h4>
            <ul className="mt-5 space-y-3 text-sm font-medium text-slate-600">
              <li>
                <button type="button" onClick={() => openProtectedRoute('/dashboard')} className="transition-colors hover:text-[#1d4ed8]">
                  {copy.dashboard}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openProtectedRoute('/invoices/new')} className="transition-colors hover:text-[#1d4ed8]">
                  {copy.createInvoice}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openProtectedRoute('/templates')} className="transition-colors hover:text-[#1d4ed8]">
                  {copy.templates}
                </button>
              </li>
              <li><a className="transition-colors hover:text-[#1d4ed8]" href="#features">{copy.features}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#60a5fa]">{copy.useCases}</h4>
            <ul className="mt-5 space-y-3 text-sm font-medium text-slate-600">
              <li>{copy.case1}</li>
              <li>{copy.case2}</li>
              <li>{copy.case3}</li>
              <li>{copy.case4}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#60a5fa]">{copy.contact}</h4>
            <div className="mt-5 rounded-[24px] border border-[#dbeafe] bg-white p-5 text-sm text-slate-600 shadow-sm">
              <div className="flex items-start gap-3">
                <i className="fas fa-envelope mt-1 text-[#60a5fa]"></i>
                <div>
                  <div className="font-semibold text-slate-900">smartbillpro@gmail.com</div>
                  <div className="mt-1 text-slate-500">{copy.contactText}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-blue-100 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SmartBill. {copy.rights}</p>
          <div className="flex items-center gap-5">
            <span>{copy.keyword1}</span>
            <span>{copy.keyword2}</span>
            <span>{copy.keyword3}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

export function TargetAudience() {
  const { lang } = useMarketingLanguage();

  const audience = lang === 'zh-TW'
    ? [
        {
          title: '自由工作者',
          desc: '不必在試算表與設計檔之間來回切換，就能快速建立專業的客戶發票。',
          icon: 'fa-user-tie',
        },
        {
          title: '代理商與工作室',
          desc: '針對長期合作、專案型計費與 recurring retainers 重用品牌一致的模板。',
          icon: 'fa-building',
        },
        {
          title: '小型企業',
          desc: '整理發票記錄、追蹤草稿，並匯出精緻 PDF 方便記帳與交付客戶。',
          icon: 'fa-shop',
        },
      ]
    : [
        {
          title: 'Freelancers',
          desc: 'Create fast, professional invoices for client projects without juggling spreadsheets and design files.',
          icon: 'fa-user-tie',
        },
        {
          title: 'Agencies & studios',
          desc: 'Reuse branded templates for recurring retainers, campaigns, and project-based billing.',
          icon: 'fa-building',
        },
        {
          title: 'Small businesses',
          desc: 'Keep invoice records organized, track drafts, and export polished PDFs for bookkeeping and client delivery.',
          icon: 'fa-shop',
        },
      ];

  const copy = lang === 'zh-TW'
    ? {
        title: 'SmartBill 適合需要準確、體面發票，又不想背負笨重會計軟體的服務型業務。',
        desc: '如果你的工作流是報價、開票、收款、留存清楚記錄，那首頁定位就應該圍繞這件事來講。',
      }
    : {
        title: 'SmartBill fits service businesses that need accurate, presentable invoices without heavy accounting software.',
        desc: 'If your workflow is quote the work, send the invoice, collect payment, and keep a clean record, this homepage and product positioning should lean into exactly that.',
      };

  return (
    <section id="audience" className="bg-white py-14 md:py-20" data-purpose="audience-segments">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            {copy.desc}
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {audience.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-blue-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

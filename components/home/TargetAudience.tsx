'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

export function TargetAudience() {
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, {
    title: string;
    desc: string;
    audience: { title: string; desc: string; icon: string }[];
  }> = {
    en: {
      title: 'SmartBill fits service businesses that need accurate, presentable invoices without heavy accounting software.',
      desc: 'If your workflow is quote the work, send the invoice, collect payment, and keep a clean record, this homepage and product positioning should lean into exactly that.',
      audience: [
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
      ],
    },
    'zh-CN': {
      title: 'SmartBill 适合需要准确、体面发票，又不想背负笨重会计软件的服务型业务。',
      desc: '如果你的工作流是报价、开票、收款、留存清晰记录，那首页定位就应该围绕这件事来讲。',
      audience: [
        {
          title: '自由职业者',
          desc: '不必在表格与设计文件之间来回切换，也能快速创建专业的客户发票。',
          icon: 'fa-user-tie',
        },
        {
          title: '代理商与工作室',
          desc: '为长期合作、项目制计费与 recurring retainers 复用品牌一致的模板。',
          icon: 'fa-building',
        },
        {
          title: '小型企业',
          desc: '整理发票记录、追踪草稿，并导出精致 PDF，方便记账与交付客户。',
          icon: 'fa-shop',
        },
      ],
    },
    'zh-TW': {
      title: 'SmartBill 適合需要準確、體面發票，又不想背負笨重會計軟體的服務型業務。',
      desc: '如果你的工作流是報價、開票、收款、留存清楚記錄，那首頁定位就應該圍繞這件事來講。',
      audience: [
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
      ],
    },
    th: {
      title: 'SmartBill เหมาะกับธุรกิจบริการที่ต้องการใบแจ้งหนี้ที่ถูกต้อง ดูดี และไม่อยากแบกซอฟต์แวร์บัญชีที่หนักเกินไป',
      desc: 'ถ้าเวิร์กโฟลว์ของคุณคือเสนอราคา ส่งใบแจ้งหนี้ รับชำระเงิน และเก็บบันทึกให้เรียบร้อย หน้าแรกควรสื่อสารสิ่งนั้นโดยตรง',
      audience: [
        {
          title: 'ฟรีแลนซ์',
          desc: 'สร้างใบแจ้งหนี้แบบมืออาชีพให้ลูกค้าได้อย่างรวดเร็ว โดยไม่ต้องสลับไปมาระหว่างสเปรดชีตกับไฟล์ออกแบบ',
          icon: 'fa-user-tie',
        },
        {
          title: 'เอเจนซีและสตูดิโอ',
          desc: 'ใช้เทมเพลตแบรนด์เดิมซ้ำสำหรับรีเทนเนอร์ แคมเปญ และการคิดค่าบริการตามโปรเจกต์',
          icon: 'fa-building',
        },
        {
          title: 'ธุรกิจขนาดเล็ก',
          desc: 'จัดระเบียบบันทึกใบแจ้งหนี้ ติดตามร่างงาน และส่งออก PDF ที่ดูดีสำหรับงานบัญชีและส่งให้ลูกค้า',
          icon: 'fa-shop',
        },
      ],
    },
    id: {
      title: 'SmartBill cocok untuk bisnis jasa yang membutuhkan invoice akurat dan rapi tanpa software akuntansi yang berat.',
      desc: 'Jika alur kerja Anda adalah memberi penawaran, mengirim invoice, menerima pembayaran, dan menyimpan catatan dengan rapi, maka positioning homepage harus menekankan hal itu.',
      audience: [
        {
          title: 'Freelancer',
          desc: 'Buat invoice profesional dengan cepat untuk proyek klien tanpa harus bolak-balik antara spreadsheet dan file desain.',
          icon: 'fa-user-tie',
        },
        {
          title: 'Agensi & studio',
          desc: 'Gunakan ulang template berbranding untuk retainer, kampanye, dan penagihan berbasis proyek.',
          icon: 'fa-building',
        },
        {
          title: 'Bisnis kecil',
          desc: 'Rapikan catatan invoice, lacak draf, dan ekspor PDF profesional untuk pembukuan dan pengiriman ke klien.',
          icon: 'fa-shop',
        },
      ],
    },
  };
  const copy = copyByLang[lang];
  const audience = copy.audience;

  return (
    <section id="audience" className="bg-white py-14 md:py-20" data-purpose="audience-segments">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
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
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

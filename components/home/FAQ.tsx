'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

export function FAQ() {
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, {
    badge: string;
    title: string;
    desc: string;
    faqs: { question: string; answer: string }[];
  }> = {
    en: {
      badge: 'FAQ',
      title: 'Questions people actually ask before trying an invoice tool',
      desc: 'These answers also reinforce the search terms and workflows your current product already supports.',
      faqs: [
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
      ],
    },
    'zh-CN': {
      badge: '常见问题',
      title: '在试用发票工具前，大家真的会先问的那些问题',
      desc: '这些回答不只是给用户看，也能强化你目前产品已经支持的搜索意图与工作流。',
      faqs: [
        {
          question: 'SmartBill 是做什么的？',
          answer: 'SmartBill 是面向自由职业者与小型企业的在线发票工具。你可以在同一套流程里创建发票、复用模板、管理记录并导出 PDF。',
        },
        {
          question: '我可以加入 logo 和付款信息吗？',
          answer: '可以。SmartBill 支持 logo、付款信息区块、备注，以及 QR 付款指引等内容。',
        },
        {
          question: '我可以把之前的发票复用成模板吗？',
          answer: '可以。SmartBill 提供模板流程，让你把一套好用的发票配置存下来，下一次直接沿用。',
        },
        {
          question: 'SmartBill 可以导出 PDF 发票吗？',
          answer: '可以。产品本身就是为了产出可交付、可留档的精致 PDF 发票而设计。',
        },
        {
          question: 'SmartBill 最适合哪些人？',
          answer: '它最适合自由职业者、承包商、代理商、顾问，以及需要快速开票、但不想用复杂会计软件的小型服务型业务。',
        },
      ],
    },
    'zh-TW': {
      badge: '常見問題',
      title: '在試用發票工具前，大家真的會先問的那些問題',
      desc: '這些回答不只是給使用者看，也能強化你目前產品已經支援的搜尋意圖與工作流。',
      faqs: [
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
      ],
    },
    th: {
      badge: 'คำถามที่พบบ่อย',
      title: 'คำถามที่คนมักถามจริง ๆ ก่อนลองใช้เครื่องมือออกใบแจ้งหนี้',
      desc: 'คำตอบเหล่านี้ยังช่วยเสริมคำค้นหาและเวิร์กโฟลว์ที่ผลิตภัณฑ์ของคุณรองรับอยู่แล้ว',
      faqs: [
        {
          question: 'SmartBill ทำอะไรได้บ้าง?',
          answer: 'SmartBill เป็นเครื่องมือออกใบแจ้งหนี้ออนไลน์สำหรับฟรีแลนซ์และธุรกิจขนาดเล็ก คุณสามารถสร้างใบแจ้งหนี้ ใช้เทมเพลตซ้ำ จัดการบันทึก และส่งออก PDF ได้ในเวิร์กโฟลว์เดียว',
        },
        {
          question: 'ฉันสามารถเพิ่มโลโก้และข้อมูลการชำระเงินได้หรือไม่?',
          answer: 'ได้ SmartBill รองรับองค์ประกอบแบรนด์อย่างโลโก้ รวมถึงบล็อกข้อมูลการชำระเงิน หมายเหตุ และคำแนะนำการจ่ายเงินผ่าน QR',
        },
        {
          question: 'ฉันสามารถใช้ใบแจ้งหนี้เดิมเป็นเทมเพลตได้หรือไม่?',
          answer: 'ได้ SmartBill มีเวิร์กโฟลว์เทมเพลตให้คุณบันทึกชุดใบแจ้งหนี้ที่ใช้งานได้ดี แล้วเริ่มใบถัดไปจากโครงสร้างเดียวกัน',
        },
        {
          question: 'SmartBill ส่งออกใบแจ้งหนี้ PDF ได้หรือไม่?',
          answer: 'ได้ ผลิตภัณฑ์นี้ออกแบบมาเพื่อสร้างใบแจ้งหนี้ที่ดูดีและสามารถส่งออกเป็น PDF สำหรับส่งให้ลูกค้าและเก็บบันทึกได้',
        },
        {
          question: 'SmartBill เหมาะกับใครมากที่สุด?',
          answer: 'เหมาะกับฟรีแลนซ์ ผู้รับเหมา เอเจนซี ที่ปรึกษา และธุรกิจบริการขนาดเล็กที่ต้องการออกบิลได้เร็วโดยไม่ต้องใช้ซอฟต์แวร์บัญชีที่ซับซ้อน',
        },
      ],
    },
    id: {
      badge: 'FAQ',
      title: 'Pertanyaan yang benar-benar ditanyakan orang sebelum mencoba alat invoice',
      desc: 'Jawaban ini juga memperkuat istilah pencarian dan alur kerja yang sudah didukung produk Anda saat ini.',
      faqs: [
        {
          question: 'Apa yang dilakukan SmartBill?',
          answer: 'SmartBill adalah alat invoice online untuk freelancer dan bisnis kecil. Anda dapat membuat invoice, menggunakan ulang template, mengelola catatan, dan mengekspor PDF dalam satu alur kerja.',
        },
        {
          question: 'Bisakah saya menambahkan logo dan detail pembayaran?',
          answer: 'Bisa. SmartBill mendukung elemen branding seperti logo serta blok informasi pembayaran, catatan, dan instruksi pembayaran berbasis QR.',
        },
        {
          question: 'Bisakah saya menggunakan invoice sebelumnya sebagai template?',
          answer: 'Bisa. SmartBill memiliki alur template sehingga Anda dapat menyimpan susunan invoice yang bagus dan memulai invoice berikutnya dari struktur yang sama.',
        },
        {
          question: 'Apakah SmartBill bisa mengekspor invoice PDF?',
          answer: 'Bisa. Produk ini dirancang untuk menghasilkan invoice rapi yang dapat diekspor sebagai PDF untuk dikirim ke klien dan disimpan sebagai arsip.',
        },
        {
          question: 'SmartBill paling cocok untuk siapa?',
          answer: 'SmartBill paling cocok untuk freelancer, kontraktor, agensi, konsultan, dan bisnis jasa kecil yang membutuhkan penagihan cepat tanpa software akuntansi yang rumit.',
        },
      ],
    },
  };
  const copy = copyByLang[lang];
  const faqs = copy.faqs;

  return (
    <section id="faq" className="bg-white py-14 md:py-20" data-purpose="faq">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-blue-700">
            <i className="fas fa-circle-question"></i>
            {copy.badge}
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{copy.desc}</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group rounded-[1.5rem] border border-blue-100 bg-white p-0 shadow-sm transition-colors hover:border-blue-200">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5">
                <span className="pr-4 text-left text-base font-semibold text-slate-900">{faq.question}</span>
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

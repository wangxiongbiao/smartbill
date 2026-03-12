'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

export function SeoNarrative() {
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, { badge: string; title: string; p1: string; p2: string; p3: string }> = {
    en: {
      badge: 'SmartBill SEO narrative',
      title: 'A practical invoice generator for businesses that need cleaner billing, not bloated accounting software.',
      p1: 'SmartBill is an invoice generator designed for freelancers, consultants, agencies, contractors, and small businesses that send client invoices regularly. Instead of forcing billing into a generic back-office flow, SmartBill focuses on the part users actually care about: creating a professional invoice quickly, keeping payment details clear, reusing templates, and exporting a polished PDF.',
      p2: 'That makes SmartBill especially relevant for searches around invoice maker, invoice template, freelance invoice generator, small business invoicing, invoice PDF export, and branded invoice creation. The product already supports invoice records, template reuse, payment information blocks, custom branding, and live editing, so the homepage and supporting landing pages should keep reinforcing those exact capabilities.',
      p3: 'If someone is looking for a way to create invoices online, reuse a previous invoice as a template, add bank transfer details or QR payment instructions, and export the final result as a PDF, SmartBill is the right positioning target. That is the strongest SEO lane for the current project.',
    },
    'zh-CN': {
      badge: 'SmartBill SEO 叙事',
      title: '一个实用的发票工具，适合需要更干净计费流程，而不是臃肿会计软件的业务。',
      p1: 'SmartBill 是为自由职业者、顾问、代理商、承包商与小型企业打造的发票工具，特别适合那些需要经常向客户开票的场景。与其把计费塞进笨重的后台流程，SmartBill 更聚焦在用户真正关心的部分：快速创建专业发票、让付款信息更清楚、复用模板，并导出精致 PDF。',
      p2: '这让 SmartBill 特别适合 invoice maker、invoice template、freelance invoice generator、small business invoicing、invoice PDF export 与 branded invoice creation 等搜索意图。产品本身已经具备发票记录、模板复用、付款信息区块、品牌定制与实时编辑，所以首页与相关落地页就应该持续强化这些能力。',
      p3: '如果有人正在找一个可以在线创建发票、把旧发票复用成模板、加入银行转账或 QR 付款信息，最后再导出成 PDF 的工具，那 SmartBill 就是最合理的定位方向。这也是目前项目最强的 SEO 入口。',
    },
    'zh-TW': {
      badge: 'SmartBill SEO 敘事',
      title: '一個實用的發票工具，適合需要更乾淨計費流程，而不是臃腫會計軟體的業務。',
      p1: 'SmartBill 是為自由工作者、顧問、代理商、承包商與小型企業打造的發票工具，特別適合那些需要經常向客戶開票的場景。與其把計費塞進笨重的後台流程，SmartBill 更聚焦在使用者真正關心的部分：快速建立專業發票、讓付款資訊更清楚、重用模板，並匯出精緻 PDF。',
      p2: '這讓 SmartBill 特別適合 invoice maker、invoice template、freelance invoice generator、small business invoicing、invoice PDF export 與 branded invoice creation 等搜尋意圖。產品本身已經具備發票記錄、模板重用、付款資訊區塊、品牌自訂與即時編輯，所以首頁與相關落地頁就應該持續強化這些能力。',
      p3: '如果有人正在找一個可以線上建立發票、把舊發票重用成模板、加入銀行轉帳或 QR 付款資訊，最後再匯出成 PDF 的工具，那 SmartBill 就是最合理的定位方向。這也是目前專案最強的 SEO 入口。',
    },
    th: {
      badge: 'เรื่องเล่า SEO ของ SmartBill',
      title: 'เครื่องมือออกใบแจ้งหนี้ที่ใช้งานได้จริงสำหรับธุรกิจที่ต้องการกระบวนการวางบิลที่สะอาดกว่า ไม่ใช่ซอฟต์แวร์บัญชีที่เทอะทะ',
      p1: 'SmartBill เป็นเครื่องมือออกใบแจ้งหนี้สำหรับฟรีแลนซ์ ที่ปรึกษา เอเจนซี ผู้รับเหมา และธุรกิจขนาดเล็กที่ต้องออกใบแจ้งหนี้ให้ลูกค้าเป็นประจำ แทนที่จะบังคับให้การวางบิลอยู่ในระบบหลังบ้านแบบทั่วไป SmartBill โฟกัสในส่วนที่ผู้ใช้สนใจจริง คือ การสร้างใบแจ้งหนี้แบบมืออาชีพอย่างรวดเร็ว ทำให้ข้อมูลการชำระเงินชัดเจน ใช้เทมเพลตซ้ำ และส่งออก PDF ที่ดูดี',
      p2: 'จึงทำให้ SmartBill เหมาะกับคำค้นหาอย่าง invoice maker, invoice template, freelance invoice generator, small business invoicing, invoice PDF export และ branded invoice creation ผลิตภัณฑ์รองรับบันทึกใบแจ้งหนี้ การใช้เทมเพลตซ้ำ บล็อกข้อมูลการชำระเงิน การปรับแบรนด์ และการแก้ไขแบบสดอยู่แล้ว ดังนั้นหน้าแรกและหน้าแลนดิ้งที่เกี่ยวข้องควรเน้นความสามารถเหล่านี้อย่างต่อเนื่อง',
      p3: 'หากใครกำลังมองหาเครื่องมือที่สร้างใบแจ้งหนี้ออนไลน์ ใช้ใบแจ้งหนี้เดิมเป็นเทมเพลต เพิ่มรายละเอียดโอนเงินหรือคำแนะนำการชำระเงินผ่าน QR แล้วส่งออกผลลัพธ์เป็น PDF ได้ SmartBill คือทิศทางการวางตำแหน่งที่เหมาะที่สุด และนี่คือช่องทาง SEO ที่แข็งแรงที่สุดของโปรเจกต์นี้',
    },
    id: {
      badge: 'Narasi SEO SmartBill',
      title: 'Pembuat invoice praktis untuk bisnis yang membutuhkan alur penagihan yang lebih rapi, bukan software akuntansi yang gemuk.',
      p1: 'SmartBill adalah pembuat invoice yang dirancang untuk freelancer, konsultan, agensi, kontraktor, dan bisnis kecil yang rutin mengirim invoice ke klien. Alih-alih memaksa penagihan masuk ke alur back-office yang generik, SmartBill berfokus pada hal yang benar-benar penting bagi pengguna: membuat invoice profesional dengan cepat, memperjelas detail pembayaran, memakai ulang template, dan mengekspor PDF yang rapi.',
      p2: 'Itu membuat SmartBill sangat relevan untuk pencarian seperti invoice maker, invoice template, freelance invoice generator, small business invoicing, invoice PDF export, dan branded invoice creation. Produk ini sudah mendukung catatan invoice, penggunaan ulang template, blok informasi pembayaran, branding kustom, dan pengeditan langsung, sehingga homepage dan landing page pendukung harus terus menegaskan kemampuan tersebut.',
      p3: 'Jika seseorang sedang mencari cara untuk membuat invoice online, memakai ulang invoice lama sebagai template, menambahkan detail transfer bank atau instruksi pembayaran QR, lalu mengekspor hasil akhirnya sebagai PDF, SmartBill adalah positioning yang paling tepat. Itu adalah jalur SEO terkuat untuk proyek saat ini.',
    },
  };
  const copy = copyByLang[lang];

  return (
    <section className="bg-white py-14 md:py-20" data-purpose="seo-narrative">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="rounded-[32px] border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-8 md:p-12 xl:p-14 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
            <i className="fas fa-magnifying-glass-chart"></i>
            {copy.badge}
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
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

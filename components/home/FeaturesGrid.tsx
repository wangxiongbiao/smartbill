'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

export function FeaturesGrid() {
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, {
    title: string;
    desc: string;
    features: { icon: string; title: string; desc: string }[];
  }> = {
    en: {
      title: 'Core product capabilities that deserve SEO emphasis',
      desc: 'Your current project is strongest around invoice creation, template reuse, payment info, export, and records. So the homepage should talk about those directly instead of generic SaaS claims.',
      features: [
        { icon: 'fa-save', title: 'Auto-save drafts', desc: 'Invoice edits save automatically so you do not lose work while switching between clients and documents.' },
        { icon: 'fa-file-pdf', title: 'PDF export', desc: 'Download clean PDF invoices that are ready to send, print, or archive.' },
        { icon: 'fa-layer-group', title: 'Reusable templates', desc: 'Turn a good invoice setup into a repeatable template for similar projects.' },
        { icon: 'fa-wallet', title: 'Payment sections', desc: 'Add transfer instructions, QR images, and notes so clients know exactly how to pay.' },
        { icon: 'fa-globe', title: 'Multi-currency support', desc: 'Bill clients in different currencies without rebuilding your document structure.' },
        { icon: 'fa-brush', title: 'Brand customization', desc: 'Include your logo, invoice text, and visual style for more professional delivery.' },
        { icon: 'fa-clock-rotate-left', title: 'Invoice records', desc: 'Keep a searchable list of invoices, statuses, and recent activity in one dashboard.' },
        { icon: 'fa-chart-line', title: 'Revenue overview', desc: 'Track billing trends from the dashboard homepage and spot overdue amounts faster.' },
        { icon: 'fa-share-nodes', title: 'Share workflow', desc: 'Prepare invoices for sending, sharing, and follow-up with less manual formatting work.' },
      ],
    },
    'zh-CN': {
      title: '值得在 SEO 上重点强调的核心产品能力',
      desc: '你现在这个项目最强的地方，其实就是发票创建、模板复用、付款信息、导出与记录管理，所以首页应该直接讲这些，而不是泛泛的 SaaS 说法。',
      features: [
        { icon: 'fa-save', title: '自动保存草稿', desc: '编辑中的发票会自动保存，切换客户或文件时也不容易丢失内容。' },
        { icon: 'fa-file-pdf', title: 'PDF 导出', desc: '下载干净利落的 PDF 发票，方便发送、打印或归档。' },
        { icon: 'fa-layer-group', title: '可复用模板', desc: '把一套好用的发票设置沉淀成模板，之后同类型项目直接套用。' },
        { icon: 'fa-wallet', title: '付款区块', desc: '加入转账信息、QR 图与备注，让客户清楚知道如何付款。' },
        { icon: 'fa-globe', title: '多币种支持', desc: '面对不同币种客户时，不用重建整份文档结构。' },
        { icon: 'fa-brush', title: '品牌定制', desc: '可加入 logo、发票文字与视觉风格，交付更专业。' },
        { icon: 'fa-clock-rotate-left', title: '发票记录', desc: '在同一个面板中保留可搜索的发票、状态与最近动态。' },
        { icon: 'fa-chart-line', title: '营收概览', desc: '从 dashboard 首页快速查看开票趋势与逾期金额。' },
        { icon: 'fa-share-nodes', title: '分享流程', desc: '让发票的发送、分享与后续跟进少一点手工整理。' },
      ],
    },
    'zh-TW': {
      title: '值得在 SEO 上重點強調的核心產品能力',
      desc: '你現在這個項目最強的地方，其實就是發票建立、模板重用、付款資訊、匯出與記錄管理，所以首頁應該直接講這些，而不是泛泛的 SaaS 詞。',
      features: [
        { icon: 'fa-save', title: '自動保存草稿', desc: '編輯中的發票會自動保存，切換客戶或文件時也不容易丟失內容。' },
        { icon: 'fa-file-pdf', title: 'PDF 匯出', desc: '下載乾淨俐落的 PDF 發票，方便發送、列印或歸檔。' },
        { icon: 'fa-layer-group', title: '可重用模板', desc: '把一套好用的發票設定沉澱成模板，之後同類型專案直接套用。' },
        { icon: 'fa-wallet', title: '付款區塊', desc: '加入轉帳資訊、QR 圖與備註，讓客戶清楚知道如何付款。' },
        { icon: 'fa-globe', title: '多幣別支援', desc: '面對不同幣別客戶時，不用重建整份文件結構。' },
        { icon: 'fa-brush', title: '品牌自訂', desc: '可加入 logo、發票文字與視覺風格，交付更專業。' },
        { icon: 'fa-clock-rotate-left', title: '發票記錄', desc: '在同一個面板中保留可搜尋的發票、狀態與最近動態。' },
        { icon: 'fa-chart-line', title: '營收概覽', desc: '從 dashboard 首頁快速查看開票趨勢與逾期金額。' },
        { icon: 'fa-share-nodes', title: '分享流程', desc: '讓發票的發送、分享與後續跟進少一點手工整理。' },
      ],
    },
    th: {
      title: 'ความสามารถหลักของผลิตภัณฑ์ที่ควรเน้นใน SEO',
      desc: 'จุดแข็งของโปรเจกต์นี้อยู่ที่การสร้างใบแจ้งหนี้ การใช้เทมเพลตซ้ำ ข้อมูลการชำระเงิน การส่งออก และการจัดการบันทึก ดังนั้นหน้าแรกควรพูดถึงสิ่งเหล่านี้โดยตรงแทนคำอธิบาย SaaS กว้าง ๆ',
      features: [
        { icon: 'fa-save', title: 'บันทึกร่างอัตโนมัติ', desc: 'การแก้ไขใบแจ้งหนี้จะถูกบันทึกอัตโนมัติเพื่อไม่ให้คุณสูญเสียงานระหว่างสลับลูกค้าหรือเอกสาร' },
        { icon: 'fa-file-pdf', title: 'ส่งออก PDF', desc: 'ดาวน์โหลดใบแจ้งหนี้ PDF ที่สะอาดและพร้อมสำหรับการส่ง พิมพ์ หรือเก็บถาวร' },
        { icon: 'fa-layer-group', title: 'เทมเพลตใช้ซ้ำได้', desc: 'เปลี่ยนชุดใบแจ้งหนี้ที่ดีให้เป็นเทมเพลตที่ใช้ซ้ำได้สำหรับโปรเจกต์ลักษณะคล้ายกัน' },
        { icon: 'fa-wallet', title: 'ส่วนการชำระเงิน', desc: 'เพิ่มคำแนะนำการโอนเงิน รูป QR และหมายเหตุเพื่อให้ลูกค้ารู้ว่าต้องจ่ายอย่างไร' },
        { icon: 'fa-globe', title: 'รองรับหลายสกุลเงิน', desc: 'ออกบิลให้ลูกค้าในหลายสกุลเงินได้โดยไม่ต้องสร้างโครงสร้างเอกสารใหม่' },
        { icon: 'fa-brush', title: 'ปรับแต่งแบรนด์', desc: 'เพิ่มโลโก้ ข้อความในใบแจ้งหนี้ และสไตล์ภาพลักษณ์เพื่อการส่งมอบที่เป็นมืออาชีพยิ่งขึ้น' },
        { icon: 'fa-clock-rotate-left', title: 'บันทึกใบแจ้งหนี้', desc: 'เก็บรายการใบแจ้งหนี้ สถานะ และกิจกรรมล่าสุดที่ค้นหาได้ไว้ในแดชบอร์ดเดียว' },
        { icon: 'fa-chart-line', title: 'ภาพรวมรายได้', desc: 'ติดตามแนวโน้มการออกบิลจากหน้าแดชบอร์ดและเห็นยอดค้างชำระได้เร็วขึ้น' },
        { icon: 'fa-share-nodes', title: 'เวิร์กโฟลว์การแชร์', desc: 'เตรียมใบแจ้งหนี้สำหรับการส่ง การแชร์ และการติดตามผลด้วยงานจัดรูปแบบที่น้อยลง' },
      ],
    },
    id: {
      title: 'Kemampuan inti produk yang layak ditekankan untuk SEO',
      desc: 'Kekuatan utama proyek Anda ada pada pembuatan invoice, penggunaan ulang template, info pembayaran, ekspor, dan catatan. Jadi homepage harus membicarakan itu secara langsung, bukan klaim SaaS yang terlalu umum.',
      features: [
        { icon: 'fa-save', title: 'Simpan draf otomatis', desc: 'Edit invoice disimpan otomatis sehingga pekerjaan Anda tidak hilang saat berpindah klien atau dokumen.' },
        { icon: 'fa-file-pdf', title: 'Ekspor PDF', desc: 'Unduh invoice PDF yang bersih dan siap dikirim, dicetak, atau diarsipkan.' },
        { icon: 'fa-layer-group', title: 'Template dapat dipakai ulang', desc: 'Ubah susunan invoice yang bagus menjadi template berulang untuk proyek serupa.' },
        { icon: 'fa-wallet', title: 'Bagian pembayaran', desc: 'Tambahkan instruksi transfer, gambar QR, dan catatan agar klien tahu persis cara membayar.' },
        { icon: 'fa-globe', title: 'Dukungan multi-mata uang', desc: 'Tagih klien dalam mata uang berbeda tanpa membangun ulang struktur dokumen.' },
        { icon: 'fa-brush', title: 'Kustomisasi merek', desc: 'Sertakan logo, teks invoice, dan gaya visual Anda untuk pengiriman yang lebih profesional.' },
        { icon: 'fa-clock-rotate-left', title: 'Catatan invoice', desc: 'Simpan daftar invoice, status, dan aktivitas terbaru yang dapat dicari dalam satu dashboard.' },
        { icon: 'fa-chart-line', title: 'Ringkasan pendapatan', desc: 'Pantau tren penagihan dari homepage dashboard dan lihat nilai yang jatuh tempo lebih cepat.' },
        { icon: 'fa-share-nodes', title: 'Alur berbagi', desc: 'Siapkan invoice untuk dikirim, dibagikan, dan ditindaklanjuti dengan lebih sedikit pekerjaan manual.' },
      ],
    },
  };
  const copy = copyByLang[lang];
  const features = copy.features;

  return (
    <section className="bg-white py-14 md:py-20" data-purpose="features-grid">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            {copy.desc}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

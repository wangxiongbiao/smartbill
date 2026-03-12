'use client';

import React from 'react';
import { useMarketingAuth } from '@/components/marketing/MarketingAuthProvider';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_20px_44px_-34px_rgba(37,99,235,0.16)]">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">{label}</div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

export function Hero() {
  const { isLoggedIn, isGoogleLoading, openProtectedRoute } = useMarketingAuth();
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, {
    title: string;
    subtitle: string;
    primaryLoggedIn: string;
    primaryLoggedOut: string;
    secondary: string;
    metric1Label: string;
    metric1Value: string;
    metric2Label: string;
    metric2Value: string;
    metric3Label: string;
    metric3Value: string;
    preview: string;
    autosaved: string;
    editor: string;
    billingDetails: string;
    editorFields: string[];
    magicBanner: string;
    invoicePdf: string;
    brandForward: string;
    due: string;
    billTo: string;
    payment: string;
    paymentValue: string;
    items: string[];
    totalDue: string;
    pdfReady: string;
  }> = {
    en: {
      title: 'Create clean invoices, reuse templates, and export polished PDFs with SmartBill.',
      subtitle: 'SmartBill is built for freelancers, contractors, agencies, and small businesses that need faster billing. Add your logo, client details, payment instructions, and line items in one focused workflow.',
      primaryLoggedIn: 'Create new invoice',
      primaryLoggedOut: 'Start free',
      secondary: 'Browse templates',
      metric1Label: 'Use case',
      metric1Value: 'Invoices + templates',
      metric2Label: 'Output',
      metric2Value: 'Share-ready PDF',
      metric3Label: 'Workflow',
      metric3Value: 'Draft to edit to export',
      preview: 'SmartBill preview',
      autosaved: 'Auto-saved',
      editor: 'Editor',
      billingDetails: 'Billing details',
      editorFields: ['Client name', 'Invoice number', 'Payment info'],
      magicBanner: 'Reuse template, keep branding, edit only what changed.',
      invoicePdf: 'Invoice PDF',
      brandForward: 'Brand-forward billing for service businesses',
      due: 'Due',
      billTo: 'Bill to',
      payment: 'Payment',
      paymentValue: 'Bank transfer\nQR available',
      items: ['Website design sprint', 'Invoice layout setup', 'Client revisions'],
      totalDue: 'Total due',
      pdfReady: 'PDF export ready',
    },
    'zh-CN': {
      title: '用 SmartBill 创建干净专业的发票，复用模板，并导出精致 PDF。',
      subtitle: 'SmartBill 适合自由职业者、承包商、工作室与小型企业。把 logo、客户资料、付款信息与明细集中在同一个顺手流程里。',
      primaryLoggedIn: '新建发票',
      primaryLoggedOut: '免费开始',
      secondary: '浏览模板',
      metric1Label: '使用场景',
      metric1Value: '发票 + 模板',
      metric2Label: '输出',
      metric2Value: '可分享 PDF',
      metric3Label: '流程',
      metric3Value: '草稿 → 编辑 → 导出',
      preview: 'SmartBill 预览',
      autosaved: '已自动保存',
      editor: '编辑器',
      billingDetails: '开票信息',
      editorFields: ['客户名称', '发票编号', '付款信息'],
      magicBanner: '复用模板，保留品牌元素，只修改真正变化的内容。',
      invoicePdf: '发票 PDF',
      brandForward: '面向服务型业务的品牌化计费',
      due: '到期日',
      billTo: '收件方',
      payment: '付款方式',
      paymentValue: '银行转账\n支持 QR',
      items: ['网站设计冲刺', '发票版式设置', '客户修改'],
      totalDue: '应付总额',
      pdfReady: 'PDF 可导出',
    },
    'zh-TW': {
      title: '用 SmartBill 建立乾淨專業的發票，重用模板，並匯出精緻 PDF。',
      subtitle: 'SmartBill 適合自由工作者、承包商、工作室與小型企業。把 logo、客戶資料、付款資訊與明細集中在同一個順手流程裡。',
      primaryLoggedIn: '建立新發票',
      primaryLoggedOut: '免費開始',
      secondary: '瀏覽模板',
      metric1Label: '使用場景',
      metric1Value: '發票 + 模板',
      metric2Label: '輸出',
      metric2Value: '可分享 PDF',
      metric3Label: '流程',
      metric3Value: '草稿 → 編輯 → 匯出',
      preview: 'SmartBill 預覽',
      autosaved: '已自動保存',
      editor: '編輯器',
      billingDetails: '開票資訊',
      editorFields: ['客戶名稱', '發票編號', '付款資訊'],
      magicBanner: '重用模板，保留品牌元素，只修改真正有變動的內容。',
      invoicePdf: '發票 PDF',
      brandForward: '面向服務型業務的品牌計費',
      due: '到期日',
      billTo: '收件方',
      payment: '付款方式',
      paymentValue: '銀行轉帳\n支援 QR',
      items: ['網站設計衝刺', '發票版式設定', '客戶修改'],
      totalDue: '應付總額',
      pdfReady: 'PDF 可匯出',
    },
    th: {
      title: 'สร้างใบแจ้งหนี้ที่สะอาดและเป็นมืออาชีพ ใช้เทมเพลตซ้ำ และส่งออก PDF ที่พร้อมใช้งานด้วย SmartBill',
      subtitle: 'SmartBill สร้างมาสำหรับฟรีแลนซ์ ผู้รับเหมา เอเจนซี และธุรกิจขนาดเล็กที่ต้องการออกบิลได้เร็วขึ้น เพิ่มโลโก้ ข้อมูลลูกค้า วิธีชำระเงิน และรายการสินค้าได้ในเวิร์กโฟลว์เดียว',
      primaryLoggedIn: 'สร้างใบแจ้งหนี้ใหม่',
      primaryLoggedOut: 'เริ่มใช้ฟรี',
      secondary: 'ดูเทมเพลต',
      metric1Label: 'การใช้งาน',
      metric1Value: 'ใบแจ้งหนี้ + เทมเพลต',
      metric2Label: 'ผลลัพธ์',
      metric2Value: 'PDF พร้อมแชร์',
      metric3Label: 'เวิร์กโฟลว์',
      metric3Value: 'ร่าง → แก้ไข → ส่งออก',
      preview: 'ตัวอย่าง SmartBill',
      autosaved: 'บันทึกอัตโนมัติแล้ว',
      editor: 'ตัวแก้ไข',
      billingDetails: 'รายละเอียดการเรียกเก็บเงิน',
      editorFields: ['ชื่อลูกค้า', 'เลขใบแจ้งหนี้', 'ข้อมูลการชำระเงิน'],
      magicBanner: 'ใช้เทมเพลตซ้ำ คงแบรนด์เดิม และแก้เฉพาะส่วนที่เปลี่ยน',
      invoicePdf: 'PDF ใบแจ้งหนี้',
      brandForward: 'การวางบิลที่คงเอกลักษณ์แบรนด์สำหรับธุรกิจบริการ',
      due: 'ครบกำหนด',
      billTo: 'เรียกเก็บเงินถึง',
      payment: 'การชำระเงิน',
      paymentValue: 'โอนผ่านธนาคาร\nมี QR',
      items: ['งานออกแบบเว็บไซต์', 'ตั้งค่าเลย์เอาต์ใบแจ้งหนี้', 'แก้ไขตามลูกค้า'],
      totalDue: 'ยอดคงชำระ',
      pdfReady: 'พร้อมส่งออก PDF',
    },
    id: {
      title: 'Buat invoice yang rapi, gunakan ulang template, dan ekspor PDF profesional dengan SmartBill.',
      subtitle: 'SmartBill dibuat untuk freelancer, kontraktor, agensi, dan bisnis kecil yang membutuhkan penagihan lebih cepat. Tambahkan logo, detail klien, instruksi pembayaran, dan item tagihan dalam satu alur kerja yang fokus.',
      primaryLoggedIn: 'Buat invoice baru',
      primaryLoggedOut: 'Mulai gratis',
      secondary: 'Lihat template',
      metric1Label: 'Penggunaan',
      metric1Value: 'Invoice + template',
      metric2Label: 'Output',
      metric2Value: 'PDF siap dibagikan',
      metric3Label: 'Alur kerja',
      metric3Value: 'Draf → edit → ekspor',
      preview: 'Pratinjau SmartBill',
      autosaved: 'Tersimpan otomatis',
      editor: 'Editor',
      billingDetails: 'Detail penagihan',
      editorFields: ['Nama klien', 'Nomor invoice', 'Info pembayaran'],
      magicBanner: 'Gunakan ulang template, pertahankan branding, dan edit hanya yang berubah.',
      invoicePdf: 'PDF Invoice',
      brandForward: 'Penagihan beridentitas merek untuk bisnis jasa',
      due: 'Jatuh tempo',
      billTo: 'Tagihkan kepada',
      payment: 'Pembayaran',
      paymentValue: 'Transfer bank\nQR tersedia',
      items: ['Sprint desain situs web', 'Penyiapan tata letak invoice', 'Revisi klien'],
      totalDue: 'Total jatuh tempo',
      pdfReady: 'PDF siap diekspor',
    },
  };
  const copy = copyByLang[lang];

  function handleCTA() {
    openProtectedRoute('/invoices/new');
  }

  return (
    <section className="relative overflow-hidden bg-white" data-purpose="hero">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_top_left,rgba(219,234,254,0.9),transparent_28%),radial-gradient(circle_at_center,rgba(125,211,252,0.12),transparent_40%)]" />
      <div className="grid gap-12 px-4 pb-10 pt-2 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-24 lg:pt-16 2xl:px-14">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleCTA}
              disabled={isGoogleLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70 shadow-[0_18px_35px_-24px_rgba(37,99,235,0.5)]"
            >
              <i className={`fas ${isGoogleLoading ? 'fa-circle-notch fa-spin' : 'fa-plus'}`}></i>
              {isLoggedIn ? copy.primaryLoggedIn : copy.primaryLoggedOut}
            </button>
            <button
              onClick={() => openProtectedRoute('/templates')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <i className="fas fa-layer-group"></i>
              {copy.secondary}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label={copy.metric1Label} value={copy.metric1Value} />
            <MetricCard label={copy.metric2Label} value={copy.metric2Value} />
            <MetricCard label={copy.metric3Label} value={copy.metric3Value} />
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-white p-4 shadow-[0_28px_90px_-46px_rgba(37,99,235,0.2)] sm:p-6">
            <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">{copy.preview}</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">Invoice #INV-2048</div>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{copy.autosaved}</div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[28px] border border-blue-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">{copy.editor}</div>
                    <div className="mt-1 text-base font-semibold text-slate-900">{copy.billingDetails}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {copy.editorFields.map((label, index) => (
                    <div key={label} className="rounded-2xl bg-blue-50 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-500">{label}</div>
                      <div className="mt-2 h-2.5 rounded-full bg-blue-200" style={{ width: `${88 - index * 10}%` }} />
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-wand-magic-sparkles"></i>
                    {copy.magicBanner}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(145deg,#1d4ed8_0%,#3b82f6_54%,#93c5fd_100%)] p-5 text-white shadow-[0_28px_56px_-34px_rgba(37,99,235,0.46)]">
                <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">{copy.invoicePdf}</div>
                    <div className="mt-2 text-2xl font-semibold">SmartBill Studio</div>
                    <div className="mt-1 text-sm text-white/80">{copy.brandForward}</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">{copy.due}</div>
                    <div className="mt-1 text-sm font-semibold">2026-03-24</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">{copy.billTo}</div>
                    <div className="mt-2 font-semibold leading-6">Acme Creative Ltd.<br />finance@acme.co</div>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">{copy.payment}</div>
                    <div className="mt-2 whitespace-pre-line font-semibold leading-6">{copy.paymentValue}</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {copy.items.map((item, index) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-white/12 px-4 py-3 text-sm backdrop-blur-sm">
                      <span className="font-medium text-white/90">{item}</span>
                      <span className="font-semibold">{index === 0 ? '$1,600' : index === 1 ? '$480' : '$220'}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/18 px-4 py-4 backdrop-blur-sm">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">{copy.totalDue}</div>
                    <div className="mt-1 text-3xl font-semibold">$2,300</div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-700">{copy.pdfReady}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

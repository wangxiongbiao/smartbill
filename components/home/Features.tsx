'use client';

import React from 'react';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';
import type { Language } from '@/types';

export function Features() {
  const { lang } = useMarketingLanguage();

  const copyByLang: Record<Language, {
    badge1: string;
    title1: string;
    desc1: string;
    list1: string[];
    paymentBlock: string;
    paymentTitle: string;
    ready: string;
    bankTransfer: string;
    qrPayment: string;
    notes: string;
    badge2: string;
    title2: string;
    desc2: string;
    workflow: string;
    reuseTitle: string;
    livePreview: string;
    branding: string;
    lineItems: string;
    paymentInfo: string;
    editor: string;
    editorTitle: string;
    editorRows: string[];
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
  }> = {
    en: {
      badge1: 'Payment-ready invoices',
      title1: 'Put payment details, notes, and client context into one clean invoice.',
      desc1: 'SmartBill helps you avoid back-and-forth. Add bank details, payment QR images, billing notes, and custom fields directly inside the invoice your client receives.',
      list1: [
        'Keep transfer details inside the same document',
        'Attach QR screenshots and custom payment fields',
        'Reduce payment friction with clearer invoice context',
      ],
      paymentBlock: 'Payment block',
      paymentTitle: 'Everything a client needs to pay',
      ready: 'Ready',
      bankTransfer: 'Bank transfer',
      qrPayment: 'QR payment',
      notes: 'Notes: Please include invoice number in your transfer memo for faster reconciliation.',
      badge2: 'Reusable templates',
      title2: 'Build once, reuse often, and keep every invoice on brand.',
      desc2: 'Save working invoice setups as templates, create new drafts from them, and edit with a live preview. This is especially useful when you bill similar services every week.',
      workflow: 'Template workflow',
      reuseTitle: 'Reuse your invoice structure',
      livePreview: 'Live preview',
      branding: 'Branding',
      lineItems: 'Line items',
      paymentInfo: 'Payment info',
      editor: 'Editor',
      editorTitle: 'Change only what matters',
      editorRows: ['Client details', 'Dates and totals', 'Notes and delivery'],
      card1Title: 'Structured editor',
      card1Desc: 'Update sender, client, line items, taxes, notes, and payment sections in one place.',
      card2Title: 'Instant preview',
      card2Desc: 'See the invoice layout and totals as you edit so you catch mistakes early.',
    },
    'zh-CN': {
      badge1: '可直接收款的发票',
      title1: '把付款信息、备注与客户背景整合进同一份清楚的发票。',
      desc1: 'SmartBill 帮你减少来回确认。银行资料、付款 QR 图、开票备注与自定义字段，都能直接放进客户实际收到的发票中。',
      list1: [
        '把转账信息保留在同一份文档内',
        '附上 QR 截图与自定义付款字段',
        '让付款信息更清楚，降低收款阻力',
      ],
      paymentBlock: '付款区块',
      paymentTitle: '客户付款需要的信息都在这里',
      ready: '已就绪',
      bankTransfer: '银行转账',
      qrPayment: 'QR 付款',
      notes: '备注：请在转账附言中填写发票号码，方便更快完成对账。',
      badge2: '可重复使用的模板',
      title2: '建立一次，反复复用，让每张发票都保持品牌一致。',
      desc2: '把好用的发票设置存成模板，直接从模板开新单，并搭配实时预览编辑。如果你每周都在开类似服务单，这个流程会很省事。',
      workflow: '模板流程',
      reuseTitle: '复用你的发票结构',
      livePreview: '实时预览',
      branding: '品牌元素',
      lineItems: '明细项目',
      paymentInfo: '付款信息',
      editor: '编辑器',
      editorTitle: '只改真正需要变化的地方',
      editorRows: ['客户信息', '日期与总额', '备注与交付'],
      card1Title: '结构化编辑',
      card1Desc: '寄件人、客户、明细、税额、备注与付款区块都能集中调整。',
      card2Title: '实时预览',
      card2Desc: '编辑时同步看到版面与总额，能更早发现错误。',
    },
    'zh-TW': {
      badge1: '可直接收款的發票',
      title1: '把付款資訊、備註與客戶背景整合進同一份清楚的發票。',
      desc1: 'SmartBill 幫你減少來回確認。銀行資料、付款 QR 圖、開票備註與自訂欄位，都能直接放進客戶實際收到的發票中。',
      list1: [
        '把轉帳資訊保留在同一份文件內',
        '附上 QR 截圖與自訂付款欄位',
        '讓付款資訊更清楚，降低收款阻力',
      ],
      paymentBlock: '付款區塊',
      paymentTitle: '客戶付款需要的資訊都在這裡',
      ready: '已就緒',
      bankTransfer: '銀行轉帳',
      qrPayment: 'QR 付款',
      notes: '備註：請在轉帳附言中填寫發票號碼，方便更快完成對帳。',
      badge2: '可重複使用的模板',
      title2: '建立一次，反覆重用，讓每張發票都維持品牌一致。',
      desc2: '把好用的發票設定存成模板，直接從模板開新單，並搭配即時預覽編輯。若你每週都在開類似服務單，這個流程會很省事。',
      workflow: '模板流程',
      reuseTitle: '重用你的發票結構',
      livePreview: '即時預覽',
      branding: '品牌元素',
      lineItems: '明細項目',
      paymentInfo: '付款資訊',
      editor: '編輯器',
      editorTitle: '只改真正需要變動的地方',
      editorRows: ['客戶資訊', '日期與總額', '備註與交付'],
      card1Title: '結構化編輯',
      card1Desc: '寄件人、客戶、明細、稅額、備註與付款區塊都能集中調整。',
      card2Title: '即時預覽',
      card2Desc: '編輯時同步看到版面與總額，能更早發現錯誤。',
    },
    th: {
      badge1: 'ใบแจ้งหนี้ที่พร้อมรับชำระ',
      title1: 'ใส่รายละเอียดการชำระเงิน หมายเหตุ และบริบทของลูกค้าไว้ในใบแจ้งหนี้ที่ชัดเจนฉบับเดียว',
      desc1: 'SmartBill ช่วยลดการถามกลับไปมา เพิ่มรายละเอียดธนาคาร รูป QR การชำระเงิน หมายเหตุการเรียกเก็บเงิน และฟิลด์กำหนดเองลงในใบแจ้งหนี้ที่ลูกค้าได้รับโดยตรง',
      list1: [
        'เก็บรายละเอียดการโอนไว้ในเอกสารเดียวกัน',
        'แนบภาพ QR และฟิลด์การชำระเงินแบบกำหนดเอง',
        'ลดแรงเสียดทานในการรับเงินด้วยบริบทใบแจ้งหนี้ที่ชัดเจนขึ้น',
      ],
      paymentBlock: 'บล็อกการชำระเงิน',
      paymentTitle: 'ทุกอย่างที่ลูกค้าต้องใช้เพื่อชำระเงิน',
      ready: 'พร้อมแล้ว',
      bankTransfer: 'โอนผ่านธนาคาร',
      qrPayment: 'การชำระผ่าน QR',
      notes: 'หมายเหตุ: โปรดใส่เลขใบแจ้งหนี้ในบันทึกการโอนเพื่อให้กระทบยอดได้เร็วขึ้น',
      badge2: 'เทมเพลตใช้ซ้ำได้',
      title2: 'สร้างครั้งเดียว ใช้ซ้ำได้บ่อย และทำให้ทุกใบแจ้งหนี้ยังคงภาพลักษณ์แบรนด์',
      desc2: 'บันทึกชุดใบแจ้งหนี้ที่ใช้งานได้ดีเป็นเทมเพลต สร้างฉบับใหม่จากเทมเพลตนั้น และแก้ไขพร้อมพรีวิวแบบสด สิ่งนี้มีประโยชน์มากเมื่อคุณออกบิลบริการคล้ายกันทุกสัปดาห์',
      workflow: 'เวิร์กโฟลว์เทมเพลต',
      reuseTitle: 'ใช้โครงสร้างใบแจ้งหนี้ของคุณซ้ำ',
      livePreview: 'พรีวิวสด',
      branding: 'แบรนด์',
      lineItems: 'รายการ',
      paymentInfo: 'ข้อมูลการชำระเงิน',
      editor: 'ตัวแก้ไข',
      editorTitle: 'เปลี่ยนเฉพาะส่วนที่สำคัญ',
      editorRows: ['รายละเอียดลูกค้า', 'วันที่และยอดรวม', 'หมายเหตุและการส่งมอบ'],
      card1Title: 'ตัวแก้ไขแบบมีโครงสร้าง',
      card1Desc: 'อัปเดตผู้ส่ง ลูกค้า รายการ ภาษี หมายเหตุ และส่วนการชำระเงินได้ในที่เดียว',
      card2Title: 'พรีวิวทันที',
      card2Desc: 'ดูเลย์เอาต์และยอดรวมของใบแจ้งหนี้ระหว่างแก้ไขเพื่อจับข้อผิดพลาดได้เร็วขึ้น',
    },
    id: {
      badge1: 'Invoice siap dibayar',
      title1: 'Masukkan detail pembayaran, catatan, dan konteks klien ke dalam satu invoice yang rapi.',
      desc1: 'SmartBill membantu Anda mengurangi bolak-balik. Tambahkan detail bank, gambar QR pembayaran, catatan penagihan, dan field khusus langsung ke invoice yang diterima klien.',
      list1: [
        'Simpan detail transfer di dokumen yang sama',
        'Lampirkan tangkapan layar QR dan field pembayaran kustom',
        'Kurangi hambatan pembayaran dengan konteks invoice yang lebih jelas',
      ],
      paymentBlock: 'Bagian pembayaran',
      paymentTitle: 'Semua yang dibutuhkan klien untuk membayar',
      ready: 'Siap',
      bankTransfer: 'Transfer bank',
      qrPayment: 'Pembayaran QR',
      notes: 'Catatan: Mohon sertakan nomor invoice pada catatan transfer untuk rekonsiliasi yang lebih cepat.',
      badge2: 'Template yang dapat dipakai ulang',
      title2: 'Bangun sekali, gunakan berulang, dan jaga setiap invoice tetap sesuai brand.',
      desc2: 'Simpan susunan invoice yang sudah bagus sebagai template, buat draf baru dari sana, dan edit dengan pratinjau langsung. Ini sangat berguna bila Anda menagih layanan serupa setiap minggu.',
      workflow: 'Alur template',
      reuseTitle: 'Gunakan ulang struktur invoice Anda',
      livePreview: 'Pratinjau langsung',
      branding: 'Branding',
      lineItems: 'Item baris',
      paymentInfo: 'Info pembayaran',
      editor: 'Editor',
      editorTitle: 'Ubah hanya yang penting',
      editorRows: ['Detail klien', 'Tanggal dan total', 'Catatan dan pengiriman'],
      card1Title: 'Editor terstruktur',
      card1Desc: 'Perbarui pengirim, klien, item, pajak, catatan, dan bagian pembayaran di satu tempat.',
      card2Title: 'Pratinjau instan',
      card2Desc: 'Lihat tata letak invoice dan total saat mengedit sehingga Anda bisa menemukan kesalahan lebih cepat.',
    },
  };
  const copy = copyByLang[lang];

  return (
    <section id="features" className="bg-white py-14 md:py-20" data-purpose="feature-sections">
      <div className="space-y-20 px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid items-center gap-12 xl:grid-cols-[1fr_0.96fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
              <i className="fas fa-credit-card"></i>
              {copy.badge1}
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              {copy.title1}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              {copy.desc1}
            </p>
            <ul className="mt-6 space-y-4">
              {copy.list1.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <i className="fas fa-check text-xs"></i>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
            <div className="overflow-hidden rounded-[24px] border border-blue-100 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.paymentBlock}</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">{copy.paymentTitle}</div>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{copy.ready}</div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">{copy.bankTransfer}</div>
                  <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
                    <div className="rounded-xl bg-white px-3 py-2">Bank: DBS Business</div>
                    <div className="rounded-xl bg-white px-3 py-2">Account: SmartBill Studio</div>
                    <div className="rounded-xl bg-white px-3 py-2">Ref: INV-2048</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">{copy.qrPayment}</div>
                  <div className="mt-3 grid h-28 place-items-center rounded-2xl bg-[linear-gradient(145deg,#2563eb_0%,#60a5fa_100%)] text-white">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span
                          key={index}
                          className={`h-3 w-3 rounded-[2px] ${index % 2 === 0 || index % 7 === 0 ? 'bg-white' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                  {copy.notes}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-12 xl:grid-cols-[0.96fr_1fr]">
          <div className="order-2 lg:order-1 rounded-[28px] border border-blue-200 bg-[linear-gradient(145deg,#1d4ed8_0%,#3b82f6_58%,#93c5fd_100%)] p-5 text-white shadow-[0_24px_60px_-38px_rgba(37,99,235,0.45)]">
            <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">{copy.workflow}</div>
                  <div className="mt-1 text-lg font-semibold">{copy.reuseTitle}</div>
                </div>
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{copy.livePreview}</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[copy.branding, copy.lineItems, copy.paymentInfo].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/12 px-4 py-5 text-center text-sm font-semibold text-white/95">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">{copy.editor}</div>
                    <div className="mt-1 text-base font-semibold">{copy.editorTitle}</div>
                  </div>
                  <i className="fas fa-pen-to-square text-blue-300"></i>
                </div>
                <div className="mt-4 space-y-3">
                  {copy.editorRows.map((row, index) => (
                    <div key={row} className="rounded-xl bg-blue-50 px-3 py-3">
                      <div className="text-sm font-semibold text-slate-700">{row}</div>
                      <div className="mt-2 h-2 rounded-full bg-blue-200" style={{ width: `${90 - index * 15}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
              <i className="fas fa-layer-group"></i>
              {copy.badge2}
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              {copy.title2}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              {copy.desc2}
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: copy.card1Title,
                  desc: copy.card1Desc,
                  icon: 'fa-pen-ruler',
                },
                {
                  title: copy.card2Title,
                  desc: copy.card2Desc,
                  icon: 'fa-eye',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

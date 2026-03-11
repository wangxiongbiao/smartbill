import React from 'react';
import type { InvoiceDetailsSectionProps } from './shared';

export default function InvoiceDetailsSection({ invoice, lang, t, onChange, dateInputRef, dueDateInputRef }: InvoiceDetailsSectionProps) {
  const copy = lang === 'zh-TW'
    ? {
        documentType: t.documentType || '單據類型',
        currencies: {
          asia: '亞洲 Asia',
          sea: '東南亞 Southeast Asia',
          na: '北美洲 North America',
          eu: '歐洲 Europe',
          oceania: '大洋洲 Oceania',
        },
      }
    : {
        documentType: t.documentType || 'Document Type',
        currencies: {
          asia: 'Asia',
          sea: 'Southeast Asia',
          na: 'North America',
          eu: 'Europe',
          oceania: 'Oceania',
        },
      };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 tracking-widest px-1">{copy.documentType}</label>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl h-[52px]">
            {(['invoice', 'receipt'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ type })}
                className={`flex-1 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${invoice.type === type ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="mr-2">
                  <i className={`fas ${type === 'invoice' ? 'fa-file-invoice' : 'fa-receipt'} text-sm`}></i>
                </span>
                {type === 'invoice' ? t.invoiceMode : t.receiptMode}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 tracking-widest px-1">
            {invoice.type === 'invoice' ? t.invNo : t.recNo}
          </label>
          <div className="relative">
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => onChange({ invoiceNumber: e.target.value })}
              className={`w-full px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[52px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-mono font-medium ${invoice.visibility?.invoiceNumber === false ? 'opacity-50' : ''}`}
            />
            <button
              type="button"
              onClick={() => onChange({ visibility: { ...invoice.visibility, invoiceNumber: !invoice.visibility?.invoiceNumber } })}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${invoice.visibility?.invoiceNumber === false ? 'text-red-400' : 'text-slate-400 hover:text-blue-500'}`}
              title={t.visibility}
            >
              <i className={`fas fa-eye${invoice.visibility?.invoiceNumber === false ? '-slash' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest px-1">
            <input
              type="checkbox"
              checked={invoice.visibility?.date !== false}
              onChange={() => onChange({ visibility: { ...invoice.visibility, date: !invoice.visibility?.date } })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
            />
            {invoice.customStrings?.dateLabel ?? t.invoiceDate}
          </label>
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[48px] text-sm font-medium hover:border-blue-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white"
          >
            <i className="fas fa-calendar-alt text-slate-400"></i>
            <span>{invoice.date}</span>
          </button>
          <input ref={dateInputRef} type="date" value={invoice.date} onChange={(e) => onChange({ date: e.target.value })} className="sr-only" />
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest px-1">
            <input
              type="checkbox"
              checked={invoice.visibility?.dueDate !== false}
              onChange={() => onChange({ visibility: { ...invoice.visibility, dueDate: !invoice.visibility?.dueDate } })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
            />
            {invoice.customStrings?.dueDateLabel ?? t.dueDate}
          </label>
          <button
            type="button"
            onClick={() => dueDateInputRef.current?.showPicker()}
            className="flex items-center gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[48px] text-sm font-medium hover:border-blue-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white"
          >
            <i className="fas fa-calendar-alt text-slate-400"></i>
            <span>{invoice.dueDate}</span>
          </button>
          <input ref={dueDateInputRef} type="date" value={invoice.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} className="sr-only" />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 tracking-widest px-1">{t.currency}</label>
          <select value={invoice.currency} onChange={(e) => onChange({ currency: e.target.value })} className="w-full px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[48px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all">
            <optgroup label={copy.currencies.asia}><option value="CNY">🇨🇳 CNY ¥ China</option><option value="JPY">🇯🇵 JPY ¥ Japan</option><option value="HKD">🇭🇰 HKD $ Hong Kong</option><option value="TWD">🇹🇼 TWD $ Taiwan</option><option value="KRW">🇰🇷 KRW ₩ Korea</option></optgroup>
            <optgroup label={copy.currencies.sea}><option value="SGD">🇸🇬 SGD $ Singapore</option><option value="MYR">🇲🇾 MYR RM Malaysia</option><option value="THB">🇹🇭 THB ฿ Thailand</option><option value="PHP">🇵🇭 PHP ₱ Philippines</option><option value="VND">🇻🇳 VND ₫ Vietnam</option><option value="IDR">🇮🇩 IDR Rp Indonesia</option></optgroup>
            <optgroup label={copy.currencies.na}><option value="USD">🇺🇸 USD $ United States</option></optgroup>
            <optgroup label={copy.currencies.eu}><option value="EUR">🇪🇺 EUR € Europe</option><option value="GBP">🇬🇧 GBP £ United Kingdom</option></optgroup>
            <optgroup label={copy.currencies.oceania}><option value="AUD">🇦🇺 AUD $ Australia</option><option value="NZD">🇳🇿 NZD $ New Zealand</option></optgroup>
          </select>
        </div>
      </div>
    </div>
  );
}

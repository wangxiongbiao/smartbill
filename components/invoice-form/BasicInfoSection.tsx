import React from 'react';
import type { CustomField } from '@/types';
import type { BasicInfoSectionProps } from './shared';
import { upsertCustomField } from './shared';

export default function BasicInfoSection({ invoice, lang, t, onChange, dateInputRef, dueDateInputRef, isUploadingLogo, onOpenLogoPicker, onRemoveLogo }: BasicInfoSectionProps) {
  return (
    <>
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {(['invoice', 'receipt'] as const).map((type) => (
          <button key={type} onClick={() => onChange({ type })} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${invoice.type === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {type === 'invoice' ? t.invoiceMode : t.receiptMode}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.invoiceMode.replace('Mode', 'Title') || 'Document Title'}</label>
        <div className="relative">
          <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder={invoice.type === 'invoice' ? (t.invoiceMode?.split(' ')[0] || 'INVOICE') : (t.receiptMode?.split(' ')[0] || 'RECEIPT')} value={invoice.customStrings?.invoiceTitle ?? ''} onChange={(e) => onChange({ customStrings: { ...invoice.customStrings, invoiceTitle: e.target.value } })} />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><i className="fas fa-pen text-xs"></i></div>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 relative group">
          <div className="flex justify-between items-center"><label className="text-sm font-semibold text-slate-700">{invoice.type === 'invoice' ? t.invNo : t.recNo}</label><button onClick={() => onChange({ visibility: { ...invoice.visibility, invoiceNumber: !invoice.visibility?.invoiceNumber } })} className={`text-xs ${invoice.visibility?.invoiceNumber === false ? 'text-red-400' : 'text-slate-400 hover:text-blue-500'}`} title={t.visibility}><i className={`fas fa-eye${invoice.visibility?.invoiceNumber === false ? '-slash' : ''}`}></i></button></div>
          <input type="text" value={invoice.invoiceNumber} onChange={(e) => onChange({ invoiceNumber: e.target.value })} className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 ${invoice.visibility?.invoiceNumber === false ? 'opacity-50' : ''}`} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{t.currency}</label>
          <select value={invoice.currency} onChange={(e) => onChange({ currency: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <optgroup label="亚洲 Asia"><option value="CNY">🇨🇳 CNY ¥ 中国</option><option value="JPY">🇯🇵 JPY ¥ 日本</option><option value="HKD">🇭🇰 HKD $ 中国香港</option><option value="TWD">🇹🇼 TWD $ 中国台灣</option><option value="KRW">🇰🇷 KRW ₩ 한국</option></optgroup>
            <optgroup label="东南亚 Southeast Asia"><option value="SGD">🇸🇬 SGD $ Singapore</option><option value="MYR">🇲🇾 MYR RM Malaysia</option><option value="THB">🇹🇭 THB ฿ ประเทศไทย</option><option value="PHP">🇵🇭 PHP ₱ Pilipinas</option><option value="VND">🇻🇳 VND ₫ Việt Nam</option><option value="IDR">🇮🇩 IDR Rp Indonesia</option></optgroup>
            <optgroup label="北美洲 North America"><option value="USD">🇺🇸 USD $ United States</option></optgroup>
            <optgroup label="欧洲 Europe"><option value="EUR">🇪🇺 EUR € Europe</option><option value="GBP">🇬🇧 GBP £ United Kingdom</option></optgroup>
            <optgroup label="大洋洲 Oceania"><option value="AUD">🇦🇺 AUD $ Australia</option><option value="NZD">🇳🇿 NZD $ New Zealand</option></optgroup>
          </select>
        </div>

        <div className="col-span-full flex flex-wrap gap-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none"><input type="checkbox" checked={invoice.visibility?.date !== false} onChange={() => onChange({ visibility: { ...invoice.visibility, date: !invoice.visibility?.date } })} className="rounded text-blue-600 focus:ring-blue-500" /><input type="text" className="font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full min-w-[60px]" value={invoice.customStrings?.dateLabel ?? t.invoiceDate} onChange={(e) => onChange({ customStrings: { ...invoice.customStrings, dateLabel: e.target.value } })} onClick={(e) => e.stopPropagation()} /></label><div className="relative flex items-center"><button onClick={() => dateInputRef.current?.showPicker()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"><i className="fas fa-calendar-alt text-slate-400"></i><span>{invoice.date}</span></button><input ref={dateInputRef} type="date" value={invoice.date} onChange={(e) => onChange({ date: e.target.value })} className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0" /></div></div>
          <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none"><input type="checkbox" checked={invoice.visibility?.dueDate !== false} onChange={() => onChange({ visibility: { ...invoice.visibility, dueDate: !invoice.visibility?.dueDate } })} className="rounded text-blue-600 focus:ring-blue-500" /><input type="text" className="font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full min-w-[60px]" value={invoice.customStrings?.dueDateLabel ?? t.dueDate} onChange={(e) => onChange({ customStrings: { ...invoice.customStrings, dueDateLabel: e.target.value } })} onClick={(e) => e.stopPropagation()} /></label><div className="relative flex items-center"><button onClick={() => dueDateInputRef.current?.showPicker()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"><i className="fas fa-calendar-alt text-slate-400"></i><span>{invoice.dueDate}</span></button><input ref={dueDateInputRef} type="date" value={invoice.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0" /></div></div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-t border-slate-100">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.billFrom}</h3>
          {isUploadingLogo ? <div className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50"><div className="flex flex-col items-center gap-2 text-blue-600"><i className="fas fa-circle-notch fa-spin text-2xl"></i><span className="text-xs font-medium">{t.uploadingImage}</span></div></div> : !invoice.sender.logo ? <button onClick={onOpenLogoPicker} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"><div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600"><i className="fas fa-image text-2xl"></i><span className="text-xs font-medium">{t.logoUp}</span></div></button> : <div className="relative group"><div className="w-full flex justify-center items-center border-2 border-slate-200 h-[140px] rounded-lg bg-slate-50"><img src={invoice.sender.logo} alt="Logo" className="w-full h-24 object-contain" /></div><div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"><button onClick={onOpenLogoPicker} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"><i className="fas fa-sync-alt mr-1"></i>{t.logoUp?.replace('上傳', '更換').replace('Upload', 'Change') || 'Change'}</button><button onClick={onRemoveLogo} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"><i className="fas fa-trash mr-1"></i>{t.removeLogo?.split(' ')[0] || 'Remove'}</button></div></div>}
          <input placeholder={t.namePlaceholder} value={invoice.sender.name} onChange={(e) => onChange({ sender: { ...invoice.sender, name: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
          <textarea placeholder={t.addrPlaceholder} value={invoice.sender.address} onChange={(e) => onChange({ sender: { ...invoice.sender, address: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none" />
          <input placeholder="Phone (Optional)" value={invoice.sender.phone || ''} onChange={(e) => onChange({ sender: { ...invoice.sender, phone: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
          <input placeholder="Email (Optional)" value={invoice.sender.email || ''} onChange={(e) => onChange({ sender: { ...invoice.sender, email: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
          <div className="space-y-2 mt-2">{invoice.sender.customFields?.map((field, index) => <div key={field.id} className="space-y-2 relative"><div className="flex gap-2 items-center"><input placeholder={t.fieldName} value={field.label} onChange={(e) => onChange({ sender: { ...invoice.sender, customFields: upsertCustomField(invoice.sender.customFields, index, { ...field, label: e.target.value }) } })} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" /><button onClick={() => onChange({ sender: { ...invoice.sender, customFields: invoice.sender.customFields?.filter(f => f.id !== field.id) } })} className="text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button></div><textarea placeholder={t.fieldValue} value={field.value} onChange={(e) => onChange({ sender: { ...invoice.sender, customFields: upsertCustomField(invoice.sender.customFields, index, { ...field, value: e.target.value }) } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none" /></div>)}<button onClick={() => { const newField: CustomField = { id: `field-${Date.now()}`, label: '', value: '' }; onChange({ sender: { ...invoice.sender, customFields: [...(invoice.sender.customFields || []), newField] } }); }} className="text-sm text-blue-600 font-medium hover:underline">+ {t.addCustomField}</button></div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.billTo}</h3>
          <input placeholder={t.clientName} value={invoice.client.name} onChange={(e) => onChange({ client: { ...invoice.client, name: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
          <textarea placeholder={t.clientAddr} value={invoice.client.address} onChange={(e) => onChange({ client: { ...invoice.client, address: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none" />
          <input placeholder="Phone (Optional)" value={invoice.client.phone || ''} onChange={(e) => onChange({ client: { ...invoice.client, phone: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
          <input placeholder="Email (Optional)" value={invoice.client.email || ''} onChange={(e) => onChange({ client: { ...invoice.client, email: e.target.value } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
          <div className="space-y-2 mt-2">{invoice.client.customFields?.map((field, index) => <div key={field.id} className="space-y-2 relative"><div className="flex gap-2 items-center"><input placeholder={t.fieldName} value={field.label} onChange={(e) => onChange({ client: { ...invoice.client, customFields: upsertCustomField(invoice.client.customFields, index, { ...field, label: e.target.value }) } })} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" /><button onClick={() => onChange({ client: { ...invoice.client, customFields: invoice.client.customFields?.filter(f => f.id !== field.id) } })} className="text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button></div><textarea placeholder={t.fieldValue} value={field.value} onChange={(e) => onChange({ client: { ...invoice.client, customFields: upsertCustomField(invoice.client.customFields, index, { ...field, value: e.target.value }) } })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none" /></div>)}<button onClick={() => { const newField: CustomField = { id: `field-${Date.now()}`, label: '', value: '' }; onChange({ client: { ...invoice.client, customFields: [...(invoice.client.customFields || []), newField] } }); }} className="text-sm text-blue-600 font-medium hover:underline">+ {t.addCustomField}</button></div>
        </div>
      </section>
    </>
  );
}

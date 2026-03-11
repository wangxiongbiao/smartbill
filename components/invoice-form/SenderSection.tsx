import React from 'react';
import type { CustomField } from '@/types';
import type { SenderSectionProps } from './shared';
import { upsertCustomField } from './shared';
import BillingProfileNameInput from './BillingProfileNameInput';

export default function SenderSection({
  invoice,
  lang,
  t,
  onChange,
  isUploadingLogo,
  onOpenLogoPicker,
  onRemoveLogo,
  profiles,
  profilesLoading,
  onApplyProfile,
}: SenderSectionProps) {
  const copy = {
    phoneOptional: t.phonePlaceholder || 'Phone (Optional)',
    emailOptional: t.emailPlaceholder || 'Email (Optional)',
    changeLogo: t.logoUp?.replace('上傳', '更換').replace('Upload', 'Change') || 'Change',
    remove: t.removeLogo?.split(' ')[0] || 'Remove',
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.billFrom}</h3>
      </div>
      {isUploadingLogo ? <div className="w-full p-4 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50"><div className="flex flex-col items-center gap-2 text-blue-600"><i className="fas fa-circle-notch fa-spin text-2xl"></i><span className="text-xs font-medium">{t.uploadingImage}</span></div></div> : !invoice.sender.logo ? <button type="button" onClick={onOpenLogoPicker} className="w-full p-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"><div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600"><i className="fas fa-image text-2xl"></i><span className="text-xs font-medium">{t.logoUp}</span></div></button> : <div className="relative group"><div className="w-full flex justify-center items-center border-2 border-slate-200 h-[140px] rounded-2xl bg-slate-50"><img src={invoice.sender.logo} alt="Logo" className="w-full h-24 object-contain" /></div><div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-2xl transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"><button type="button" onClick={onOpenLogoPicker} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"><i className="fas fa-sync-alt mr-1"></i>{copy.changeLogo}</button><button type="button" onClick={onRemoveLogo} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"><i className="fas fa-trash mr-1"></i>{copy.remove}</button></div></div>}
      <BillingProfileNameInput
        kind="sender"
        lang={lang}
        value={invoice.sender.name}
        placeholder={t.namePlaceholder}
        profiles={profiles}
        isLoading={profilesLoading}
        onChange={(value) => onChange({ sender: { ...invoice.sender, name: value } })}
        onSelect={onApplyProfile}
      />
      <textarea placeholder={t.addrPlaceholder} value={invoice.sender.address} onChange={(e) => onChange({ sender: { ...invoice.sender, address: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-sm resize-none" />
      <input placeholder={copy.phoneOptional} value={invoice.sender.phone || ''} onChange={(e) => onChange({ sender: { ...invoice.sender, phone: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
      <input placeholder={copy.emailOptional} value={invoice.sender.email || ''} onChange={(e) => onChange({ sender: { ...invoice.sender, email: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
      <div className="space-y-2 pt-2 border-t border-slate-100">{invoice.sender.customFields?.map((field, index) => <div key={field.id} className="space-y-2 relative"><div className="flex gap-2 items-center"><input placeholder={t.fieldName} value={field.label} onChange={(e) => onChange({ sender: { ...invoice.sender, customFields: upsertCustomField(invoice.sender.customFields, index, { ...field, label: e.target.value }) } })} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /><button onClick={() => onChange({ sender: { ...invoice.sender, customFields: invoice.sender.customFields?.filter(f => f.id !== field.id) } })} className="text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button></div><textarea placeholder={t.fieldValue} value={field.value} onChange={(e) => onChange({ sender: { ...invoice.sender, customFields: upsertCustomField(invoice.sender.customFields, index, { ...field, value: e.target.value }) } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-20 text-sm resize-none" /></div>)}<button onClick={() => { const newField: CustomField = { id: `field-${Date.now()}`, label: '', value: '' }; onChange({ sender: { ...invoice.sender, customFields: [...(invoice.sender.customFields || []), newField] } }); }} className="text-sm text-blue-600 font-medium hover:underline">+ {t.addCustomField}</button></div>
    </div>
  );
}

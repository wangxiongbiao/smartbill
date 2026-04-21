import React from 'react';
import type { CustomField } from '@/types';
import type { RecipientSectionProps } from './shared';
import { upsertCustomField } from './shared';
import BillingProfileNameInput from './BillingProfileNameInput';

export default function RecipientSection({
  invoice,
  lang,
  t,
  onChange,
  profiles,
  profilesLoading,
  onApplyProfile,
}: RecipientSectionProps) {
  const copy = {
    phoneOptional: t.phonePlaceholder || 'Phone (Optional)',
    emailOptional: t.emailPlaceholder || 'Email (Optional)',
  };

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.billTo}</h3>
      <BillingProfileNameInput
        kind="client"
        lang={lang}
        value={invoice.client.name}
        placeholder={t.clientName}
        profiles={profiles}
        isLoading={profilesLoading}
        onChange={(value) => onChange({ client: { ...invoice.client, name: value } })}
        onSelect={onApplyProfile}
      />
      <textarea placeholder={t.clientAddr} value={invoice.client.address} onChange={(e) => onChange({ client: { ...invoice.client, address: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-sm resize-none" />
      <input placeholder={copy.phoneOptional} value={invoice.client.phone || ''} onChange={(e) => onChange({ client: { ...invoice.client, phone: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
      <input placeholder={copy.emailOptional} value={invoice.client.email || ''} onChange={(e) => onChange({ client: { ...invoice.client, email: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
      <div className="space-y-2 pt-2 border-t border-slate-100">{invoice.client.customFields?.map((field, index) => <div key={field.id} className="space-y-2 relative"><div className="flex gap-2 items-center"><input placeholder={t.fieldName} value={field.label} onChange={(e) => onChange({ client: { ...invoice.client, customFields: upsertCustomField(invoice.client.customFields, index, { ...field, label: e.target.value }) } })} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /><button onClick={() => onChange({ client: { ...invoice.client, customFields: invoice.client.customFields?.filter(f => f.id !== field.id) } })} className="text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button></div><textarea placeholder={t.fieldValue} value={field.value} onChange={(e) => onChange({ client: { ...invoice.client, customFields: upsertCustomField(invoice.client.customFields, index, { ...field, value: e.target.value }) } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-20 text-sm resize-none" /></div>)}<button onClick={() => { const newField: CustomField = { id: `field-${Date.now()}`, label: '', value: '' }; onChange({ client: { ...invoice.client, customFields: [...(invoice.client.customFields || []), newField] } }); }} className="text-sm text-blue-600 font-medium hover:underline">+ {t.addCustomField}</button></div>
    </div>
  );
}

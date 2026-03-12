import React from 'react';
import type { DisclaimerSectionProps } from './shared';

export default function DisclaimerSection({ invoice, t, onChange }: DisclaimerSectionProps) {
  const copy = {
    title: t.disclaimerText || 'Disclaimer / Notice',
    placeholder: t.disclaimerPlaceholder || 'e.g., This is a computer generated document and no signature is required.',
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-3">
      <div className="flex justify-between items-center"><div className="flex items-center gap-2"><h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{copy.title}</h3><button type="button" onClick={() => onChange({ visibility: { ...invoice.visibility, disclaimer: invoice.visibility?.disclaimer === false } })} className={`text-xs ${invoice.visibility?.disclaimer !== false ? 'text-blue-600' : 'text-slate-300'}`} title={t.visibility}><i className={`fas fa-toggle-${invoice.visibility?.disclaimer !== false ? 'on' : 'off'} text-lg`}></i></button></div></div>
      {invoice.visibility?.disclaimer !== false && <textarea placeholder={copy.placeholder} value={invoice.sender.disclaimerText || ''} onChange={(e) => onChange({ sender: { ...invoice.sender, disclaimerText: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-sm resize-none" />}
    </div>
  );
}

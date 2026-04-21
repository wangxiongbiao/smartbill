import React from 'react';
import type { InvoiceSummarySectionProps } from './shared';
import { calculateInvoiceTotals } from '@/lib/invoice';

export default function InvoiceSummarySection({ invoice, lang, t, onChange }: InvoiceSummarySectionProps) {
  const { total } = calculateInvoiceTotals(invoice.items, invoice.taxRate);

  return (
    <section className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700">{t.taxRate}</span>
        <input type="number" className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-right text-sm" value={invoice.taxRate} onChange={(e) => onChange({ taxRate: Number(e.target.value) })} />
      </div>
      <div className="bg-blue-600 p-5 rounded-2xl text-white flex justify-between items-center shadow-[0_1rem_1.875rem_-1.25rem_rgba(37,99,235,0.52)]">
        <span className="font-semibold uppercase text-xs tracking-widest">{t.payable}</span>
        <span className="text-2xl font-semibold">{new Intl.NumberFormat(lang, { style: 'currency', currency: invoice.currency }).format(total)}</span>
      </div>
    </section>
  );
}

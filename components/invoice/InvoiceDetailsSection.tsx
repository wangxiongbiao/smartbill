'use client';

import React, { useRef } from 'react';
import { Invoice, DocumentType } from '@/types/invoice';
import { CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import CurrencySelector from './CurrencySelector';

interface InvoiceDetailsSectionProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
}

const InvoiceDetailsSection: React.FC<InvoiceDetailsSectionProps> = ({
    invoice,
    onChange
}) => {
    const dateInputRef = useRef<HTMLInputElement>(null);
    const dueDateInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Row 1: Document Type & Invoice No. */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Document Type Toggle */}
                <div className="space-y-3" style={{ gridColumn: 'span 2' }}>
                    <label className="text-xs font-bold text-slate-500 tracking-widest px-1">單據類型</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl h-[52px]">
                        {(['invoice', 'receipt'] as DocumentType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => onChange({ type })}
                                className={`flex-1 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${invoice.type === type
                                    ? 'bg-white text-blue-600 shadow-sm transform scale-[1.02]'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <span className="mr-2">{type === 'invoice' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}</span>
                                {type === 'invoice' ? '發票模式' : '收據模式'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invoice No. */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 tracking-widest px-1">
                        {invoice.type === 'invoice' ? '發票編號' : '收據編號'}
                    </label>
                    <input
                        type="text"
                        value={invoice.invoiceNumber}
                        onChange={(e) => onChange({ invoiceNumber: e.target.value })}
                        className="w-full px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[52px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-mono font-medium"
                    />
                </div>
            </div>

            {/* Row 2: Date, Due Date, Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date */}
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest px-1">
                        <input
                            type="checkbox"
                            checked={invoice.visibility?.date !== false}
                            onChange={() => onChange({ visibility: { ...invoice.visibility, date: !invoice.visibility?.date } })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        {invoice.visibility?.date !== false ? '開票日期' : '日期已隱藏'}
                    </label>
                    <button
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="flex items-center gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[48px] text-sm font-medium hover:border-blue-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white"
                    >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{invoice.date}</span>
                    </button>
                    <input ref={dateInputRef} type="date" value={invoice.date} onChange={(e) => onChange({ date: e.target.value })} className="sr-only" />
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest px-1">
                        <input
                            type="checkbox"
                            checked={invoice.visibility?.dueDate !== false}
                            onChange={() => onChange({ visibility: { ...invoice.visibility, dueDate: !invoice.visibility?.dueDate } })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        {invoice.visibility?.dueDate !== false ? '截止日期' : '截止日期已隱藏'}
                    </label>
                    <button
                        onClick={() => dueDateInputRef.current?.showPicker()}
                        className="flex items-center gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[48px] text-sm font-medium hover:border-blue-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white"
                    >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{invoice.dueDate}</span>
                    </button>
                    <input ref={dueDateInputRef} type="date" value={invoice.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} className="sr-only" />
                </div>

                {/* Currency */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 tracking-widest px-1">貨幣單位</label>
                    <CurrencySelector
                        value={invoice.currency}
                        onChange={(currency) => onChange({ currency })}
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsSection;

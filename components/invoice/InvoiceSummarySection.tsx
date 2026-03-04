'use client';

import React from 'react';
import { Invoice } from '@/types/invoice';

interface InvoiceSummarySectionProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
}

const InvoiceSummarySection: React.FC<InvoiceSummarySectionProps> = ({
    invoice,
    onChange
}) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0);
    const total = subtotal * (1 + invoice.taxRate / 100);

    return (
        <div className="mt-3 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 tracking-widest">小計</span>
                    <span className="font-black text-slate-600">
                        {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: invoice.currency }).format(subtotal)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 tracking-widest">稅率</span>
                    <div className="flex items-center gap-2">
                        <input
                            className="w-16 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-black text-sm text-blue-600"
                            value={invoice.taxRate}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d*$/.test(value)) {
                                    onChange({ taxRate: Number(value) })
                                }
                            }}
                        />
                        <span className="text-sm font-black text-slate-400">%</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200/50 flex justify-between items-baseline">
                    <span className="text-sm font-black text-blue-600 tracking-[0.2em]">應付總額</span>
                    <span className="text-3xl font-black text-blue-600 tracking-tighter">
                        {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: invoice.currency }).format(total)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSummarySection;

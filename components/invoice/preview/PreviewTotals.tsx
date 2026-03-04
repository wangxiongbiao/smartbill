import React from 'react';
import { Invoice } from '@/types/invoice';

interface PreviewTotalsProps {
    invoice: Invoice;
    subtotal: number;
    tax: number;
    total: number;
    currencyFormatter: Intl.NumberFormat;
}

const PreviewTotals: React.FC<PreviewTotalsProps> = ({
    invoice,
    subtotal,
    tax,
    total,
    currencyFormatter
}) => {
    return (
        <div className="w-72 space-y-2">
            <div className="flex justify-between items-center text-[13px] text-slate-500">
                <span className="font-bold">小計</span>
                <span className="font-black text-slate-900">{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] text-slate-500">
                <div className="flex items-center gap-1">
                    <span className="font-bold">稅率 (%) ({invoice.taxRate}%)</span>
                </div>
                <span className="font-black text-slate-900">{currencyFormatter.format(tax)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black text-slate-900 pt-4 border-t-2 border-slate-200">
                <span className="tracking-tight">應付總額</span>
                <span className="tracking-tighter">{currencyFormatter.format(total)}</span>
            </div>
        </div>
    );
};

export default PreviewTotals;

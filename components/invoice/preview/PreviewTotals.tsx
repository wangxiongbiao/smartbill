import React from 'react';
import { Invoice } from '@/types/invoice';
import { InvoiceTheme } from '@/lib/invoice-theme';

interface PreviewTotalsProps {
    invoice: Invoice;
    theme: InvoiceTheme;
    subtotal: number;
    tax: number;
    total: number;
    currencyFormatter: Intl.NumberFormat;
}

const PreviewTotals: React.FC<PreviewTotalsProps> = ({
    invoice,
    theme,
    subtotal,
    tax,
    total,
    currencyFormatter
}) => {
    return (
        <div className="w-72 space-y-2">
            <div className="flex items-center justify-between text-[13px]" style={{ color: theme.mutedColor }}>
                <span className="font-bold">小計</span>
                <span className="font-black" style={{ color: theme.textColor }}>{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]" style={{ color: theme.mutedColor }}>
                <div className="flex items-center gap-1">
                    <span className="font-bold">稅率 (%) ({invoice.taxRate}%)</span>
                </div>
                <span className="font-black" style={{ color: theme.textColor }}>{currencyFormatter.format(tax)}</span>
            </div>
            <div
                className={`flex items-center justify-between pt-4 text-2xl font-black ${theme.totalBandFill ? 'rounded-2xl px-4 py-4 pt-4' : 'border-t-2'}`}
                style={theme.totalBandFill ? { backgroundColor: theme.totalBandFill, color: theme.totalBandText } : { borderColor: theme.borderColor, color: theme.textColor }}
            >
                <span className="tracking-tight">應付總額</span>
                <span className="tracking-tighter">{currencyFormatter.format(total)}</span>
            </div>
        </div>
    );
};

export default PreviewTotals;

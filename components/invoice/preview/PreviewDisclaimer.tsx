import React from 'react';
import { Invoice } from '@/types/invoice';
import { InvoiceTheme } from '@/lib/invoice-theme';
import EditableText from './EditableText';

interface PreviewDisclaimerProps {
    invoice: Invoice;
    theme: InvoiceTheme;
    onChange?: (updates: Partial<Invoice>) => void;
}

const PreviewDisclaimer: React.FC<PreviewDisclaimerProps> = ({
    invoice,
    theme,
    onChange
}) => {
    if (invoice.visibility?.disclaimer === false || !invoice.sender.disclaimerText) return null;

    const handleSenderUpdate = (updates: any) => onChange?.({ sender: { ...invoice.sender, ...updates } });

    return (
        <div
            className="flex items-start justify-center gap-3 px-12 py-8 text-center"
            style={{ backgroundColor: theme.surfaceColor, color: theme.mutedColor }}
        >
            <div className="max-w-2xl w-full flex items-center justify-center gap-2">
                <span className="text-xl">🎓</span>
                <EditableText
                    value={invoice.sender.disclaimerText}
                    onChange={(val) => handleSenderUpdate({ disclaimerText: val })}
                    multiline
                    className="text-center text-[11px] font-bold leading-relaxed"
                />
            </div>
        </div>
    );
};

export default PreviewDisclaimer;

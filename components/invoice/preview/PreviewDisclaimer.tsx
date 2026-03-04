import React from 'react';
import { Invoice } from '@/types/invoice';
import EditableText from './EditableText';

interface PreviewDisclaimerProps {
    invoice: Invoice;
    onChange?: (updates: Partial<Invoice>) => void;
}

const PreviewDisclaimer: React.FC<PreviewDisclaimerProps> = ({
    invoice,
    onChange
}) => {
    if (invoice.visibility?.disclaimer === false || !invoice.sender.disclaimerText) return null;

    const handleSenderUpdate = (updates: any) => onChange?.({ sender: { ...invoice.sender, ...updates } });

    return (
        <div className="px-12 py-8 bg-slate-50/30 flex items-start gap-3 justify-center text-center">
            <div className="max-w-2xl w-full flex items-center justify-center gap-2">
                <span className="text-xl">🎓</span>
                <EditableText
                    value={invoice.sender.disclaimerText}
                    onChange={(val) => handleSenderUpdate({ disclaimerText: val })}
                    multiline
                    className="text-[11px] font-bold text-slate-400 leading-relaxed text-center"
                />
            </div>
        </div>
    );
};

export default PreviewDisclaimer;

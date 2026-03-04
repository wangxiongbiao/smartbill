import React from 'react';
import { Invoice } from '@/types/invoice';
import EditableText from './EditableText';

interface PreviewSignatureProps {
    invoice: Invoice;
    onChange?: (updates: Partial<Invoice>) => void;
}

const PreviewSignature: React.FC<PreviewSignatureProps> = ({
    invoice,
    onChange
}) => {
    if (invoice.visibility?.signature === false) return null;

    const handleSenderUpdate = (updates: any) => onChange?.({ sender: { ...invoice.sender, ...updates } });

    return (
        <div className="flex flex-col items-start gap-4">
            <div className="space-y-4">
                {invoice.sender.signature ? (
                    <div className="h-20 flex items-center">
                        <img src={invoice.sender.signature} alt="Signature" className="h-16 object-contain mix-blend-multiply" />
                    </div>
                ) : (
                    <div className="h-20" />
                )}
                <div className="w-56 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">授權簽名</p>
                    <div className="border-t border-slate-900 pt-2">
                        <EditableText
                            value={invoice.sender.name}
                            onChange={(val) => handleSenderUpdate({ name: val })}
                            className="text-xs font-black text-slate-900"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewSignature;

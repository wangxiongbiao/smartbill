import React from 'react';
import { Invoice } from '@/types/invoice';
import EditableText from './EditableText';

interface PreviewPaymentInfoProps {
    invoice: Invoice;
    onChange?: (updates: Partial<Invoice>) => void;
    onShowQRCodePicker?: () => void;
}

const PreviewPaymentInfo: React.FC<PreviewPaymentInfoProps> = ({
    invoice,
    onChange,
    onShowQRCodePicker
}) => {
    if (invoice.visibility?.paymentInfo === false) return null;

    return (
        <div className="mt-16 pt-8 border-t border-slate-100">
            <div className="flex justify-between items-start gap-12">
                <div className="grid grid-cols-1 gap-y-3 flex-1">
                    {invoice.paymentInfo?.fields
                        ?.filter(field => field.visible && field.value)
                        ?.sort((a, b) => a.order - b.order)
                        ?.map(field => (
                            <div key={field.id} className="flex gap-4 text-[13px]">
                                <span className="font-bold text-slate-400 min-w-[140px]">{field.label}:</span>
                                <div className="font-black text-slate-900 flex-1">
                                    <EditableText
                                        value={field.value}
                                        onChange={(val) => {
                                            const fields = invoice.paymentInfo?.fields?.map(f => f.id === field.id ? { ...f, value: val } : f);
                                            onChange?.({ paymentInfo: { ...invoice.paymentInfo!, fields: fields! } });
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    }
                </div>

                {invoice.paymentInfo?.qrCode && (
                    <div
                        className="w-32 h-32 shrink-0 bg-white cursor-pointer hover:border-blue-400 transition-all group relative"
                        onClick={onShowQRCodePicker}
                    >
                        <img src={invoice.paymentInfo.qrCode} alt="Payment QR Code" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewPaymentInfo;

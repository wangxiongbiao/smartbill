import React from 'react';
import { Invoice } from '@/types/invoice';
import { InvoiceTheme } from '@/lib/invoice-theme';
import EditableText from './EditableText';

interface PreviewPaymentInfoProps {
    invoice: Invoice;
    theme: InvoiceTheme;
    onChange?: (updates: Partial<Invoice>) => void;
    onShowQRCodePicker?: () => void;
}

const PreviewPaymentInfo: React.FC<PreviewPaymentInfoProps> = ({
    invoice,
    theme,
    onChange,
    onShowQRCodePicker
}) => {
    if (invoice.visibility?.paymentInfo === false) return null;

    return (
        <div className="mt-16 pt-8" style={{ borderTop: `1px solid ${theme.borderColor}` }}>
            <div className="flex justify-between items-start gap-12">
                <div className="grid grid-cols-1 gap-y-3 flex-1">
                    {invoice.paymentInfo?.fields
                        ?.filter(field => field.visible && field.value)
                        ?.sort((a, b) => a.order - b.order)
                        ?.map(field => (
                            <div key={field.id} className="flex gap-4 text-[13px]">
                                <span className="min-w-[140px] font-bold" style={{ color: theme.metaLabelColor }}>{field.label}:</span>
                                <div className="flex-1 font-black" style={{ color: theme.textColor }}>
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
                        className="group relative h-32 w-32 shrink-0 cursor-pointer overflow-hidden rounded-[1.5rem] bg-white transition-all"
                        style={{ border: `1px solid ${theme.borderColor}` }}
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

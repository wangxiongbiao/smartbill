import React from 'react';
import { Invoice } from '@/types/invoice';
import { MapPin, Phone, Mail } from 'lucide-react';
import EditableText from './EditableText';

interface PreviewHeaderProps {
    invoice: Invoice;
    onChange?: (updates: Partial<Invoice>) => void;
    onShowLogoPicker?: () => void;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({
    invoice,
    onChange,
    onShowLogoPicker
}) => {
    const docTitle = invoice.type === 'invoice' ? '發票' : '收據';
    const handleSenderUpdate = (updates: any) => onChange?.({ sender: { ...invoice.sender, ...updates } });

    return (
        <div className="px-12 pt-12 pb-8">
            <div className="flex justify-between items-start">
                <div className="flex gap-6 items-start">
                    {invoice.sender.logo && (
                        <div
                            className="w-24 h-24 bg-white cursor-pointer hover:border-blue-400 group relative transition-all"
                            onClick={onShowLogoPicker}
                        >
                            <img src={invoice.sender.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        </div>
                    )}
                    <div className="max-w-[280px]">
                        <h2 className="text-lg font-black text-slate-900 mb-2">
                            <EditableText
                                value={invoice.sender.name}
                                onChange={(val) => handleSenderUpdate({ name: val })}
                                placeholder="名稱"
                            />
                        </h2>
                        <div className="space-y-1">
                            <div className="text-[11px] font-medium text-slate-500 flex items-start gap-2 leading-tight">
                                <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                                <EditableText
                                    value={invoice.sender.address}
                                    onChange={(val) => handleSenderUpdate({ address: val })}
                                    multiline
                                />
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                <Phone className="w-3 h-3 shrink-0 text-slate-300" />
                                <EditableText
                                    value={invoice.sender.phone || ''}
                                    onChange={(val) => handleSenderUpdate({ phone: val })}
                                    placeholder="電話"
                                />
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                <Mail className="w-3 h-3 shrink-0 text-slate-300" />
                                <EditableText
                                    value={invoice.sender.email || ''}
                                    onChange={(val) => handleSenderUpdate({ email: val })}
                                    placeholder="電子郵箱"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <h1 className="text-4xl font-black mb-1 tracking-tighter text-slate-900">
                        <EditableText
                            value={invoice.customTitle || docTitle}
                            onChange={(val) => onChange?.({ customTitle: val })}
                        />
                    </h1>
                    <div className="flex items-center justify-end gap-1 text-base font-bold text-slate-400">
                        <span>#</span>
                        <EditableText
                            value={invoice.invoiceNumber}
                            onChange={(val) => onChange?.({ invoiceNumber: val })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewHeader;

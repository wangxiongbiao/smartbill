import React from 'react';
import { Invoice } from '@/types/invoice';
import { MapPin, Phone, Mail } from 'lucide-react';
import { InvoiceTheme } from '@/lib/invoice-theme';
import EditableText from './EditableText';

interface PreviewHeaderProps {
    invoice: Invoice;
    theme: InvoiceTheme;
    onChange?: (updates: Partial<Invoice>) => void;
    onShowLogoPicker?: () => void;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({
    invoice,
    theme,
    onChange,
    onShowLogoPicker
}) => {
    const docTitle = invoice.type === 'invoice' ? '發票' : '收據';
    const handleSenderUpdate = (updates: any) => onChange?.({ sender: { ...invoice.sender, ...updates } });
    const isSoftHeader = theme.headerPanelVariant === 'soft';
    const isDarkHeader = theme.headerPanelVariant === 'dark';

    return (
        <div
            className={`px-12 pt-12 pb-8 ${isSoftHeader ? 'rounded-b-[2rem]' : ''}`}
            style={isSoftHeader ? { backgroundColor: theme.headerPanelColor } : undefined}
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-6 items-start">
                    {invoice.sender.logo && (
                        <div
                            className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-2xl transition-all"
                            style={{ backgroundColor: '#ffffff', border: `1px solid ${theme.borderColor}` }}
                            onClick={onShowLogoPicker}
                        >
                            <img src={invoice.sender.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        </div>
                    )}
                    <div className="max-w-[280px]">
                        <h2 className="mb-2 text-lg font-black" style={{ color: theme.textColor }}>
                            <EditableText
                                value={invoice.sender.name}
                                onChange={(val) => handleSenderUpdate({ name: val })}
                                placeholder="名稱"
                            />
                        </h2>
                        <div className="space-y-1">
                            <div className="flex items-start gap-2 text-[11px] font-medium leading-tight" style={{ color: theme.mutedColor }}>
                                <MapPin className="mt-0.5 h-3 w-3 shrink-0" style={{ color: theme.borderColor }} />
                                <EditableText
                                    value={invoice.sender.address}
                                    onChange={(val) => handleSenderUpdate({ address: val })}
                                    multiline
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: theme.mutedColor }}>
                                <Phone className="h-3 w-3 shrink-0" style={{ color: theme.borderColor }} />
                                <EditableText
                                    value={invoice.sender.phone || ''}
                                    onChange={(val) => handleSenderUpdate({ phone: val })}
                                    placeholder="電話"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: theme.mutedColor }}>
                                <Mail className="h-3 w-3 shrink-0" style={{ color: theme.borderColor }} />
                                <EditableText
                                    value={invoice.sender.email || ''}
                                    onChange={(val) => handleSenderUpdate({ email: val })}
                                    placeholder="電子郵箱"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`text-right ${isDarkHeader ? 'min-w-[230px] rounded-[1.75rem] px-6 py-6' : ''}`}
                    style={isDarkHeader ? { backgroundColor: theme.headerPanelColor } : undefined}
                >
                    <h1 className="mb-1 text-4xl font-black tracking-tighter" style={{ color: theme.titleColor }}>
                        <EditableText
                            value={invoice.customTitle || docTitle}
                            onChange={(val) => onChange?.({ customTitle: val })}
                        />
                    </h1>
                    <div className="flex items-center justify-end gap-1 text-base font-bold" style={{ color: theme.metaLabelColor }}>
                        <span>#</span>
                        <div style={{ color: theme.metaValueColor }}>
                            <EditableText
                                value={invoice.invoiceNumber}
                                onChange={(val) => onChange?.({ invoiceNumber: val })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewHeader;

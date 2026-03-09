import React from 'react';
import { Invoice } from '@/types/invoice';
import { MapPin, Phone, Mail } from 'lucide-react';
import { InvoiceTheme } from '@/lib/invoice-theme';
import EditableText from './EditableText';

interface PreviewClientInfoProps {
    invoice: Invoice;
    theme: InvoiceTheme;
    onChange?: (updates: Partial<Invoice>) => void;
}

const PreviewClientInfo: React.FC<PreviewClientInfoProps> = ({
    invoice,
    theme,
    onChange
}) => {
    const handleClientUpdate = (updates: any) => onChange?.({ client: { ...invoice.client, ...updates } });

    return (
        <div className="grid grid-cols-2 gap-12 mb-12">
            <div
                className={`space-y-1 ${theme.clientPanel ? 'rounded-[1.75rem] px-6 py-5' : ''}`}
                style={theme.clientPanel ? { backgroundColor: theme.surfaceColor, border: `1px solid ${theme.borderColor}` } : undefined}
            >
                <h3 className="text-[11px] font-black" style={{ color: theme.textColor }}>
                    <EditableText
                        value={invoice.client.name}
                        onChange={(val) => handleClientUpdate({ name: val })}
                        placeholder="名稱"
                        className="text-xl"
                    />
                </h3>
                <div
                    className="space-y-1 py-0.5 pl-4"
                    style={{ borderLeft: `4px solid ${theme.borderColor}` }}
                >
                    <div className="flex items-start gap-2 text-[11px] font-medium leading-tight" style={{ color: theme.mutedColor }}>
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" style={{ color: theme.borderColor }} />
                        <EditableText
                            value={invoice.client.address}
                            onChange={(val) => handleClientUpdate({ address: val })}
                            multiline
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: theme.mutedColor }}>
                        <Phone className="h-3 w-3 shrink-0" style={{ color: theme.borderColor }} />
                        <EditableText
                            value={invoice.client.phone || ''}
                            onChange={(val) => handleClientUpdate({ phone: val })}
                            placeholder="電話"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: theme.mutedColor }}>
                        <Mail className="h-3 w-3 shrink-0" style={{ color: theme.borderColor }} />
                        <EditableText
                            value={invoice.client.email || ''}
                            onChange={(val) => handleClientUpdate({ email: val })}
                            placeholder="電子郵箱"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end space-y-4 pt-2 text-right">
                {invoice.visibility?.date !== false && (
                    <div className="flex flex-col items-end" style={{ color: theme.metaValueColor }}>
                        <p className="mb-0.5 text-[10px] font-bold" style={{ color: theme.metaLabelColor }}>開票日期</p>
                        <EditableText
                            value={invoice.date}
                            onChange={(val) => onChange?.({ date: val })}
                            className="justify-end text-right text-lg font-black"
                            type="date"
                        />
                    </div>
                )}
                {invoice.visibility?.dueDate !== false && (
                    <div className="flex flex-col items-end" style={{ color: theme.metaValueColor }}>
                        <p className="mb-0.5 text-[10px] font-bold" style={{ color: theme.metaLabelColor }}>截止日期</p>
                        <EditableText
                            value={invoice.dueDate}
                            onChange={(val) => onChange?.({ dueDate: val })}
                            className="justify-end text-right text-lg font-black"
                            type="date"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewClientInfo;

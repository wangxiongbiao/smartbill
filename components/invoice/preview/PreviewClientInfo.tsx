import React from 'react';
import { Invoice } from '@/types/invoice';
import { MapPin, Phone, Mail } from 'lucide-react';
import EditableText from './EditableText';

interface PreviewClientInfoProps {
    invoice: Invoice;
    onChange?: (updates: Partial<Invoice>) => void;
}

const PreviewClientInfo: React.FC<PreviewClientInfoProps> = ({
    invoice,
    onChange
}) => {
    const handleClientUpdate = (updates: any) => onChange?.({ client: { ...invoice.client, ...updates } });

    return (
        <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-1">
                <h3 className="text-[11px] font-black text-slate-900">
                    <EditableText
                        value={invoice.client.name}
                        onChange={(val) => handleClientUpdate({ name: val })}
                        placeholder="名稱"
                        className="text-xl"
                    />
                </h3>
                <div className="border-l-4 border-slate-100 pl-4 py-0.5 space-y-1">
                    <div className="text-[11px] font-medium text-slate-500 flex items-start gap-2 leading-tight">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                        <EditableText
                            value={invoice.client.address}
                            onChange={(val) => handleClientUpdate({ address: val })}
                            multiline
                        />
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                        <Phone className="w-3 h-3 shrink-0 text-slate-300" />
                        <EditableText
                            value={invoice.client.phone || ''}
                            onChange={(val) => handleClientUpdate({ phone: val })}
                            placeholder="電話"
                        />
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                        <Mail className="w-3 h-3 shrink-0 text-slate-300" />
                        <EditableText
                            value={invoice.client.email || ''}
                            onChange={(val) => handleClientUpdate({ email: val })}
                            placeholder="電子郵箱"
                        />
                    </div>
                </div>
            </div>

            <div className="text-right space-y-4 flex flex-col items-end pt-2">
                {invoice.visibility?.date !== false && (
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">開票日期</p>
                        <EditableText
                            value={invoice.date}
                            onChange={(val) => onChange?.({ date: val })}
                            className="text-lg font-black text-slate-900 justify-end text-right"
                            type="date"
                        />
                    </div>
                )}
                {invoice.visibility?.dueDate !== false && (
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">截止日期</p>
                        <EditableText
                            value={invoice.dueDate}
                            onChange={(val) => onChange?.({ dueDate: val })}
                            className="text-lg font-black text-slate-900 justify-end text-right"
                            type="date"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewClientInfo;

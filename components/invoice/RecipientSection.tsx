'use client';

import React from 'react';
import { Client } from '@/types/invoice';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import CustomFieldsEditor from './CustomFieldsEditor';

interface RecipientSectionProps {
    client: Client;
    onChange: (updates: Partial<Client>) => void;
}

const RecipientSection: React.FC<RecipientSectionProps> = ({
    client,
    onChange
}) => {
    return (
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-slate-800 font-black tracking-widest text-sm">
                    <User className="w-5 h-5 text-blue-500" />
                    收件人
                </div>
            </div>

            <input
                placeholder="接收方名称"
                value={client.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
            />

            <div className="relative">
                <MapPin className="absolute top-[14px] left-4 w-4 h-4 text-slate-400" />
                <textarea
                    placeholder="接收方地址"
                    value={client.address}
                    onChange={(e) => onChange({ address: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none min-h-[80px]"
                />
            </div>

            <div className="relative">
                <Phone className="absolute top-[14px] left-4 w-4 h-4 text-slate-400" />
                <input
                    placeholder="電話"
                    value={client.phone || ''}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
            </div>

            <div className="relative">
                <Mail className="absolute top-[14px] left-4 w-4 h-4 text-slate-400" />
                <input
                    placeholder="電子郵箱"
                    value={client.email || ''}
                    onChange={(e) => onChange({ email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
            </div>

            <div className="pt-2 border-t border-slate-100/50 mt-1">
                <CustomFieldsEditor
                    fields={client.customFields || []}
                    onChange={(fields) => onChange({ customFields: fields })}
                />
            </div>
        </div>
    );
};

export default RecipientSection;

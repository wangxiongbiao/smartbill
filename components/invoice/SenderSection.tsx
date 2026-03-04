'use client';

import React from 'react';
import { Sender } from '@/types/invoice';
import { Building2, Trash2, RefreshCw, MapPin, Phone, Mail } from 'lucide-react';
import CustomFieldsEditor from './CustomFieldsEditor';

interface SenderSectionProps {
    sender: Sender;
    onChange: (updates: Partial<Sender>) => void;
    onShowLogoPicker?: () => void;
}

const SenderSection: React.FC<SenderSectionProps> = ({
    sender,
    onChange,
    onShowLogoPicker
}) => {
    return (
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-slate-800 font-black tracking-widest text-sm">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    發件人
                </div>
                {/* Logo Button */}
                <button
                    onClick={() => sender.logo ? onChange({ logo: undefined }) : onShowLogoPicker?.()}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold tracking-wider hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                    {sender.logo ? (
                        <>
                            <Trash2 className="w-3.5 h-3.5" />
                            移除
                        </>
                    ) : (
                        <>
                            標誌
                        </>
                    )}
                </button>
            </div>

            {sender.logo && (
                <div className="mb-2 relative group aspect-video sm:aspect-auto sm:h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400 hover:bg-blue-50/30">
                    <img src={sender.logo} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button onClick={(e) => { e.stopPropagation(); onShowLogoPicker?.(); }} className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            <input
                placeholder="公司/个人名称"
                value={sender.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
            />

            <div className="relative">
                <MapPin className="absolute top-3.5 left-4 w-4 h-4 text-slate-400" />
                <textarea
                    placeholder="詳細地址"
                    value={sender.address}
                    onChange={(e) => onChange({ address: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none min-h-[80px]"
                />
            </div>

            <div className="relative">
                <Phone className="absolute top-3.5 left-4 w-4 h-4 text-slate-400" />
                <input
                    placeholder="電話"
                    value={sender.phone || ''}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
            </div>

            <div className="relative">
                <Mail className="absolute top-3.5 left-4 w-4 h-4 text-slate-400" />
                <input
                    placeholder="電子郵箱"
                    value={sender.email || ''}
                    onChange={(e) => onChange({ email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
            </div>

            <div className="pt-2 border-t border-slate-100/50 mt-1">
                <CustomFieldsEditor
                    fields={sender.customFields || []}
                    onChange={(fields) => onChange({ customFields: fields })}
                />
            </div>
        </div>
    );
};

export default SenderSection;

'use client';

import React from 'react';
import { Invoice } from '@/types/invoice';
import { RefreshCw, Trash2, Upload, Settings } from 'lucide-react';
import PaymentFieldConfigurator from './PaymentFieldConfigurator';

interface PaymentInfoSectionProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
    onShowQRCodePicker?: () => void;
    showPaymentFieldConfig: boolean;
    setShowPaymentFieldConfig: (show: boolean) => void;
}

const PaymentInfoSection: React.FC<PaymentInfoSectionProps> = ({
    invoice,
    onChange,
    onShowQRCodePicker,
    showPaymentFieldConfig,
    setShowPaymentFieldConfig
}) => {
    return (
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black tracking-widest text-slate-400">收款信息</h3>
                        <button
                            onClick={() => onChange({ visibility: { ...invoice.visibility, paymentInfo: !invoice.visibility?.paymentInfo } })}
                            className={`flex items-center justify-center w-9 h-5 rounded-full transition-all relative ${invoice.visibility?.paymentInfo ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all ${invoice.visibility?.paymentInfo ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                    </div>
                    {invoice.visibility?.paymentInfo && (
                        <div className="relative">
                            <button onClick={() => setShowPaymentFieldConfig(!showPaymentFieldConfig)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                            {showPaymentFieldConfig && invoice.paymentInfo?.fields && (
                                <PaymentFieldConfigurator
                                    fields={invoice.paymentInfo.fields}
                                    onChange={(fields) => onChange({ paymentInfo: { ...invoice.paymentInfo, fields } })}
                                    onClose={() => setShowPaymentFieldConfig(false)}
                                />
                            )}
                        </div>
                    )}
                </div>

                {invoice.visibility?.paymentInfo && (
                    <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-top-2 duration-300">
                        {/* QR Code */}
                        <div className="relative group/qr aspect-square w-24 h-24 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400 shrink-0">
                            {invoice.paymentInfo?.qrCode ? (
                                <>
                                    <img src={invoice.paymentInfo.qrCode} alt="QR Code" className="w-[85%] h-[85%] object-contain" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/qr:opacity-100 transition-all flex items-center justify-center gap-2">
                                        <button onClick={() => onShowQRCodePicker?.()} className="p-1.5 bg-white rounded-full text-blue-600"><RefreshCw className="w-4 h-4" /></button>
                                        <button onClick={() => onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: undefined } })} className="p-1.5 bg-white rounded-full text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </>
                            ) : (
                                <button onClick={() => onShowQRCodePicker?.()} className="flex flex-col items-center gap-1 text-slate-300 group-hover/qr:text-blue-400">
                                    <Upload className="w-5 h-5" />
                                    <span className="text-[8px] font-black tracking-widest">上傳收款碼</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-4 flex-1">
                            {invoice.paymentInfo?.fields?.filter(f => f.visible).sort((a, b) => a.order - b.order).map(field => (
                                <div key={field.id} className="space-y-1.5">
                                    <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 ml-1">{field.label}</label>
                                    <input
                                        value={field.value}
                                        placeholder={field.label}
                                        onChange={(e) => {
                                            const fields = invoice.paymentInfo?.fields?.map(f => f.id === field.id ? { ...f, value: e.target.value } : f) || [];
                                            onChange({ paymentInfo: { ...invoice.paymentInfo, fields } });
                                        }}
                                        className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${field.id === 'accountNumber' ? 'font-mono' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentInfoSection;

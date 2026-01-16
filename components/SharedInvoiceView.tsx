
import React, { ForwardedRef } from 'react';
import { Invoice, Language } from '../types';
import { translations } from '../i18n';

interface SharedInvoiceViewProps {
    data: Invoice;
    lang: Language;
}

const SharedInvoiceView = React.forwardRef(({ data, lang }: SharedInvoiceViewProps, ref: ForwardedRef<HTMLDivElement>) => {
    const t = translations[lang] || translations['en'];

    // Style helper
    const getTemplateStyle = () => {
        // Default professional style logic
        return {
            headerBg: 'bg-white',
            textColor: 'text-slate-900',
            borderColor: 'border-slate-200'
        };
    };

    const calculateSubtotal = () => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    };

    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (data.taxRate / 100);
    const total = subtotal + taxAmount;

    return (
        <div ref={ref} className="bg-white text-slate-900 shadow-xl rounded-none sm:rounded-[2.5rem] overflow-hidden print:shadow-none print:rounded-none min-h-[800px] relative">
            <div className="absolute top-0 right-0 m-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
                <div className="absolute top-[20px] right-[-40px] w-[150%] bg-blue-100/80 text-blue-600 text-center text-xs font-black uppercase tracking-widest py-1 rotate-45 transform origin-center border border-blue-200 shadow-sm backdrop-blur-sm">
                    {t.readOnly || "READ ONLY"}
                </div>
            </div>

            {/* Header */}
            <div className="p-12 sm:p-16 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-8">
                <div>
                    {data.sender.logo ? (
                        <img src={data.sender.logo} alt="Logo" className="h-16 w-auto object-contain mb-6 rounded-xl" />
                    ) : (
                        <div className="h-16 flex items-center mb-6">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{data.sender.name || 'Business Name'}</h2>
                        </div>
                    )}

                    <div className="space-y-1 text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                        {data.sender.address && <p>{data.sender.address}</p>}
                        {data.sender.email && <p>{data.sender.email}</p>}
                    </div>
                </div>

                <div className="text-right">
                    <h1 className="text-5xl font-black text-slate-200 tracking-tighter uppercase mb-6 flex items-center justify-end gap-3">
                        <i className="fas fa-file-invoice opacity-50"></i> {data.type === 'receipt' ? (t.receiptMode || 'RECEIPT') : (t.invoiceMode || 'INVOICE')}
                    </h1>
                    <div className="space-y-2">
                        <div className="flex justify-end gap-6 text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-widest">{data.type === 'receipt' ? t.recNo : t.invNo}</span>
                            <span className="font-black text-slate-900">{data.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-end gap-6 text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-widest">Date</span>
                            <span className="font-bold text-slate-700">{data.date}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Info */}
            <div className="p-12 sm:p-16 pb-8">
                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4 block">{t.billTo}</span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{data.client.name || 'Client Name'}</h3>
                        <div className="space-y-1 text-slate-500 text-sm font-medium">
                            <p>{data.client.email}</p>
                            <p className="whitespace-pre-line">{data.client.address}</p>
                        </div>
                    </div>
                    {/* Can allow customization here for other fields */}
                </div>
            </div>

            {/* Items Table */}
            <div className="px-12 sm:px-16 py-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="text-left py-4 text-[10px] uppercase font-black text-slate-900 tracking-widest w-[45%]">{t.itemDesc}</th>
                            <th className="text-right py-4 text-[10px] uppercase font-black text-slate-900 tracking-widest">{t.quantity}</th>
                            <th className="text-right py-4 text-[10px] uppercase font-black text-slate-900 tracking-widest">{t.rate}</th>
                            <th className="text-right py-4 text-[10px] uppercase font-black text-slate-900 tracking-widest">{t.amount}</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600">
                        {data.items.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="py-5 pr-4 align-top">
                                    <p className="font-bold text-slate-800 mb-1">{item.description}</p>
                                </td>
                                <td className="py-5 text-right font-medium align-top">{item.quantity}</td>
                                <td className="py-5 text-right font-medium align-top">
                                    {new Intl.NumberFormat(lang, { style: 'currency', currency: data.currency }).format(item.rate)}
                                </td>
                                <td className="py-5 text-right font-black text-slate-900 align-top">
                                    {new Intl.NumberFormat(lang, { style: 'currency', currency: data.currency }).format(item.quantity * item.rate)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="p-12 sm:p-16 pt-4 flex flex-col items-end">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                        <span>{t.summary}</span>
                        <span>{new Intl.NumberFormat(lang, { style: 'currency', currency: data.currency }).format(subtotal)}</span>
                    </div>
                    {data.taxRate > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                            <span>{t.tax} ({data.taxRate}%)</span>
                            <span>{new Intl.NumberFormat(lang, { style: 'currency', currency: data.currency }).format(taxAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900 text-slate-900">
                        <span className="font-black text-lg tracking-tight">{t.total}</span>
                        <span className="font-black text-3xl tracking-tight">
                            {new Intl.NumberFormat(lang, { style: 'currency', currency: data.currency }).format(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Notes */}
            {(data.notes || data.sender.signature) && (
                <div className="grid md:grid-cols-2 gap-12 p-12 sm:p-16 pt-0">
                    <div>
                        {data.notes && (
                            <>
                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 block">{t.notes}</span>
                                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{data.notes}</p>
                            </>
                        )}
                    </div>
                    <div className="text-right flex flex-col items-end justify-end">
                        {data.sender.signature && (
                            <div className="flex flex-col items-center">
                                <img src={data.sender.signature} alt="Signature" className="h-16 object-contain mb-2" />
                                <div className="h-px w-32 bg-slate-300 mb-1"></div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t.signature}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Branding Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-8 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <i className="fas fa-bolt text-yellow-400"></i> Powered by SmartBill Pro
                </p>
            </div>
        </div>
    );
});

SharedInvoiceView.displayName = 'SharedInvoiceView';

export default SharedInvoiceView;

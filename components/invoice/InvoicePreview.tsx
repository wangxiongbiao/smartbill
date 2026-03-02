'use client';

import React from 'react';
import { Invoice, TemplateType, Language, InvoiceColumn, InvoiceItem } from '@/types/invoice';
import { translations } from '@/lib/i18n';
import { MapPin, Phone, Mail, Info } from 'lucide-react';

interface InvoicePreviewProps {
    invoice: Invoice;
    template: TemplateType;
    isHeaderReversed?: boolean;
    isForPdf?: boolean;
    lang: Language;
}

const defaultColumns: InvoiceColumn[] = [
    { id: 'desc', field: 'description', label: 'Description', type: 'system-text', order: 0, visible: true, required: true },
    { id: 'qty', field: 'quantity', label: 'Quantity', type: 'system-quantity', order: 1, visible: true, required: true },
    { id: 'rate', field: 'rate', label: 'Rate', type: 'system-rate', order: 2, visible: true, required: true },
    { id: 'amt', field: 'amount', label: 'Amount', type: 'system-amount', order: 3, visible: true, required: true },
];

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
    invoice,
    template,
    isHeaderReversed = false,
    isForPdf = false,
    lang
}) => {
    const t = translations[lang] || translations['en'];
    const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    const total = subtotal + tax;

    const currencyFormatter = new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: invoice.currency,
    });

    const styles = {
        header: "border-b-4 border-slate-900 px-12 pb-10 pt-10",
        tableHeader: "bg-slate-50 text-slate-900 border-b border-slate-200",
        accentColor: "slate-900",
        signatureBorder: "border-slate-900"
    };

    const docTitle = invoice.type === 'invoice' ? (t.invoiceMode?.split(' ')[0] || 'INVOICE').toUpperCase() : (t.receiptMode?.split(' ')[0] || 'RECEIPT').toUpperCase();

    const columns = invoice.columnConfig || defaultColumns;
    const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);

    const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
        switch (column.type) {
            case 'system-text':
                return item.description || '...';
            case 'system-quantity':
                return item.quantity;
            case 'system-rate':
                return currencyFormatter.format(Number(item.rate));
            case 'system-amount':
                // Use the explicit amount if available, otherwise calculate
                const amt = (item.amount !== undefined && item.amount !== '')
                    ? Number(item.amount)
                    : Number(item.quantity) * Number(item.rate);
                return currencyFormatter.format(amt);
            case 'custom-text':
            case 'custom-number':
                return item.customValues?.[column.id] || '';
            default:
                return null;
        }
    };

    return (
        <div className={`${isForPdf ? 'min-h-[296mm]' : 'min-h-[297mm]'} bg-white mx-auto text-slate-800 flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-700`}>
            <div className={styles.header}>
                <div className={`flex justify-between items-start gap-12 ${isHeaderReversed ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                        <h1 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">{docTitle}</h1>
                        <p className="text-sm font-bold text-slate-400">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className={`flex gap-6 ${isHeaderReversed ? 'flex-row text-left' : 'flex-row-reverse text-right'}`}>
                        {invoice.sender.logo && (
                            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 border border-slate-100 shadow-sm">
                                <img src={invoice.sender.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        <div className="max-w-[280px]">
                            <h2 className="text-lg font-black text-slate-900 mb-2">{invoice.sender.name || t.namePlaceholder}</h2>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-medium text-slate-500 flex items-start gap-2 leading-relaxed">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-300" />
                                    <span className="whitespace-pre-wrap">{invoice.sender.address}</span>
                                </p>
                                {invoice.sender.phone && (
                                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                        <Phone className="w-3 h-3 flex-shrink-0 text-slate-300" /> {invoice.sender.phone}
                                    </p>
                                )}
                                {invoice.sender.email && (
                                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                        <Mail className="w-3 h-3 flex-shrink-0 text-slate-300" /> {invoice.sender.email}
                                    </p>
                                )}
                                {invoice.sender.customFields?.map(field => (
                                    <p key={field.id} className="text-[11px] font-medium text-slate-500 mt-1">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest mr-1">{field.label}:</span>
                                        <span className="whitespace-pre-wrap">{field.value}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-12 py-10 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{t.billTo}</h3>
                        <div className="border-l-4 border-slate-900 pl-5 py-1">
                            <p className="font-black text-xl text-slate-900 mb-3">{invoice.client.name || t.clientName}</p>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-medium text-slate-500 flex items-start gap-2 leading-relaxed">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-300" />
                                    <span className="whitespace-pre-wrap">{invoice.client.address}</span>
                                </p>
                                {invoice.client.phone && (
                                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                        <Phone className="w-3 h-3 flex-shrink-0 text-slate-300" /> {invoice.client.phone}
                                    </p>
                                )}
                                {invoice.client.email && (
                                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                        <Mail className="w-3 h-3 flex-shrink-0 text-slate-300" /> {invoice.client.email}
                                    </p>
                                )}
                                {invoice.client.customFields?.map(field => (
                                    <p key={field.id} className="text-[11px] font-medium text-slate-500 mt-1">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest mr-1">{field.label}:</span>
                                        <span className="whitespace-pre-wrap">{field.value}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-right space-y-6">
                        {invoice.visibility?.date !== false && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">{t.invoiceDate}</p>
                                <p className="text-sm font-black text-slate-900">{invoice.date}</p>
                            </div>
                        )}
                        {invoice.visibility?.dueDate !== false && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">{t.dueDate}</p>
                                <p className="text-sm font-black text-slate-900 bg-slate-100 inline-block px-3 py-1 rounded-lg">{invoice.dueDate}</p>
                            </div>
                        )}
                    </div>
                </div>

                <table className="w-full text-left mb-10 border-collapse">
                    <thead>
                        <tr className={`${styles.tableHeader} text-[10px] font-black uppercase tracking-widest`}>
                            {visibleColumns.map(col => (
                                <th key={col.id} className={`px-6 py-5 ${col.type === 'system-amount' ? 'text-right' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : '')}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoice.items.map((item) => (
                            <tr key={item.id} className="text-[11px] text-slate-700">
                                {visibleColumns.map(col => (
                                    <td key={col.id} className={`px-6 py-5 ${col.type === 'system-amount' ? 'text-right font-black text-slate-900 text-sm' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center font-bold' : 'font-medium')} ${col.type === 'system-text' || col.type === 'custom-text' ? 'whitespace-pre-wrap leading-relaxed max-w-[300px]' : ''}`}>
                                        {renderCell(item, col)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>


                <div className="flex justify-between pt-8 border-t-2 border-slate-900 mt-auto items-end">
                    <div className="flex flex-col items-start gap-4">
                        {invoice.visibility?.signature === true && (
                            <div className="space-y-4">
                                {invoice.sender.signature ? (
                                    <div className="h-20 flex items-center">
                                        <img src={invoice.sender.signature} alt="Signature" className="h-16 object-contain mix-blend-multiply" />
                                    </div>
                                ) : (
                                    <div className="h-20" />
                                )}
                                <div className="w-56 space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.authorizedSignature}</p>
                                    <p className="text-xs font-black text-slate-900 border-t border-slate-900 pt-2">{invoice.sender.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-80 space-y-3">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-slate-600 font-black">{currencyFormatter.format(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{t.taxRate} ({invoice.taxRate}%)</span>
                            <span className="text-slate-600 font-black">{currencyFormatter.format(tax)}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-black text-slate-900 pt-4 border-t-2 border-slate-100">
                            <span className="uppercase tracking-tighter">{t.total}</span>
                            <span className="tracking-tighter">{currencyFormatter.format(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                {invoice.visibility?.paymentInfo === true && (
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6">{t.paymentInfo}</h3>
                        <div className="flex justify-between items-start gap-12 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 flex-1">
                                {invoice.paymentInfo?.fields
                                    ?.filter(field => field.visible && field.value)
                                    ?.sort((a, b) => a.order - b.order)
                                    ?.map(field => (
                                        <div key={field.id} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
                                            <span className={`text-xs font-black text-slate-800 break-words ${field.id === 'accountNumber' ? 'font-mono' : ''}`}>
                                                {field.value}
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>

                            {invoice.paymentInfo?.qrCode && (
                                <div className="w-32 h-32 flex-shrink-0 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center p-2">
                                    <img src={invoice.paymentInfo.qrCode} alt="Payment QR Code" className="max-w-full max-h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            {invoice.sender.disclaimerText && invoice.visibility?.disclaimer !== false && (
                <div className="px-12 py-6 bg-slate-50/50 flex items-start gap-3 justify-center text-center">
                    <Info className="w-3 h-3 mt-0.5 text-slate-300 flex-shrink-0" />
                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed max-w-2xl italic">
                        {invoice.sender.disclaimerText}
                    </p>
                </div>
            )}

            <div className="py-8 bg-slate-900 flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{t.poweredBy}</p>
                <div className="h-0.5 w-12 bg-blue-600 rounded-full" />
            </div>
        </div>
    );
};

export default InvoicePreview;

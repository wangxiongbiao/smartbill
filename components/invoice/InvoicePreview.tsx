'use client';

import React from 'react';
import { Invoice, TemplateType, InvoiceColumn, InvoiceItem } from '@/types/invoice';
import { MapPin, Phone, Mail, Info } from 'lucide-react';
import { getCurrencyDetails } from './CurrencySelector';

interface InvoicePreviewProps {
    invoice: Invoice;
    template: TemplateType;
    isHeaderReversed?: boolean;
    isForPdf?: boolean;
    onChange?: (updates: Partial<Invoice>) => void;
    onShowLogoPicker?: () => void;
    onShowQRCodePicker?: () => void;
}

const defaultColumns: InvoiceColumn[] = [
    { id: 'desc', field: 'description', label: '项目描述', type: 'system-text', order: 0, visible: true, required: true },
    { id: 'qty', field: 'quantity', label: '数量', type: 'system-quantity', order: 1, visible: true, required: true },
    { id: 'rate', field: 'rate', label: '单价', type: 'system-rate', order: 2, visible: true, required: true },
    { id: 'amt', field: 'amount', label: '金额', type: 'system-amount', order: 3, visible: true, required: true },
];

const EditableText: React.FC<{
    value: string;
    onChange: (val: string) => void;
    className?: string;
    type?: 'text' | 'number' | 'date' | 'textarea';
    placeholder?: string;
    multiline?: boolean;
}> = ({ value, onChange, className = "", type = 'text', placeholder, multiline }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const Component = multiline ? 'textarea' : 'input';
    const inputType = type === 'textarea' ? undefined : type;

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (!isEditing) {
        return (
            <div
                onClick={() => setIsEditing(true)}
                className={`cursor-pointer hover:bg-blue-50/50 rounded-sm transition-all p-0.5 -m-0.5 min-h-[1.5em] flex items-center ${className}`}
            >
                {value || (placeholder && <span className="text-slate-300 italic">{placeholder}</span>) || ' '}
            </div>
        );
    }

    return (
        <Component
            ref={inputRef as any}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !multiline) {
                    setIsEditing(false);
                }
            }}
            placeholder={placeholder}
            className={`bg-transparent border-none focus:ring-2 focus:ring-blue-500/20 rounded-sm outline-none p-0.5 -m-0.5 w-full ${className} ${multiline ? 'resize-none' : ''}`}
            rows={multiline ? 2 : undefined}
        />
    );
};

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
    invoice,
    template,
    isHeaderReversed = false,
    isForPdf = false,
    onChange,
    onShowLogoPicker,
    onShowQRCodePicker
}) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    const total = subtotal + tax;

    const currencyFormatter = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: invoice.currency,
    });

    const styles = {
        header: "border-b-4 border-slate-900 px-12 pb-10 pt-10",
        tableHeader: "bg-slate-50 text-slate-900 border-b border-slate-200",
        accentColor: "slate-900",
        signatureBorder: "border-slate-900"
    };

    const docTitle = invoice.type === 'invoice' ? '发票' : '收据';

    const columns = invoice.columnConfig || defaultColumns;
    const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        if (!onChange) return;
        const newItems = invoice.items.map(item => item.id === id ? { ...item, ...updates } : item);
        onChange({ items: newItems });
    };

    const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
        if (!onChange) {
            switch (column.type) {
                case 'system-text': return item.description || '...';
                case 'system-quantity': return item.quantity;
                case 'system-rate': return currencyFormatter.format(Number(item.rate));
                case 'system-amount':
                    const amt = (item.amount !== undefined && item.amount !== '')
                        ? Number(item.amount)
                        : Number(item.quantity) * Number(item.rate);
                    return currencyFormatter.format(amt);
                case 'custom-text':
                case 'custom-number': return item.customValues?.[column.id] || '';
                default: return null;
            }
        }

        switch (column.type) {
            case 'system-text':
                return (
                    <EditableText
                        value={item.description}
                        onChange={(val) => updateItem(item.id, { description: val })}
                        multiline
                    />
                );
            case 'system-quantity':
                return (
                    <EditableText
                        value={String(item.quantity)}
                        onChange={(val) => updateItem(item.id, { quantity: Number(val) || 0 })}
                        className="text-center"
                        type="number"
                    />
                );
            case 'system-rate':
                return (
                    <div className="flex items-center justify-center gap-1 group/rate relative text-[10px]">
                        <span className="text-slate-400 font-bold">{getCurrencyDetails(invoice.currency).symbol}</span>
                        <EditableText
                            value={String(item.rate)}
                            onChange={(val) => updateItem(item.id, { rate: val })}
                            className="text-center font-bold"
                            type="number"
                        />
                    </div>
                );
            case 'system-amount':
                const amt = (item.amount !== undefined && item.amount !== '')
                    ? Number(item.amount)
                    : Number(item.quantity) * Number(item.rate);
                return <span className="text-right block w-full">{currencyFormatter.format(amt)}</span>;
            case 'custom-text':
            case 'custom-number':
                return (
                    <EditableText
                        value={(item.customValues?.[column.id] as any) || ''}
                        onChange={(val) => updateItem(item.id, { customValues: { ...item.customValues, [column.id]: val } })}
                        type={column.type === 'custom-number' ? 'number' : 'text'}
                    />
                );
            default:
                return null;
        }
    };

    const handleSenderUpdate = (updates: any) => onChange?.({ sender: { ...invoice.sender, ...updates } });
    const handleClientUpdate = (updates: any) => onChange?.({ client: { ...invoice.client, ...updates } });

    return (
        <div className={`${isForPdf ? 'min-h-[296mm]' : 'min-h-[297mm]'} bg-white mx-auto text-slate-800 flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-700`}>
            <div className={styles.header}>
                <div className={`flex justify-between items-start gap-12 ${isHeaderReversed ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                        <h1 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">
                            {docTitle}
                        </h1>
                        <div className="flex items-center gap-1 text-sm font-bold text-slate-400">
                            <span>#</span>
                            <EditableText
                                value={invoice.invoiceNumber}
                                onChange={(val) => onChange?.({ invoiceNumber: val })}
                            />
                        </div>
                    </div>
                    <div className={`flex gap-6 ${isHeaderReversed ? 'flex-row text-left' : 'flex-row-reverse text-right'}`}>
                        {invoice.sender.logo && (
                            <div
                                className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 border border-slate-100 shadow-sm cursor-pointer hover:border-blue-400 group relative transition-all"
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
                                    placeholder="名称"
                                />
                            </h2>
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-medium text-slate-500 flex items-start gap-2 leading-relaxed">
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
                                        placeholder="Phone"
                                    />
                                </div>
                                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                    <Mail className="w-3 h-3 shrink-0 text-slate-300" />
                                    <EditableText
                                        value={invoice.sender.email || ''}
                                        onChange={(val) => handleSenderUpdate({ email: val })}
                                        placeholder="Email"
                                    />
                                </div>
                                {invoice.sender.customFields?.map(field => (
                                    <div key={field.id} className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest shrink-0">{field.label}:</span>
                                        <EditableText
                                            value={field.value}
                                            onChange={(val) => {
                                                const fields = invoice.sender.customFields?.map(f => f.id === field.id ? { ...f, value: val } : f);
                                                handleSenderUpdate({ customFields: fields });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-12 py-10 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">账单至</h3>
                        <div className="border-l-4 border-slate-900 pl-5 py-1">
                            <div className="font-black text-xl text-slate-900 mb-3">
                                <EditableText
                                    value={invoice.client.name}
                                    onChange={(val) => handleClientUpdate({ name: val })}
                                    placeholder="名称"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-medium text-slate-500 flex items-start gap-2 leading-relaxed">
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
                                        placeholder="Phone"
                                    />
                                </div>
                                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                    <Mail className="w-3 h-3 shrink-0 text-slate-300" />
                                    <EditableText
                                        value={invoice.client.email || ''}
                                        onChange={(val) => handleClientUpdate({ email: val })}
                                        placeholder="Email"
                                    />
                                </div>
                                {invoice.client.customFields?.map(field => (
                                    <div key={field.id} className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest shrink-0">{field.label}:</span>
                                        <EditableText
                                            value={field.value}
                                            onChange={(val) => {
                                                const fields = invoice.client.customFields?.map(f => f.id === field.id ? { ...f, value: val } : f);
                                                handleClientUpdate({ customFields: fields });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-right space-y-6 flex flex-col items-end">
                        {invoice.visibility?.date !== false && (
                            <div className="flex flex-col items-end w-fit">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">开票日期</p>
                                <EditableText
                                    value={invoice.date}
                                    onChange={(val) => onChange?.({ date: val })}
                                    className="text-sm font-black text-slate-900 justify-end text-right"
                                    type="date"
                                />
                            </div>
                        )}
                        {invoice.visibility?.dueDate !== false && (
                            <div className="flex flex-col items-end w-fit">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">截止日期</p>
                                <EditableText
                                    value={invoice.dueDate}
                                    onChange={(val) => onChange?.({ dueDate: val })}
                                    className="text-sm font-black text-slate-900 justify-end text-right"
                                    type="date"
                                />
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
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">授权签名</p>
                                    <div className="border-t border-slate-900 pt-2">
                                        <EditableText
                                            value={invoice.sender.name}
                                            onChange={(val) => handleSenderUpdate({ name: val })}
                                            className="text-xs font-black text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-80 space-y-3">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>小计</span>
                            <span className="text-slate-600 font-black">{currencyFormatter.format(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <span>税率</span>
                                <div className="flex items-center bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                    <EditableText
                                        value={String(invoice.taxRate)}
                                        onChange={(val) => onChange?.({ taxRate: Number(val) || 0 })}
                                        className="w-8 text-center"
                                        type="number"
                                    />
                                    <span className="text-[10px] text-slate-400">%</span>
                                </div>
                            </div>
                            <span className="text-slate-600 font-black">{currencyFormatter.format(tax)}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-black text-slate-900 pt-4 border-t-2 border-slate-100">
                            <span className="uppercase tracking-tighter">总计</span>
                            <span className="tracking-tighter">{currencyFormatter.format(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                {invoice.visibility?.paymentInfo === true && (
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6">支付信息</h3>
                        <div className="flex justify-between items-start gap-12 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 flex-1">
                                {invoice.paymentInfo?.fields
                                    ?.filter(field => field.visible && field.value)
                                    ?.sort((a, b) => a.order - b.order)
                                    ?.map(field => (
                                        <div key={field.id} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
                                            <div className={`text-xs font-black text-slate-800 wrap-break-word ${field.id === 'accountNumber' ? 'font-mono' : ''}`}>
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
                                    className="w-32 h-32 shrink-0 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center p-2 cursor-pointer hover:border-blue-400 transition-all group relative"
                                    onClick={onShowQRCodePicker}
                                >
                                    <img src={invoice.paymentInfo.qrCode} alt="Payment QR Code" className="max-w-full max-h-full object-contain" />
                                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            {invoice.sender.disclaimerText && invoice.visibility?.disclaimer !== false && (
                <div className="px-12 py-6 bg-slate-50/50 flex items-start gap-3 justify-center text-center group">
                    <Info className="w-3 h-3 mt-0.5 text-slate-300 shrink-0" />
                    <div className="max-w-2xl w-full">
                        <EditableText
                            value={invoice.sender.disclaimerText}
                            onChange={(val) => handleSenderUpdate({ disclaimerText: val })}
                            multiline
                            className="text-[10px] font-medium text-slate-400 leading-relaxed italic text-center"
                        />
                    </div>
                </div>
            )}

            <div className="py-8 bg-slate-900 flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">SMARTBILL POWERED</p>
                <div className="h-0.5 w-12 bg-blue-600 rounded-full" />
            </div>
        </div>
    );
};

export default InvoicePreview;

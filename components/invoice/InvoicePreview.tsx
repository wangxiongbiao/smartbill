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
    { id: 'desc', field: 'description', label: '項目描述', type: 'system-text', order: 0, visible: true, required: true },
    { id: 'qty', field: 'quantity', label: '數量', type: 'system-quantity', order: 1, visible: true, required: true },
    { id: 'rate', field: 'rate', label: '單價', type: 'system-rate', order: 2, visible: true, required: true },
    { id: 'amt', field: 'amount', label: '金額', type: 'system-amount', order: 3, visible: true, required: true },
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
    const currencyDetails = getCurrencyDetails(invoice.currency);

    const currencyFormatter = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: invoice.currency,
    });

    const styles = {
        header: "px-12 pt-12 pb-8",
        divider: "h-[3px] bg-slate-900 mx-12",
        tableHeader: "bg-slate-50 text-slate-900 border-b border-slate-200",
        accentColor: "slate-900",
        signatureBorder: "border-slate-900"
    };

    const docTitle = invoice.type === 'invoice' ? '發票' : '收據';

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
                        className="justify-center text-center"
                        type="number"
                    />
                );
            case 'system-rate':
                return (
                    <div className="flex items-center justify-center gap-1 group/rate relative text-[10px]">
                        <span >{currencyDetails.symbol}</span>
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
            {/* Redesigned Header */}
            <div className={styles.header}>
                <div className="flex justify-between items-start">
                    <div className="flex gap-6 items-start">
                        {invoice.sender.logo && (
                            <div
                                className="w-24 h-24 bg-white   cursor-pointer hover:border-blue-400 group relative transition-all"
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

            <div className={styles.divider} />

            <div className="px-12 py-10 flex-1 flex flex-col">
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

                <table className="w-full text-left mb-10 border-collapse">
                    <thead>
                        <tr className={`${styles.tableHeader} text-[10px] font-black tracking-widest`}>
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


                <div className="flex justify-between pt-12 border-t border-slate-100 mt-auto items-end">
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
                                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">授權簽名</p>
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

                    <div className="w-72 space-y-2">
                        <div className="flex justify-between items-center text-[13px] text-slate-500">
                            <span className="font-bold">小計</span>
                            <span className="font-black text-slate-900">{currencyFormatter.format(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px] text-slate-500">
                            <div className="flex items-center gap-1">
                                <span className="font-bold">稅率 (%) ({invoice.taxRate}%)</span>
                            </div>
                            <span className="font-black text-slate-900">{currencyFormatter.format(tax)}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-black text-slate-900 pt-4 border-t-2 border-slate-200">
                            <span className="tracking-tight">應付總額</span>
                            <span className="tracking-tighter">{currencyFormatter.format(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                {invoice.visibility?.paymentInfo === true && (
                    <div className="mt-16 pt-8 border-t border-slate-100">
                        <div className="flex justify-between items-start gap-12">
                            <div className="grid grid-cols-1 gap-y-3 flex-1">
                                {invoice.paymentInfo?.fields
                                    ?.filter(field => field.visible && field.value)
                                    ?.sort((a, b) => a.order - b.order)
                                    ?.map(field => (
                                        <div key={field.id} className="flex gap-4 text-[13px]">
                                            <span className="font-bold text-slate-400 min-w-[140px]">{field.label}:</span>
                                            <div className="font-black text-slate-900 flex-1">
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
                                    className="w-32 h-32 shrink-0 bg-white   cursor-pointer hover:border-blue-400 transition-all group relative"
                                    onClick={onShowQRCodePicker}
                                >
                                    <img src={invoice.paymentInfo.qrCode} alt="Payment QR Code" className="max-w-full max-h-full object-contain" />
                                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            {invoice.sender.disclaimerText && invoice.visibility?.disclaimer !== false && (
                <div className="px-12 py-8 bg-slate-50/30 flex items-start gap-3 justify-center text-center">
                    <div className="max-w-2xl w-full flex items-center justify-center gap-2">
                        <span className="text-xl">🎓</span>
                        <EditableText
                            value={invoice.sender.disclaimerText}
                            onChange={(val) => handleSenderUpdate({ disclaimerText: val })}
                            multiline
                            className="text-[11px] font-bold text-slate-400 leading-relaxed text-center"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicePreview;

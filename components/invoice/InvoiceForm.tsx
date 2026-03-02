'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, DocumentType, Language, CustomField, InvoiceColumn, PaymentInfoField } from '@/types/invoice';
import CustomFieldsEditor from './CustomFieldsEditor';
import { translations } from '@/lib/i18n';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor,
    MouseSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ColumnConfigurator from './ColumnConfigurator';
import PaymentFieldConfigurator from './PaymentFieldConfigurator';
import ImagePickerDialog from './ImagePickerDialog';
import CurrencySelector from './CurrencySelector';
import {
    Plus,
    Trash2,
    Settings,
    Eye,
    EyeOff,
    GripVertical,
    Calendar,
    Image as ImageIcon,
    RefreshCw,
    Signature as SignatureIcon,
    Upload,
    CheckCircle2,
    AlertCircle,
    Building2,
    MapPin,
    Phone,
    Mail,
    User
} from 'lucide-react';
import { nanoid } from 'nanoid';

interface InvoiceFormProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
    lang: Language;
    userId?: string;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const defaultColumns: InvoiceColumn[] = [
    { id: 'desc', field: 'description', label: 'Description', type: 'system-text', order: 0, visible: true, required: true },
    { id: 'qty', field: 'quantity', label: 'Quantity', type: 'system-quantity', order: 1, visible: true, required: true },
    { id: 'rate', field: 'rate', label: 'Rate', type: 'system-rate', order: 2, visible: true, required: true },
    { id: 'amt', field: 'amount', label: 'Amount', type: 'system-amount', order: 3, visible: true, required: true },
];

const SortableItem = ({ id, children }: { id: string; children: (props: { listeners: any; attributes: any }) => React.ReactNode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {children({ listeners, attributes })}
        </div>
    );
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onChange, lang, userId, showToast }) => {
    const dateInputRef = useRef<HTMLInputElement>(null);
    const dueDateInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [focusItemId, setFocusItemId] = useState<string | null>(null);
    const [showColumnConfig, setShowColumnConfig] = useState(false);
    const [showPaymentFieldConfig, setShowPaymentFieldConfig] = useState(false);
    const [showLogoPickerDialog, setShowLogoPickerDialog] = useState(false);
    const [showQRCodePickerDialog, setShowQRCodePickerDialog] = useState(false);

    const t = translations[lang] || translations['en'];

    // Initialize columns if not present
    useEffect(() => {
        if (!invoice.columnConfig) {
            onChange({ columnConfig: defaultColumns });
        }
    }, [invoice.columnConfig, onChange]);

    // Migrate and initialize payment fields (directly from old logic)
    useEffect(() => {
        if (!invoice.paymentInfo?.fields) {
            const oldInfo = invoice.paymentInfo;
            const migratedFields: PaymentInfoField[] = [
                { id: 'bankName', label: t.bankName || 'Bank Name', type: 'text', order: 0, visible: true, required: true, value: oldInfo?.bankName || '' },
                { id: 'accountName', label: t.accountName || 'Account Name', type: 'text', order: 1, visible: true, required: true, value: oldInfo?.accountName || '' },
                { id: 'accountNumber', label: t.accountNumber || 'Account Number', type: 'text', order: 2, visible: true, required: true, value: oldInfo?.accountNumber || '' },
                { id: 'address', label: lang === 'zh-TW' ? '詳細地址' : 'Bank Address', type: 'textarea', order: 3, visible: true, required: true, value: '' },
                { id: 'extraInfo', label: t.extraInfo || 'Additional Info (SWIFT/IBAN)', type: 'textarea', order: 4, visible: true, required: false, value: oldInfo?.extraInfo || '' },
            ];

            if (oldInfo?.customFields) {
                oldInfo.customFields.forEach((cf, idx) => {
                    migratedFields.push({
                        id: cf.id,
                        label: cf.label,
                        type: 'text',
                        order: 5 + idx,
                        visible: true,
                        required: false,
                        value: cf.value
                    });
                });
            }

            onChange({
                paymentInfo: {
                    fields: migratedFields,
                    qrCode: oldInfo?.qrCode
                }
            });
        }
    }, [invoice.paymentInfo, onChange, lang, t]);

    const columns = invoice.columnConfig || defaultColumns;
    const sortedColumns = columns.slice().sort((a, b) => a.order - b.order);

    // DND Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = invoice.items.findIndex((item) => item.id === active.id);
            const newIndex = invoice.items.findIndex((item) => item.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                onChange({ items: arrayMove(invoice.items, oldIndex, newIndex) });
            }
        }
    };

    // Signature logic
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [invoice.visibility?.signature]);

    const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCanvasCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCanvasCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            onChange({ sender: { ...invoice.sender, signature: canvas.toDataURL() } });
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            onChange({ sender: { ...invoice.sender, signature: undefined } });
        }
    };

    // Item management
    const addItem = () => {
        const id = nanoid();
        const newItem: InvoiceItem = { id, description: '', quantity: 1, rate: '', amount: '' };
        onChange({ items: [...invoice.items, newItem] });
        setFocusItemId(id);
    };

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        const newItems = invoice.items.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            if (('quantity' in updates || 'rate' in updates) && !('amount' in updates)) {
                if (!String(updated.quantity ?? '') || !String(updated.rate ?? '')) {
                    updated.amount = '';
                    return updated;
                }
                updated.amount = Number(updated.quantity || 0) * Number(updated.rate || 0);
            }
            return updated;
        });
        onChange({ items: newItems });
    };

    const updateItemAmount = (id: string, newAmount: number | string) => {
        const item = invoice.items.find(i => i.id === id);
        if (!item) return;
        if (newAmount === '') {
            updateItem(id, { amount: '', rate: '' });
            return;
        }
        const amount = Number(newAmount);
        const qty = Number(item.quantity || 1);
        updateItem(id, { rate: amount / qty, amount });
    };

    const updateCustomValue = (itemId: string, columnId: string, value: string) => {
        const item = invoice.items.find(i => i.id === itemId);
        if (!item) return;
        const newCustomValues = { ...(item.customValues || {}), [columnId]: value };
        updateItem(itemId, { customValues: newCustomValues });
    };

    const removeItem = (id: string) => {
        onChange({ items: invoice.items.filter(item => item.id !== id) });
    };

    // Input helpers
    const handleNumberInput = (value: string, callback: (val: string | number) => void) => {
        if (value === '') { callback(''); return; }
        const numberRegex = /^-?\d*\.?\d*$/;
        if (numberRegex.test(value)) {
            if (value === '-' || value === '.' || value === '-.' || value.endsWith('.')) {
                callback(value);
            } else {
                callback(Number(value));
            }
        }
    };

    const autoResizeTextarea = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
    };

    const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
        switch (column.type) {
            case 'system-text':
                return (
                    <textarea
                        placeholder={column.label}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none overflow-hidden min-h-[40px]"
                        value={item.description}
                        autoFocus={item.id === focusItemId}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        onInput={autoResizeTextarea}
                        rows={1}
                    />
                );
            case 'system-quantity':
                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-center"
                        value={item.quantity}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateItem(item.id, { quantity: val }))}
                        placeholder="0"
                    />
                );
            case 'system-rate':
                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-right"
                        value={item.rate}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateItem(item.id, { rate: val }))}
                        placeholder="0.00"
                    />
                );
            case 'system-amount':
                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-blue-700"
                        value={item.amount || ''}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateItemAmount(item.id, val))}
                        placeholder="0.00"
                    />
                );
            case 'custom-text':
                return (
                    <textarea
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none overflow-hidden min-h-[40px]"
                        value={item.customValues?.[column.id] || ''}
                        onChange={(e) => updateCustomValue(item.id, column.id, e.target.value)}
                        onInput={autoResizeTextarea}
                        rows={1}
                    />
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">


                {/* Row 1: Document Type & Invoice No. */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Document Type Toggle */}
                    <div className="space-y-3" style={{
                        gridColumn: 'span 2'
                    }}>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Document Type</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl h-[52px]">
                            {(['invoice', 'receipt'] as DocumentType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onChange({ type })}
                                    className={`flex-1 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${invoice.type === type
                                        ? 'bg-white text-blue-600 shadow-sm transform scale-[1.02]'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <span className="mr-2">{type === 'invoice' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}</span>
                                    {type === 'invoice' ? t.invoiceMode : t.receiptMode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Invoice No. */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                            {invoice.type === 'invoice' ? t.invNo : t.recNo}
                        </label>
                        <input
                            type="text"
                            value={invoice.invoiceNumber}
                            onChange={(e) => onChange({ invoiceNumber: e.target.value })}
                            className="w-full px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[52px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-mono font-medium"
                        />
                    </div>
                </div>

                {/* Row 2: Date, Due Date, Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Date */}
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                            <input
                                type="checkbox"
                                checked={invoice.visibility?.date !== false}
                                onChange={() => onChange({ visibility: { ...invoice.visibility, date: !invoice.visibility?.date } })}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                            />
                            {t.invoiceDate}
                        </label>
                        <button
                            onClick={() => dateInputRef.current?.showPicker()}
                            className="flex items-center gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[48px] text-sm font-medium hover:border-blue-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white"
                        >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{invoice.date}</span>
                        </button>
                        <input ref={dateInputRef} type="date" value={invoice.date} onChange={(e) => onChange({ date: e.target.value })} className="sr-only" />
                    </div>

                    {/* Due Date */}
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                            <input
                                type="checkbox"
                                checked={invoice.visibility?.dueDate !== false}
                                onChange={() => onChange({ visibility: { ...invoice.visibility, dueDate: !invoice.visibility?.dueDate } })}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                            />
                            {t.dueDate}
                        </label>
                        <button
                            onClick={() => dueDateInputRef.current?.showPicker()}
                            className="flex items-center gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl h-[48px] text-sm font-medium hover:border-blue-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white"
                        >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{invoice.dueDate}</span>
                        </button>
                        <input ref={dueDateInputRef} type="date" value={invoice.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} className="sr-only" />
                    </div>

                    {/* Currency */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t.currency}</label>
                        <CurrencySelector
                            value={invoice.currency}
                            onChange={(currency) => onChange({ currency })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">

                {/* Sender & Receiver */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bill From */}
                    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2 text-slate-800 font-black uppercase tracking-widest text-sm">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                {t.billFrom}
                            </div>
                            {/* Logo Button */}
                            <button
                                onClick={() => invoice.sender.logo ? onChange({ sender: { ...invoice.sender, logo: undefined } }) : setShowLogoPickerDialog(true)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold tracking-wider hover:bg-blue-100 transition-colors uppercase flex items-center gap-2"
                            >
                                {invoice.sender.logo ? (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Remove
                                    </>
                                ) : (
                                    <>
                                        LOGO
                                    </>
                                )}
                            </button>
                        </div>

                        {invoice.sender.logo && (
                            <div className="mb-2 relative group aspect-video sm:aspect-auto sm:h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400 hover:bg-blue-50/30">
                                <img src={invoice.sender.logo} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button onClick={() => setShowLogoPickerDialog(true)} className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg">
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <input
                            placeholder={t.namePlaceholder}
                            value={invoice.sender.name}
                            onChange={(e) => onChange({ sender: { ...invoice.sender, name: e.target.value } })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />

                        <div className="relative">
                            <MapPin className="absolute top-3.5 left-4 w-4 h-4 text-slate-400" />
                            <textarea
                                placeholder={t.addrPlaceholder}
                                value={invoice.sender.address}
                                onChange={(e) => onChange({ sender: { ...invoice.sender, address: e.target.value } })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none min-h-[80px]"
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute top-3.5 left-4 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Phone"
                                value={invoice.sender.phone || ''}
                                onChange={(e) => onChange({ sender: { ...invoice.sender, phone: e.target.value } })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute top-3.5 left-4 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Email"
                                value={invoice.sender.email || ''}
                                onChange={(e) => onChange({ sender: { ...invoice.sender, email: e.target.value } })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-slate-100/50 mt-1">
                            <CustomFieldsEditor
                                fields={invoice.sender.customFields || []}
                                onChange={(fields) => onChange({ sender: { ...invoice.sender, customFields: fields } })}
                                lang={lang}
                            />
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2 text-slate-800 font-black uppercase tracking-widest text-sm">
                                <User className="w-5 h-5 text-blue-500" />
                                {t.billTo}
                            </div>
                        </div>

                        <input
                            placeholder={t.clientName}
                            value={invoice.client.name}
                            onChange={(e) => onChange({ client: { ...invoice.client, name: e.target.value } })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />

                        <div className="relative">
                            <MapPin className="absolute top-[14px] left-4 w-4 h-4 text-slate-400" />
                            <textarea
                                placeholder={t.clientAddr}
                                value={invoice.client.address}
                                onChange={(e) => onChange({ client: { ...invoice.client, address: e.target.value } })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none min-h-[80px]"
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute top-[14px] left-4 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Phone"
                                value={invoice.client.phone || ''}
                                onChange={(e) => onChange({ client: { ...invoice.client, phone: e.target.value } })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute top-[14px] left-4 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Email"
                                value={invoice.client.email || ''}
                                onChange={(e) => onChange({ client: { ...invoice.client, email: e.target.value } })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-slate-100/50 mt-1">
                            <CustomFieldsEditor
                                fields={invoice.client.customFields || []}
                                onChange={(fields) => onChange({ client: { ...invoice.client, customFields: fields } })}
                                lang={lang}
                            />
                        </div>
                    </div>
                </section>

                {/* Line Items & Totals Card */}
                <div className="bg-white rounded-[24px]  border border-slate-200 p-6 shadow-sm">
                    {/* Line Items Section */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.items}</h3>
                            <div className="relative">
                                <button
                                    onClick={() => setShowColumnConfig(!showColumnConfig)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${showColumnConfig ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50'
                                        }`}
                                >
                                    <Settings className={`w-4 h-4 ${showColumnConfig ? 'animate-spin-slow' : ''}`} />
                                    {t.customizeColumns}
                                </button>
                                {showColumnConfig && (
                                    <ColumnConfigurator columns={columns} onChange={(newCols) => onChange({ columnConfig: newCols })} onClose={() => setShowColumnConfig(false)} lang={lang} />
                                )}
                            </div>
                        </div>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={invoice.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-6">
                                    {invoice.items.map((item) => {
                                        const systemColumns = sortedColumns.filter(col => col.type.startsWith('system-'));
                                        const customColumns = sortedColumns.filter(col => col.type.startsWith('custom-'));
                                        return (
                                            <SortableItem key={item.id} id={item.id}>
                                                {({ listeners }) => (
                                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 relative group/item shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                                                        <div className="absolute top-4 -left-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <div {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500 bg-white rounded-full shadow-md border border-slate-100">
                                                                <GripVertical className="w-4 h-4" />
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 hover:shadow-md flex items-center justify-center rounded-full opacity-0 group-hover/item:opacity-100 transition-all z-10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>

                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                                {/* Description - take more space */}
                                                                {systemColumns.find(c => c.field === 'description') && (
                                                                    <div className="md:col-span-6">
                                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{t.itemDesc}</label>
                                                                        {renderCell(item, systemColumns.find(c => c.field === 'description')!)}
                                                                    </div>
                                                                )}

                                                                <div className="md:col-span-6 grid grid-cols-3 gap-4">
                                                                    {systemColumns.filter(c => c.field !== 'description').map(col => (
                                                                        <div key={col.id}>
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block text-center truncate">
                                                                                {col.label}
                                                                            </label>
                                                                            {renderCell(item, col)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Custom columns */}
                                                            {customColumns.length > 0 && (
                                                                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                                    {customColumns.map(col => (
                                                                        <div key={col.id}>
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{col.label}</label>
                                                                            {renderCell(item, col)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </SortableItem>
                                        );
                                    })}
                                </div>
                            </SortableContext>

                        </DndContext>

                        <div className="flex justify-center mt-3">
                            <button
                                onClick={addItem}
                                className="px-20 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all group shadow-sm"
                            >
                                <Plus className="w-4 h-4 transform group-hover:rotate-90 transition-transform" />
                                <span className="font-bold uppercase tracking-wider text-xs">{t.addItems}</span>
                            </button>
                        </div>
                    </section>

                    {/* Subtotal */}
                    <div className="mt-3 border-t border-slate-100">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                <span className="font-black text-slate-600">
                                    {new Intl.NumberFormat(lang, { style: 'currency', currency: invoice.currency }).format(
                                        invoice.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0)
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.taxRate}</span>
                                <div className="flex items-center gap-2">
                                    {/* 限制只能输入数字,上下加一减一的控件不展示 */}
                                    <input


                                        className="w-16 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-black text-sm text-blue-600"
                                        value={invoice.taxRate}
                                        onChange={(e) => {
                                            // 只有数字有效
                                            const value = e.target.value;
                                            if (/^\d*\.?\d*$/.test(value)) {
                                                onChange({ taxRate: Number(value) })
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-black text-slate-400">%</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200/50 flex justify-between items-baseline">
                                <span className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">{t.payable}</span>
                                <span className="text-3xl font-black text-blue-600 tracking-tighter">
                                    {new Intl.NumberFormat(lang, { style: 'currency', currency: invoice.currency }).format(
                                        invoice.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0) * (1 + invoice.taxRate / 100)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Payment Info Card */}
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.paymentInfo}</h3>
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
                                        <PaymentFieldConfigurator fields={invoice.paymentInfo.fields} onChange={(fields) => onChange({ paymentInfo: { ...invoice.paymentInfo, fields } })} onClose={() => setShowPaymentFieldConfig(false)} lang={lang} />
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
                                                <button onClick={() => setShowQRCodePickerDialog(true)} className="p-1.5 bg-white rounded-full text-blue-600"><RefreshCw className="w-4 h-4" /></button>
                                                <button onClick={() => onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: undefined } })} className="p-1.5 bg-white rounded-full text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </>
                                    ) : (
                                        <button onClick={() => setShowQRCodePickerDialog(true)} className="flex flex-col items-center gap-1 text-slate-300 group-hover/qr:text-blue-400">
                                            <Upload className="w-5 h-5" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{t.uploadQR}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4 flex-1">
                                    {invoice.paymentInfo?.fields?.filter(f => f.visible).sort((a, b) => a.order - b.order).map(field => (
                                        <div key={field.id} className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{field.label}</label>
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

                {/* Signature Card */}
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.signature}</h3>
                                <button
                                    onClick={() => onChange({ visibility: { ...invoice.visibility, signature: !invoice.visibility?.signature } })}
                                    className={`flex items-center justify-center w-9 h-5 rounded-full transition-all relative ${invoice.visibility?.signature ? 'bg-blue-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all ${invoice.visibility?.signature ? 'right-0.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                            {invoice.visibility?.signature && (
                                <div className="flex gap-4">
                                    <button onClick={clearSignature} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">{t.signClear}</button>
                                </div>
                            )}
                        </div>

                        {invoice.visibility?.signature && (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden relative group/sig animate-in slide-in-from-top-2 duration-300">
                                <canvas
                                    ref={canvasRef}
                                    width={800}
                                    height={320}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full h-[160px] cursor-crosshair touch-none bg-white/20"
                                />
                                {!invoice.sender.signature && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300">
                                        <SignatureIcon className="w-8 h-8 mb-2 opacity-20" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{t.signPlaceholder}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Disclaimer Card */}
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-600">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.disclaimerText}</h3>
                            <button
                                onClick={() => onChange({ visibility: { ...invoice.visibility, disclaimer: invoice.visibility?.disclaimer === false } })}
                                className={`flex items-center justify-center w-9 h-5 rounded-full transition-all relative ${invoice.visibility?.disclaimer !== false ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all ${invoice.visibility?.disclaimer !== false ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                        {invoice.visibility?.disclaimer !== false && (
                            <textarea
                                value={invoice.sender.disclaimerText || ''}
                                onChange={(e) => onChange({ sender: { ...invoice.sender, disclaimerText: e.target.value } })}
                                placeholder="e.g., Computer generated document, no signature required."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-500 italic"
                            />
                        )}
                    </div>
                </div>
            </div>

            <ImagePickerDialog
                isOpen={showLogoPickerDialog}

                onClose={() => setShowLogoPickerDialog(false)}
                imageType="logo"
                onSelect={(img) => onChange({ sender: { ...invoice.sender, logo: img } })}
                currentUserId={userId || ''}
                lang={lang}
                showToast={showToast}
            />

            <ImagePickerDialog
                isOpen={showQRCodePickerDialog}
                onClose={() => setShowQRCodePickerDialog(false)}
                imageType="qrcode"
                onSelect={(img) => onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: img } as any })}
                currentUserId={userId || ''}
                lang={lang}
                showToast={showToast}
            />
        </div >
    );
};

export default InvoiceForm;

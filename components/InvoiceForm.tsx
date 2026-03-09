import React, { useRef, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Language, InvoiceColumn, PaymentInfoField } from '../types';
import { translations } from '../i18n';
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import ImagePickerDialog from './ImagePickerDialog';
import BasicInfoSection from './invoice-form/BasicInfoSection';
import ItemsSection from './invoice-form/ItemsSection';
import PaymentSection from './invoice-form/PaymentSection';

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

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onChange, lang, userId, showToast }) => {
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [showPaymentFieldConfig, setShowPaymentFieldConfig] = useState(false);
  const [showLogoPickerDialog, setShowLogoPickerDialog] = useState(false);
  const [showQRCodePickerDialog, setShowQRCodePickerDialog] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingQRCode, setIsUploadingQRCode] = useState(false);
  const t = translations[lang] || translations['en'];

  useEffect(() => {
    if (!invoice.columnConfig) onChange({ columnConfig: defaultColumns });
  }, [invoice.columnConfig, onChange]);

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
        oldInfo.customFields.forEach((cf, idx) => migratedFields.push({ id: cf.id, label: cf.label, type: 'text', order: 5 + idx, visible: true, required: false, value: cf.value }));
      }
      onChange({ paymentInfo: { fields: migratedFields, qrCode: oldInfo?.qrCode } });
    }
  }, [invoice.paymentInfo, onChange, lang, t.bankName, t.accountName, t.accountNumber, t.extraInfo]);

  const columns = invoice.columnConfig || defaultColumns;
  const sortedColumns = columns.slice().sort((a, b) => a.order - b.order);

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
      if (oldIndex !== -1 && newIndex !== -1) onChange({ items: arrayMove(invoice.items, oldIndex, newIndex) });
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
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
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    if (!('touches' in e)) e.preventDefault();
    const { x, y } = getCanvasCoordinates(e, canvasRef.current);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) onChange({ sender: { ...invoice.sender, signature: canvas.toDataURL() } });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      onChange({ sender: { ...invoice.sender, signature: undefined } });
    }
  };

  const addItem = () => {
    const id = `item-${Date.now()}`;
    onChange({ items: [...invoice.items, { id, description: '', quantity: 1, rate: '', amount: '' }] });
    setFocusItemId(id);
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    const newItems = invoice.items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      if (('quantity' in updates || 'rate' in updates) && !('amount' in updates)) {
        if (!String(updated.quantity ?? '') || !String(updated.rate ?? '')) {
          updated.amount = undefined;
          return updated;
        }
        updated.amount = Number(updated.quantity || 0) * Number(updated.rate || 0);
      }
      return updated;
    });
    onChange({ items: newItems });
  };

  const updateCustomValue = (itemId: string, columnId: string, value: string) => {
    const item = invoice.items.find(i => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { customValues: { ...(item.customValues || {}), [columnId]: value } });
  };

  const updateItemAmount = (id: string, newAmount: number | string) => {
    const item = invoice.items.find(i => i.id === id);
    if (!item) return;
    if (newAmount === '') return updateItem(id, { amount: '', rate: '' });
    const amount = Number(newAmount);
    const qty = item.quantity;
    const rate = item.rate;
    if ((!qty || qty === '') && (!rate || rate === '')) return updateItem(id, { quantity: 1, rate: amount, amount });
    if (qty && qty !== '' && (!rate || rate === '')) return updateItem(id, { rate: Number(qty) !== 0 ? amount / Number(qty) : amount, amount });
    if ((!qty || qty === '') && rate && rate !== '') return updateItem(id, { quantity: Number(rate) !== 0 ? amount / Number(rate) : 1, amount });
    if (qty && qty !== '' && rate && rate !== '') return updateItem(id, { rate: Number(qty) !== 0 ? amount / Number(qty) : amount, amount });
    updateItem(id, { amount });
  };

  const removeItem = (id: string) => onChange({ items: invoice.items.filter(item => item.id !== id) });

  const handleLogoSelect = async (imageData: string) => { setIsUploadingLogo(true); try { onChange({ sender: { ...invoice.sender, logo: imageData } }); } finally { setIsUploadingLogo(false); } };
  const handleLogoRemove = () => onChange({ sender: { ...invoice.sender, logo: undefined } });
  const handleQRCodeSelect = async (imageData: string) => { setIsUploadingQRCode(true); try { onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: imageData } as any }); } finally { setIsUploadingQRCode(false); } };
  const handleQRCodeRemove = () => onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: undefined } as any });

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({ sender: { ...invoice.sender, signature: reader.result as string } });
      canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    reader.readAsDataURL(file);
  };

  const handleNumberInput = (value: string, callback: (val: string | number) => void) => {
    if (value === '' || !value) return callback('');
    const numberRegex = /^-?\d*\.?\d*$/;
    if (numberRegex.test(value)) {
      if (value === '-' || value === '.' || value === '-.' || value.endsWith('.')) callback(value);
      else callback(Number(value));
    }
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
    switch (column.type) {
      case 'system-text':
        return <textarea ref={autoResizeTextarea} placeholder={column.label} className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm resize-none overflow-hidden" value={item.description} autoFocus={item.id === focusItemId} onChange={(e) => updateItem(item.id, { description: e.target.value })} rows={1} onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }} />;
      case 'system-quantity':
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm" value={item.quantity} onChange={(e) => handleNumberInput(e.target.value, (val) => updateItem(item.id, { quantity: val }))} placeholder="0" />;
      case 'system-rate':
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm" value={item.rate} onChange={(e) => handleNumberInput(e.target.value, (val) => updateItem(item.id, { rate: val }))} placeholder="0.00" />;
      case 'system-amount':
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm font-bold " value={item.amount !== undefined && item.amount !== '' ? item.amount : ''} onChange={(e) => handleNumberInput(e.target.value, (val) => updateItemAmount(item.id, val))} placeholder="0.00" />;
      case 'custom-text':
        return <textarea ref={autoResizeTextarea} className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm resize-none overflow-hidden" value={item.customValues?.[column.id] || ''} onChange={(e) => updateCustomValue(item.id, column.id, e.target.value)} rows={1} onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }} />;
      case 'custom-number':
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm" value={item.customValues?.[column.id] || ''} onChange={(e) => handleNumberInput(e.target.value, (val) => updateCustomValue(item.id, column.id, String(val)))} placeholder="0" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
      <BasicInfoSection invoice={invoice} lang={lang} t={t} onChange={onChange} dateInputRef={dateInputRef} dueDateInputRef={dueDateInputRef} isUploadingLogo={isUploadingLogo} onOpenLogoPicker={() => setShowLogoPickerDialog(true)} onRemoveLogo={handleLogoRemove} />
      <ItemsSection invoice={invoice} t={t} lang={lang} columns={columns} sortedColumns={sortedColumns} sensors={sensors} focusItemId={focusItemId} showColumnConfig={showColumnConfig} setShowColumnConfig={setShowColumnConfig} onChange={onChange} addItem={addItem} removeItem={removeItem} handleDragEnd={handleDragEnd} renderCell={renderCell} />
      <PaymentSection invoice={invoice} lang={lang} t={t} onChange={onChange} autoResizeTextarea={autoResizeTextarea} showPaymentFieldConfig={showPaymentFieldConfig} setShowPaymentFieldConfig={setShowPaymentFieldConfig} isUploadingQRCode={isUploadingQRCode} onOpenQRCodePicker={() => setShowQRCodePickerDialog(true)} onRemoveQRCode={handleQRCodeRemove} canvasRef={canvasRef} startDrawing={startDrawing} draw={draw} stopDrawing={stopDrawing} signatureInputRef={signatureInputRef} handleSignatureUpload={handleSignatureUpload} clearSignature={clearSignature} />

      {userId && showLogoPickerDialog && <ImagePickerDialog isOpen={showLogoPickerDialog} onClose={() => setShowLogoPickerDialog(false)} imageType="logo" onSelect={handleLogoSelect} currentUserId={userId || ''} lang={lang} showToast={showToast} />}
      {userId && showQRCodePickerDialog && <ImagePickerDialog isOpen={showQRCodePickerDialog} onClose={() => setShowQRCodePickerDialog(false)} imageType="qrcode" onSelect={handleQRCodeSelect} currentUserId={userId || ''} lang={lang} showToast={showToast} />}
    </div>
  );
};

export default InvoiceForm;

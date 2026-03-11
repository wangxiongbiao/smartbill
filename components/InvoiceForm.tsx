import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BillingProfile, Invoice, InvoiceItem, Language, InvoiceColumn } from '../types';
import { translations } from '../i18n';
import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import ImagePickerDialog from './ImagePickerDialog';
import InvoiceDetailsSection from './invoice-form/InvoiceDetailsSection';
import SenderSection from './invoice-form/SenderSection';
import RecipientSection from './invoice-form/RecipientSection';
import ItemsSection from './invoice-form/ItemsSection';
import InvoiceSummarySection from './invoice-form/InvoiceSummarySection';
import PaymentInfoSection from './invoice-form/PaymentInfoSection';
import SignatureSection from './invoice-form/SignatureSection';
import DisclaimerSection from './invoice-form/DisclaimerSection';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';
import {
  applyBillingProfileToClient,
  applyBillingProfileToSender,
  deriveBillingProfilesFromInvoices,
  getBillingProfileLookupKey,
} from '@/lib/billing-profiles';
import {
  buildPaymentInfoFields,
  DEFAULT_INVOICE_COLUMNS,
  getInvoiceColumns,
  getSortedInvoiceColumns,
  parseEditableNumberInput,
  updateInvoiceItem,
  updateInvoiceItemAmount,
  updateInvoiceItemCustomValue,
} from '@/lib/invoice';

interface InvoiceFormProps {
  invoice: Invoice;
  records: Invoice[];
  onChange: (updates: Partial<Invoice>) => void;
  lang: Language;
  userId?: string;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, records, onChange, lang, userId, showToast }) => {
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
  const billingProfiles = useBillingProfiles({
    userId,
    refreshKey: invoice.id,
    lang,
    showToast,
  });
  const recordProfiles = useMemo(() => deriveBillingProfilesFromInvoices(records), [records]);
  const mergedProfiles = useMemo(() => {
    const merged = new Map<string, BillingProfile>();

    billingProfiles.profiles.forEach((profile) => {
      merged.set(getBillingProfileLookupKey(profile.kind, profile), profile);
    });

    recordProfiles.forEach((profile) => {
      const key = getBillingProfileLookupKey(profile.kind, profile);
      if (!merged.has(key)) {
        merged.set(key, profile);
      }
    });

    return [...merged.values()];
  }, [billingProfiles.profiles, recordProfiles]);
  const senderProfiles = useMemo(
    () => mergedProfiles.filter((profile) => profile.kind === 'sender'),
    [mergedProfiles]
  );
  const clientProfiles = useMemo(
    () => mergedProfiles.filter((profile) => profile.kind === 'client'),
    [mergedProfiles]
  );
  const copy = lang === 'zh-TW'
    ? {
        bankAddress: '詳細地址',
      }
    : {
        bankAddress: 'Bank Address',
      };

  useEffect(() => {
    if (!invoice.columnConfig) onChange({ columnConfig: DEFAULT_INVOICE_COLUMNS });
  }, [invoice.columnConfig, onChange]);

  useEffect(() => {
    if (!invoice.paymentInfo?.fields) {
      const fields = buildPaymentInfoFields(invoice.paymentInfo, {
        bankName: t.bankName,
        accountName: t.accountName,
        accountNumber: t.accountNumber,
        bankAddress: copy.bankAddress,
        extraInfo: t.extraInfo,
      });

      onChange({ paymentInfo: { fields, qrCode: invoice.paymentInfo?.qrCode } });
    }
  }, [copy.bankAddress, invoice.paymentInfo, onChange, t.accountName, t.accountNumber, t.bankName, t.extraInfo]);

  const columns = getInvoiceColumns(invoice.columnConfig);
  const sortedColumns = getSortedInvoiceColumns(invoice.columnConfig);

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
    onChange({ items: updateInvoiceItem(invoice.items, id, updates) });
  };

  const updateCustomValue = (itemId: string, columnId: string, value: string) => {
    onChange({ items: updateInvoiceItemCustomValue(invoice.items, itemId, columnId, value) });
  };

  const updateItemAmount = (id: string, newAmount: number | string) => {
    onChange({ items: updateInvoiceItemAmount(invoice.items, id, newAmount) });
  };

  const removeItem = (id: string) => onChange({ items: invoice.items.filter(item => item.id !== id) });

  const handleLogoSelect = async (imageData: string) => { setIsUploadingLogo(true); try { onChange({ sender: { ...invoice.sender, logo: imageData } }); } finally { setIsUploadingLogo(false); } };
  const handleLogoRemove = () => onChange({ sender: { ...invoice.sender, logo: undefined } });
  const handleQRCodeSelect = async (imageData: string) => { setIsUploadingQRCode(true); try { onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: imageData } as any }); } finally { setIsUploadingQRCode(false); } };
  const handleQRCodeRemove = () => onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: undefined } as any });
  const handleApplySenderProfile = (profile: BillingProfile) => onChange({ sender: applyBillingProfileToSender(invoice.sender, profile) });
  const handleApplyClientProfile = (profile: BillingProfile) => onChange({ client: applyBillingProfileToClient(invoice.client, profile) });

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
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm" value={item.quantity} onChange={(e) => {
          const nextValue = parseEditableNumberInput(e.target.value);
          if (nextValue !== null) updateItem(item.id, { quantity: nextValue });
        }} placeholder="0" />;
      case 'system-rate':
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm" value={item.rate} onChange={(e) => {
          const nextValue = parseEditableNumberInput(e.target.value);
          if (nextValue !== null) updateItem(item.id, { rate: nextValue });
        }} placeholder="0.00" />;
      case 'system-amount':
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm font-bold " value={item.amount !== undefined && item.amount !== '' ? item.amount : ''} onChange={(e) => {
          const nextValue = parseEditableNumberInput(e.target.value);
          if (nextValue !== null) updateItemAmount(item.id, nextValue);
        }} placeholder="0.00" />;
      case 'custom-text':
        return <textarea ref={autoResizeTextarea} className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm resize-none overflow-hidden" value={item.customValues?.[column.id] || ''} onChange={(e) => updateCustomValue(item.id, column.id, e.target.value)} rows={1} onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }} />;
      case 'custom-number':
        return <input type="text" inputMode="decimal" className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm" value={item.customValues?.[column.id] || ''} onChange={(e) => {
          const nextValue = parseEditableNumberInput(e.target.value);
          if (nextValue !== null) updateCustomValue(item.id, column.id, String(nextValue));
        }} placeholder="0" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <InvoiceDetailsSection invoice={invoice} lang={lang} t={t} onChange={onChange} dateInputRef={dateInputRef} dueDateInputRef={dueDateInputRef} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SenderSection
          invoice={invoice}
          lang={lang}
          t={t}
          onChange={onChange}
          isUploadingLogo={isUploadingLogo}
          onOpenLogoPicker={() => setShowLogoPickerDialog(true)}
          onRemoveLogo={handleLogoRemove}
          profiles={senderProfiles}
          profilesLoading={billingProfiles.isLoading}
          onApplyProfile={handleApplySenderProfile}
        />
        <RecipientSection
          invoice={invoice}
          lang={lang}
          t={t}
          onChange={onChange}
          profiles={clientProfiles}
          profilesLoading={billingProfiles.isLoading}
          onApplyProfile={handleApplyClientProfile}
        />
      </div>
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
        <ItemsSection invoice={invoice} t={t} lang={lang} columns={columns} sortedColumns={sortedColumns} sensors={sensors} focusItemId={focusItemId} showColumnConfig={showColumnConfig} setShowColumnConfig={setShowColumnConfig} onChange={onChange} addItem={addItem} removeItem={removeItem} handleDragEnd={handleDragEnd} renderCell={renderCell} />
        <InvoiceSummarySection invoice={invoice} lang={lang} t={t} onChange={onChange} />
      </div>
      <PaymentInfoSection invoice={invoice} lang={lang} t={t} onChange={onChange} autoResizeTextarea={autoResizeTextarea} showPaymentFieldConfig={showPaymentFieldConfig} setShowPaymentFieldConfig={setShowPaymentFieldConfig} isUploadingQRCode={isUploadingQRCode} onOpenQRCodePicker={() => setShowQRCodePickerDialog(true)} onRemoveQRCode={handleQRCodeRemove} />
      <SignatureSection invoice={invoice} lang={lang} t={t} onChange={onChange} canvasRef={canvasRef} startDrawing={startDrawing} draw={draw} stopDrawing={stopDrawing} signatureInputRef={signatureInputRef} handleSignatureUpload={handleSignatureUpload} clearSignature={clearSignature} />
      <DisclaimerSection invoice={invoice} lang={lang} t={t} onChange={onChange} />

      {userId && showLogoPickerDialog && <ImagePickerDialog isOpen={showLogoPickerDialog} onClose={() => setShowLogoPickerDialog(false)} imageType="logo" onSelect={handleLogoSelect} currentUserId={userId || ''} lang={lang} showToast={showToast} />}
      {userId && showQRCodePickerDialog && <ImagePickerDialog isOpen={showQRCodePickerDialog} onClose={() => setShowQRCodePickerDialog(false)} imageType="qrcode" onSelect={handleQRCodeSelect} currentUserId={userId || ''} lang={lang} showToast={showToast} />}
    </div>
  );
};

export default InvoiceForm;

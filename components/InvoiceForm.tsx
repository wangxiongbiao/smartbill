import React, { useRef, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, DocumentType, Language, CustomField, InvoiceColumn, PaymentInfoField, PaymentInfo } from '../types';
import { translations } from '../i18n';
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
import { saveImageUpload } from '../lib/supabase-images';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
  lang: Language;
  userId?: string;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

// Default payment fields
const defaultPaymentFields: PaymentInfoField[] = [
  { id: 'bankName', label: 'Bank Name', type: 'text', order: 0, visible: true, required: true, value: '' },
  { id: 'accountName', label: 'Account Name', type: 'text', order: 1, visible: true, required: true, value: '' },
  { id: 'accountNumber', label: 'Account Number', type: 'text', order: 2, visible: true, required: true, value: '' },
  { id: 'Additional Info (SWIFT/IBAN)', label: 'Additional Info (SWIFT/IBAN)', type: 'textarea', order: 3, visible: true, required: true, value: '' },
  { id: 'BankAddress', label: 'Bank Address', type: 'textarea', order: 4, visible: true, required: false, value: '' },
];

// Sortable Item Component
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
    position: 'relative' as 'relative', // Type assertion for consistent behavior
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ listeners, attributes })}
    </div>
  );
};

const defaultColumns: InvoiceColumn[] = [
  { id: 'desc', field: 'description', label: 'Description', type: 'system-text', order: 0, visible: true, required: true },
  { id: 'qty', field: 'quantity', label: 'Quantity', type: 'system-quantity', order: 1, visible: true, required: true },
  { id: 'rate', field: 'rate', label: 'Rate', type: 'system-rate', order: 2, visible: true, required: true },
  { id: 'amt', field: 'amount', label: 'Amount', type: 'system-amount', order: 3, visible: true, required: true },
];

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onChange, lang, userId, showToast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
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

  // Initialize columns if not present
  useEffect(() => {
    if (!invoice.columnConfig) {
      onChange({ columnConfig: defaultColumns });
    }
  }, [invoice.columnConfig, onChange]);

  // Migrate and initialize payment fields
  useEffect(() => {
    if (!invoice.paymentInfo?.fields) {
      // Migrate from old structure to new field-based structure
      const oldInfo = invoice.paymentInfo;
      const migratedFields: PaymentInfoField[] = [
        { id: 'bankName', label: t.bankName || 'Bank Name', type: 'text', order: 0, visible: true, required: true, value: oldInfo?.bankName || '' },
        { id: 'accountName', label: t.accountName || 'Account Name', type: 'text', order: 1, visible: true, required: true, value: oldInfo?.accountName || '' },
        { id: 'accountNumber', label: t.accountNumber || 'Account Number', type: 'text', order: 2, visible: true, required: true, value: oldInfo?.accountNumber || '' },
        { id: 'address', label: lang === 'zh-TW' ? '詳細地址' : 'Bank Address', type: 'textarea', order: 3, visible: true, required: true, value: '' },
        { id: 'extraInfo', label: t.extraInfo || 'Additional Info (SWIFT/IBAN)', type: 'textarea', order: 4, visible: true, required: false, value: oldInfo?.extraInfo || '' },
      ];

      // Migrate old custom fields
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
  }, [invoice.paymentInfo, onChange]);

  const columns = invoice.columnConfig || defaultColumns;
  // CHANGED: Show all columns, sorted by order
  const sortedColumns = columns.slice().sort((a, b) => a.order - b.order);

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
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

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
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

    if (!('touches' in e)) {
      e.preventDefault(); // Prevent scrolling on desktop drag
    }

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

  const addItem = () => {
    const id = `item-${Date.now()}`;
    const newItem: InvoiceItem = {
      id,
      description: '',
      quantity: 1,
      rate: '',
      amount: ''
    };
    onChange({ items: [...invoice.items, newItem] });
    setFocusItemId(id);
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    const newItems = invoice.items.map(item => {
      if (item.id !== id) return item;

      const updated = { ...item, ...updates };

      // Auto-calculate amount if qty or rate changed (and amount not explicitly set in updates)
      if (('quantity' in updates || 'rate' in updates) && !('amount' in updates)) {
        if (!String(updated.quantity ?? '') || !String(updated.rate ?? '')) {

          updated.amount = undefined
          return updated;
        }




        const qty = Number(updated.quantity || 0);
        const rate = Number(updated.rate || 0);
        updated.amount = qty * rate;
      }

      return updated;
    });
    onChange({ items: newItems });
  };

  const updateCustomValue = (itemId: string, columnId: string, value: string) => {
    const item = invoice.items.find(i => i.id === itemId);
    if (!item) return;

    const newCustomValues = { ...(item.customValues || {}), [columnId]: value };
    updateItem(itemId, { customValues: newCustomValues });
  };

  // Bidirectional amount calculation handler
  const updateItemAmount = (id: string, newAmount: number | string) => {
    const item = invoice.items.find(i => i.id === id);
    if (!item) return;

    // Allow clearing the amount field - also clear rate
    if (newAmount === '') {
      updateItem(id, { amount: '', rate: '' });
      return;
    }

    const amount = Number(newAmount);
    const qty = item.quantity;
    const rate = item.rate;

    // Scenario 1: Both qty and rate are empty - default qty to 1
    if ((!qty || qty === '') && (!rate || rate === '')) {
      updateItem(id, { quantity: 1, rate: amount, amount });
      return;
    }

    // Scenario 2: Qty filled, rate empty - calculate rate
    if (qty && qty !== '' && (!rate || rate === '')) {
      const numQty = Number(qty);
      const calculatedRate = numQty !== 0 ? amount / numQty : amount;
      updateItem(id, { rate: calculatedRate, amount });
      return;
    }

    // Scenario 3: Rate filled, qty empty - calculate qty
    if ((!qty || qty === '') && rate && rate !== '') {
      const numRate = Number(rate);
      const calculatedQty = numRate !== 0 ? amount / numRate : 1;
      updateItem(id, { quantity: calculatedQty, amount });
      return;
    }

    // Scenario 4: Both filled - recalculate rate
    if (qty && qty !== '' && rate && rate !== '') {
      const numQty = Number(qty);
      const calculatedRate = numQty !== 0 ? amount / numQty : amount;
      updateItem(id, { rate: calculatedRate, amount });
      return;
    }

    // Default: just update amount
    updateItem(id, { amount });
  };

  const removeItem = (id: string) => {
    onChange({ items: invoice.items.filter(item => item.id !== id) });
  };

  const handleLogoSelect = async (imageData: string) => {
    setIsUploadingLogo(true);
    try {
      onChange({ sender: { ...invoice.sender, logo: imageData } });

      // Note: ImagePickerDialog already saves new uploads to database
      // No need to save again here - just update the form state
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoRemove = () => {
    onChange({ sender: { ...invoice.sender, logo: undefined } });
  };

  const handleQRCodeSelect = async (imageData: string) => {
    setIsUploadingQRCode(true);
    try {
      onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: imageData } as any });

      // Note: ImagePickerDialog already saves new uploads to database
      // No need to save again here - just update the form state
    } finally {
      setIsUploadingQRCode(false);
    }
  };

  const handleQRCodeRemove = () => {
    onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: undefined } as any });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ sender: { ...invoice.sender, signature: reader.result as string } });
        // Clear canvas if there was hand-drawn signature
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to handle number input with regex validation
  const handleNumberInput = (value: string, callback: (val: string | number) => void) => {
    // Allow empty string
    if (value === '' || !value) {
      callback('');
      return;
    }

    // Allow only numbers, decimal point, and negative sign at start
    // Pattern: optional negative, digits, optional decimal and more digits
    const numberRegex = /^-?\d*\.?\d*$/;

    if (numberRegex.test(value)) {
      // If it's a valid partial number (like "5." or "-." or "-"), keep as string
      // Otherwise convert to number
      if (value === '-' || value === '.' || value === '-.' || value.endsWith('.')) {
        callback(value);
      } else {
        callback(Number(value));
      }
    }
    // If invalid, don't update (silently reject invalid input)
  };

  // Helper function to auto-resize textarea on mount and input
  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
    switch (column.type) {
      case 'system-text': // Description
        return (
          <textarea
            ref={autoResizeTextarea}
            placeholder={column.label}
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm resize-none overflow-hidden"
            value={item.description}
            autoFocus={item.id === focusItemId}
            onChange={(e) => updateItem(item.id, { description: e.target.value })}
            rows={1}
            onInput={(e) => {
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
            }}
          />
        );
      case 'system-quantity':
        return (
          <input
            type="text"
            inputMode="decimal"
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
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
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
            value={item.rate}
            onChange={(e) => handleNumberInput(e.target.value, (val) => updateItem(item.id, { rate: val }))}
            placeholder="0.00"
          />
        );
      case 'system-amount':
        // Display the amount field value, or empty string if not set
        const displayAmount = item.amount !== undefined && item.amount !== ''
          ? item.amount
          : '';

        return (
          <input
            type="text"
            inputMode="decimal"
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm font-bold "
            value={displayAmount}
            onChange={(e) => handleNumberInput(e.target.value, (val) => updateItemAmount(item.id, val))}
            placeholder="0.00"
          />
        );
      case 'custom-text':
        return (
          <textarea
            ref={autoResizeTextarea}
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm resize-none overflow-hidden"
            value={item.customValues?.[column.id] || ''}
            onChange={(e) => updateCustomValue(item.id, column.id, e.target.value)}
            rows={1}
            onInput={(e) => {
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
            }}
          />
        );
      case 'custom-number':
        return (
          <input
            type="text"
            inputMode="decimal"
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
            value={item.customValues?.[column.id] || ''}
            onChange={(e) => handleNumberInput(e.target.value, (val) => updateCustomValue(item.id, column.id, String(val)))}
            placeholder="0"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {(['invoice', 'receipt'] as DocumentType[]).map((type) => (
          <button
            key={type}
            onClick={() => onChange({ type })}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${invoice.type === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {type === 'invoice' ? t.invoiceMode : t.receiptMode}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Invoice Number */}
        <div className="space-y-2 relative group">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              {invoice.type === 'invoice' ? t.invNo : t.recNo}
            </label>
            <button
              onClick={() => onChange({ visibility: { ...invoice.visibility, invoiceNumber: !invoice.visibility?.invoiceNumber } })}
              className={`text-xs ${invoice.visibility?.invoiceNumber === false ? 'text-red-400' : 'text-slate-400 hover:text-blue-500'}`}
              title={t.visibility}
            >
              <i className={`fas fa-eye${invoice.visibility?.invoiceNumber === false ? '-slash' : ''}`}></i>
            </button>
          </div>
          <input
            type="text"
            value={invoice.invoiceNumber}
            onChange={(e) => onChange({ invoiceNumber: e.target.value })}
            className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 ${invoice.visibility?.invoiceNumber === false ? 'opacity-50' : ''}`}
          />
        </div>

        {/* Currency & Dates */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{t.currency}</label>
          <select
            value={invoice.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <optgroup label="亚洲 Asia">
              <option value="CNY">🇨🇳 CNY ¥ 中国</option>
              <option value="JPY">🇯🇵 JPY ¥ 日本</option>
              <option value="HKD">🇭🇰 HKD $ 中国香港</option>
              <option value="TWD">🇹🇼 TWD $ 中国台灣</option>
              <option value="KRW">🇰🇷 KRW ₩ 한국</option>
            </optgroup>
            <optgroup label="东南亚 Southeast Asia">
              <option value="SGD">🇸🇬 SGD $ Singapore</option>
              <option value="MYR">🇲🇾 MYR RM Malaysia</option>
              <option value="THB">🇹🇭 THB ฿ ประเทศไทย</option>
              <option value="PHP">🇵🇭 PHP ₱ Pilipinas</option>
              <option value="VND">🇻🇳 VND ₫ Việt Nam</option>
              <option value="IDR">🇮🇩 IDR Rp Indonesia</option>
            </optgroup>
            <optgroup label="北美洲 North America">
              <option value="USD">🇺🇸 USD $ United States</option>
            </optgroup>
            <optgroup label="欧洲 Europe">
              <option value="EUR">🇪🇺 EUR € Europe</option>
              <option value="GBP">🇬🇧 GBP £ United Kingdom</option>
            </optgroup>
            <optgroup label="大洋洲 Oceania">
              <option value="AUD">🇦🇺 AUD $ Australia</option>
              <option value="NZD">🇳🇿 NZD $ New Zealand</option>
            </optgroup>
          </select>
        </div>

        {/* Date Visibility Controls - Available for all modes */}
        {/* Date Visibility Controls - Available for all modes */}
        <div className="col-span-full flex flex-wrap gap-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
          {/* Invoice Date */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={invoice.visibility?.date !== false}
                onChange={() => onChange({ visibility: { ...invoice.visibility, date: !invoice.visibility?.date } })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">{t.invoiceDate}</span>
            </label>
            <div className="relative flex items-center">
              <button
                onClick={() => dateInputRef.current?.showPicker()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
              >
                <i className="fas fa-calendar-alt text-slate-400"></i>
                <span>{invoice.date}</span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={invoice.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={invoice.visibility?.dueDate !== false}
                onChange={() => onChange({ visibility: { ...invoice.visibility, dueDate: !invoice.visibility?.dueDate } })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">{t.dueDate}</span>
            </label>
            <div className="relative flex items-center">
              <button
                onClick={() => dueDateInputRef.current?.showPicker()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
              >
                <i className="fas fa-calendar-alt text-slate-400"></i>
                <span>{invoice.dueDate}</span>
              </button>
              <input
                ref={dueDateInputRef}
                type="date"
                value={invoice.dueDate}
                onChange={(e) => onChange({ dueDate: e.target.value })}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-t border-slate-100">
        {/* Bill From */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.billFrom}</h3>

          {/* Logo Upload Area */}
          {isUploadingLogo ? (
            <div className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <i className="fas fa-circle-notch fa-spin text-2xl"></i>
                <span className="text-xs font-medium">{t.uploadingImage}</span>
              </div>
            </div>
          ) : !invoice.sender.logo ? (
            <button
              onClick={() => setShowLogoPickerDialog(true)}
              className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600">
                <i className="fas fa-image text-2xl"></i>
                <span className="text-xs font-medium">{t.logoUp}</span>
              </div>
            </button>
          ) : (
            <div className="relative group">
              <div className="w-full flex justify-center items-center border-2 border-slate-200 h-[140px] rounded-lg bg-slate-50">
                <img
                  src={invoice.sender.logo}
                  alt="Logo"
                  className="w-full h-24 object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setShowLogoPickerDialog(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-sync-alt mr-1"></i>
                  {t.logoUp?.replace('上傳', '更換').replace('Upload', 'Change') || 'Change'}
                </button>
                <button
                  onClick={handleLogoRemove}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-trash mr-1"></i>
                  {t.removeLogo?.split(' ')[0] || 'Remove'}
                </button>
              </div>
            </div>
          )}

          <input
            placeholder={t.namePlaceholder}
            value={invoice.sender.name}
            onChange={(e) => onChange({ sender: { ...invoice.sender, name: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />
          <textarea
            placeholder={t.addrPlaceholder}
            value={invoice.sender.address}
            onChange={(e) => onChange({ sender: { ...invoice.sender, address: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none"
          />
          <input
            placeholder="Phone (Optional)"
            value={invoice.sender.phone || ''}
            onChange={(e) => onChange({ sender: { ...invoice.sender, phone: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />
          <input
            placeholder="Email (Optional)"
            value={invoice.sender.email || ''}
            onChange={(e) => onChange({ sender: { ...invoice.sender, email: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />



          {/* Custom Fields for Sender - Available for all modes */}
          <div className="space-y-2 mt-2">
            {invoice.sender.customFields?.map((field, index) => (
              <div key={field.id} className="space-y-2 relative">
                <div className="flex gap-2 items-center">
                  <input
                    placeholder={t.fieldName}
                    value={field.label}
                    onChange={(e) => {
                      const newFields = [...(invoice.sender.customFields || [])];
                      newFields[index] = { ...field, label: e.target.value };
                      onChange({ sender: { ...invoice.sender, customFields: newFields } });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const newFields = invoice.sender.customFields?.filter(f => f.id !== field.id);
                      onChange({ sender: { ...invoice.sender, customFields: newFields } });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <textarea
                  placeholder={t.fieldValue}
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...(invoice.sender.customFields || [])];
                    newFields[index] = { ...field, value: e.target.value };
                    onChange({ sender: { ...invoice.sender, customFields: newFields } });
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newField: CustomField = { id: `field-${Date.now()}`, label: '', value: '' };
                onChange({ sender: { ...invoice.sender, customFields: [...(invoice.sender.customFields || []), newField] } });
              }}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              + {t.addCustomField}
            </button>
          </div>
        </div>

        {/* Bill To */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.billTo}</h3>
          <input
            placeholder={t.clientName}
            value={invoice.client.name}
            onChange={(e) => onChange({ client: { ...invoice.client, name: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />
          <textarea
            placeholder={t.clientAddr}
            value={invoice.client.address}
            onChange={(e) => onChange({ client: { ...invoice.client, address: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none"
          />
          <input
            placeholder="Phone (Optional)"
            value={invoice.client.phone || ''}
            onChange={(e) => onChange({ client: { ...invoice.client, phone: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />
          <input
            placeholder="Email (Optional)"
            value={invoice.client.email || ''}
            onChange={(e) => onChange({ client: { ...invoice.client, email: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />

          {/* Custom Fields for Client - Available for all modes */}
          <div className="space-y-2 mt-2">
            {invoice.client.customFields?.map((field, index) => (
              <div key={field.id} className="space-y-2 relative">
                <div className="flex gap-2 items-center">
                  <input
                    placeholder={t.fieldName}
                    value={field.label}
                    onChange={(e) => {
                      const newFields = [...(invoice.client.customFields || [])];
                      newFields[index] = { ...field, label: e.target.value };
                      onChange({ client: { ...invoice.client, customFields: newFields } });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const newFields = invoice.client.customFields?.filter(f => f.id !== field.id);
                      onChange({ client: { ...invoice.client, customFields: newFields } });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <textarea
                  placeholder={t.fieldValue}
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...(invoice.client.customFields || [])];
                    newFields[index] = { ...field, value: e.target.value };
                    onChange({ client: { ...invoice.client, customFields: newFields } });
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newField: CustomField = { id: `field-${Date.now()}`, label: '', value: '' };
                onChange({ client: { ...invoice.client, customFields: [...(invoice.client.customFields || []), newField] } });
              }}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              + {t.addCustomField}
            </button>
          </div>
        </div>

        {/* Payment Info */}

      </section>

      <section className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center relative">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.items}</h3>
          <button
            onClick={() => setShowColumnConfig(!showColumnConfig)}
            className="text-slate-400 hover:text-blue-600 transition-colors"
            title={t.customizeColumns}
          >
            <i className="fas fa-cog"></i>
          </button>

          {showColumnConfig && (
            <ColumnConfigurator
              columns={columns}
              onChange={(newCols) => onChange({ columnConfig: newCols })}
              onClose={() => setShowColumnConfig(false)}
              lang={lang}
            />
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={invoice.items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {invoice.items.map((item) => {
                // In form area, show ALL columns regardless of visibility
                // Visibility only affects the preview
                const systemColumns = sortedColumns.filter(col => col.type.startsWith('system-'));
                const customColumns = sortedColumns.filter(col => col.type.startsWith('custom-'));

                return (
                  <SortableItem key={item.id} id={item.id}>
                    {({ listeners }) => (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 select-none touch-manipulation">
                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <div
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 pt-2"
                          >
                            <i className="fas fa-grip-vertical"></i>
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 space-y-3">
                            {/* System Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {systemColumns.map(col => {
                                return (
                                  <div key={col.id}>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block flex items-center gap-1">
                                      {col.label}
                                      {!col.visible && (
                                        <i className="fas fa-eye-slash text-[8px] opacity-50" title="Hidden in preview"></i>
                                      )}
                                    </label>
                                    {renderCell(item, col)}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Custom Fields Grid */}
                            {customColumns.length > 0 && (
                              <div className="pt-3 border-t border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {customColumns.map(col => (
                                    <div key={col.id}>
                                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block flex items-center gap-1">
                                        {col.label}
                                        {!col.visible && (
                                          <i className="fas fa-eye-slash text-[8px] opacity-50" title="Hidden in preview"></i>
                                        )}
                                      </label>
                                      {renderCell(item, col)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                            className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all font-bold text-sm">
          {t.addItems}
        </button>
      </section>




      <section className="pt-4 border-t border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">{t.taxRate}</span>
          <input type="number" className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg text-right text-sm" value={invoice.taxRate} onChange={(e) => onChange({ taxRate: Number(e.target.value) })} />
        </div>

        <div className="bg-blue-600 p-4 rounded-xl text-white flex justify-between items-center">
          <span className="font-bold uppercase text-xs">{t.payable}</span>
          <span className="text-2xl font-black">
            {new Intl.NumberFormat(lang, { style: 'currency', currency: invoice.currency }).format(
              invoice.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0) * (1 + invoice.taxRate / 100)
            )}
          </span>
        </div>

        {/* QR Code Upload Area */}
        <div className="col-span-full">
          <div className="flex justify-between items-center mb-3 relative">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.paymentInfo}</h3>
              <button
                onClick={() => onChange({ visibility: { ...invoice.visibility, paymentInfo: !invoice.visibility?.paymentInfo } })}
                className={`text-xs ${invoice.visibility?.paymentInfo === true ? 'text-blue-600' : 'text-slate-300'}`}
                title={t.visibility}
              >
                <i className={`fas fa-toggle-${invoice.visibility?.paymentInfo === true ? 'on' : 'off'} text-lg`}></i>
              </button>
            </div>

            {invoice.visibility?.paymentInfo === true && (
              <button
                onClick={() => setShowPaymentFieldConfig(!showPaymentFieldConfig)}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title={t.configurePaymentFields || 'Configure Payment Fields'}
              >
                <i className="fas fa-cog"></i>
              </button>
            )}

            {showPaymentFieldConfig && invoice.paymentInfo?.fields && (
              <PaymentFieldConfigurator
                fields={invoice.paymentInfo.fields}
                onChange={(newFields) => {
                  onChange({ paymentInfo: { ...invoice.paymentInfo, fields: newFields } });
                }}
                onClose={() => setShowPaymentFieldConfig(false)}
                lang={lang}
              />
            )}
          </div>

          {invoice.visibility?.paymentInfo === true && (
            <>
              {isUploadingQRCode ? (
                <div className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 mb-4">
                  <div className="flex flex-col items-center gap-2 text-blue-600">
                    <i className="fas fa-circle-notch fa-spin text-2xl"></i>
                    <span className="text-xs font-medium">{t.uploadingImage}</span>
                  </div>
                </div>
              ) : !invoice.paymentInfo?.qrCode ? (
                <button
                  onClick={() => setShowQRCodePickerDialog(true)}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group mb-4"
                >
                  <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600">
                    <i className="fas fa-qrcode text-2xl"></i>
                    <span className="text-xs font-medium">{t.uploadQR || 'Upload QR Code'}</span>
                  </div>
                </button>
              ) : (
                <div className="relative group mb-4">
                  <div className="w-full p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                    <img
                      src={invoice.paymentInfo.qrCode}
                      alt="QR Code"
                      className="w-full h-40 object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setShowQRCodePickerDialog(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-sync-alt mr-1"></i>
                      {t.uploadQR?.replace('上傳', '更換').replace('Upload', 'Change') || 'Change'}
                    </button>
                    <button
                      onClick={handleQRCodeRemove}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      {t.removeQR?.split(' ')[0] || 'Remove'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invoice.paymentInfo?.fields
                  ?.filter(f => f.visible)
                  ?.sort((a, b) => a.order - b.order)
                  ?.map((field) => {
                    const updateFieldValue = (value: string) => {
                      const newFields = invoice.paymentInfo?.fields?.map(f =>
                        f.id === field.id ? { ...f, value } : f
                      ) || [];
                      onChange({ paymentInfo: { ...invoice.paymentInfo, fields: newFields } });
                    };

                    return (
                      <div key={field.id}>
                        {field.type === 'textarea' ? (
                          <textarea
                            ref={autoResizeTextarea}
                            placeholder={field.label}
                            value={field.value}
                            onChange={(e) => updateFieldValue(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none overflow-hidden text-sm"
                            rows={1}
                            onInput={(e) => {
                              e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                            }}
                          />
                        ) : (
                          <textarea
                            ref={autoResizeTextarea}
                            placeholder={field.label}
                            value={field.value}
                            onChange={(e) => updateFieldValue(e.target.value)}
                            className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none overflow-hidden text-sm ${field.id === 'accountNumber' ? 'font-mono' : ''}`}
                            rows={1}
                            onInput={(e) => {
                              e.currentTarget.style.height = 'auto';
                              e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                }
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.signature}</h3>
              <button
                onClick={() => onChange({ visibility: { ...invoice.visibility, signature: !invoice.visibility?.signature } })}
                className={`text-xs ${invoice.visibility?.signature === true ? 'text-blue-600' : 'text-slate-300'}`}
                title={t.visibility}
              >
                <i className={`fas fa-toggle-${invoice.visibility?.signature === true ? 'on' : 'off'} text-lg`}></i>
              </button>
            </div>
            {invoice.visibility?.signature === true && (
              <div className="flex gap-2 items-center">
                <input type="file" ref={signatureInputRef} onChange={handleSignatureUpload} accept="image/*" className="hidden" id="signature-upload" />
                <label htmlFor="signature-upload" className="text-[10px] font-bold text-indigo-600 uppercase hover:underline cursor-pointer">📤 Upload</label>
                <button onClick={clearSignature} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">{t.signClear}</button>
              </div>
            )}
          </div>

          {invoice.visibility?.signature === true && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative animate-in slide-in-from-top-2 duration-200">
              <canvas ref={canvasRef} width={1000} height={400} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-[200px] cursor-crosshair touch-none" />
              {!invoice.sender.signature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">{t.signPlaceholder}</div>}
            </div>
          )}
        </div>

        {/* Disclaimer Text */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.disclaimerText || 'Disclaimer / Notice'}</h3>
              <button
                onClick={() => onChange({ visibility: { ...invoice.visibility, disclaimer: invoice.visibility?.disclaimer === false } })}
                className={`text-xs ${invoice.visibility?.disclaimer !== false ? 'text-blue-600' : 'text-slate-300'}`}
                title={t.visibility}
              >
                <i className={`fas fa-toggle-${invoice.visibility?.disclaimer !== false ? 'on' : 'off'} text-lg`}></i>
              </button>
            </div>
          </div>

          {invoice.visibility?.disclaimer !== false && (
            <textarea
              placeholder="e.g., This is a computer generated document and no signature is required."
              value={invoice.sender.disclaimerText || ''}
              onChange={(e) => onChange({ sender: { ...invoice.sender, disclaimerText: e.target.value } })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none"
            />
          )}
        </div>


      </section >

      {/* Image Picker Dialogs */}
      {
        userId && showLogoPickerDialog && (
          <ImagePickerDialog
            isOpen={showLogoPickerDialog}
            onClose={() => setShowLogoPickerDialog(false)}
            imageType="logo"
            onSelect={handleLogoSelect}
            currentUserId={userId || ''}
            lang={lang}
            showToast={showToast}
          />
        )
      }

      {
        userId && showQRCodePickerDialog && (
          <ImagePickerDialog
            isOpen={showQRCodePickerDialog}
            onClose={() => setShowQRCodePickerDialog(false)}
            imageType="qrcode"
            onSelect={handleQRCodeSelect}
            currentUserId={userId || ''}
            lang={lang}
            showToast={showToast}
          />
        )
      }

    </div >
  );
};

export default InvoiceForm;

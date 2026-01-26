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

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
  lang: Language;
}

// Default payment fields
const defaultPaymentFields: PaymentInfoField[] = [
  { id: 'bankName', label: 'Bank Name', type: 'text', order: 0, visible: true, required: true, value: '' },
  { id: 'accountName', label: 'Account Name', type: 'text', order: 1, visible: true, required: true, value: '' },
  { id: 'accountNumber', label: 'Account Number', type: 'text', order: 2, visible: true, required: true, value: '' },
  { id: 'address', label: 'Address', type: 'textarea', order: 3, visible: true, required: true, value: '' },
  { id: 'extraInfo', label: 'Extra Info', type: 'textarea', order: 4, visible: true, required: false, value: '' },
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

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onChange, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [showPaymentFieldConfig, setShowPaymentFieldConfig] = useState(false);
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
        { id: 'bankName', label: 'Bank Name', type: 'text', order: 0, visible: true, required: true, value: oldInfo?.bankName || '' },
        { id: 'accountName', label: 'Account Name', type: 'text', order: 1, visible: true, required: true, value: oldInfo?.accountName || '' },
        { id: 'accountNumber', label: 'Account Number', type: 'text', order: 2, visible: true, required: true, value: oldInfo?.accountNumber || '' },
        { id: 'address', label: 'Address', type: 'textarea', order: 3, visible: true, required: true, value: '' },
        { id: 'extraInfo', label: 'Extra Info', type: 'textarea', order: 4, visible: true, required: false, value: oldInfo?.extraInfo || '' },
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
      quantity: '',
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ sender: { ...invoice.sender, logo: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    onChange({ sender: { ...invoice.sender, logo: undefined } });
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQRCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: reader.result as string } as any });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQRCodeRemove = () => {
    onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: undefined } as any });
    // Reset file input
    if (qrInputRef.current) {
      qrInputRef.current.value = '';
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
        {(['invoice', 'receipt', 'custom'] as DocumentType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              if (type === 'custom') {
                onChange({
                  type,
                  visibility: {
                    ...invoice.visibility,
                    dueDate: false
                  }
                });
              } else {
                onChange({ type });
              }
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${invoice.type === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {type === 'invoice' ? t.invoiceMode : (type === 'receipt' ? t.receiptMode : t.customMode)}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Invoice Number */}
        <div className="space-y-2 relative group">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              {invoice.type === 'invoice' ? t.invNo : (invoice.type === 'receipt' ? t.recNo : `${t.invNo}/${t.recNo}`)}
            </label>
            {invoice.type === 'custom' && (
              <button
                onClick={() => onChange({ visibility: { ...invoice.visibility, invoiceNumber: !invoice.visibility?.invoiceNumber } })}
                className={`text-xs ${invoice.visibility?.invoiceNumber === false ? 'text-red-400' : 'text-slate-400 hover:text-blue-500'}`}
                title={t.visibility}
              >
                <i className={`fas fa-eye${invoice.visibility?.invoiceNumber === false ? '-slash' : ''}`}></i>
              </button>
            )}
          </div>
          <input
            type="text"
            value={invoice.invoiceNumber}
            onChange={(e) => onChange({ invoiceNumber: e.target.value })}
            className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 ${invoice.type === 'custom' && invoice.visibility?.invoiceNumber === false ? 'opacity-50' : ''}`}
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
            <optgroup label="🌏 东亚 East Asia">
              <option value="CNY">🇨🇳 CNY ¥ 人民币</option>
              <option value="JPY">🇯🇵 JPY ¥ 日元</option>
              <option value="HKD">🇭🇰 HKD $ 港币</option>
              <option value="TWD">🇹🇼 TWD $ 台币</option>
              <option value="KRW">🇰🇷 KRW ₩ 韩元</option>
            </optgroup>
            <optgroup label="🌴 东南亚 Southeast Asia">
              <option value="SGD">🇸🇬 SGD $ 新加坡元</option>
              <option value="MYR">🇲🇾 MYR RM 马来西亚令吉</option>
              <option value="THB">🇹🇭 THB ฿ 泰铢</option>
              <option value="PHP">🇵🇭 PHP ₱ 菲律宾比索</option>
              <option value="VND">🇻🇳 VND ₫ 越南盾</option>
              <option value="IDR">🇮🇩 IDR Rp 印尼盾</option>
            </optgroup>
            <optgroup label="🌎 北美洲 North America">
              <option value="USD">🇺🇸 USD $ 美元</option>
            </optgroup>
            <optgroup label="🌍 欧洲 Europe">
              <option value="EUR">🇪🇺 EUR € 欧元</option>
              <option value="GBP">🇬🇧 GBP £ 英镑</option>
            </optgroup>
            <optgroup label="🌏 大洋洲 Oceania">
              <option value="AUD">🇦🇺 AUD $ 澳元</option>
              <option value="NZD">🇳🇿 NZD $ 纽元</option>
            </optgroup>
          </select>
        </div>

        {/* Custom Mode: Date Visibility */}
        {invoice.type === 'custom' && (
          <div className="col-span-full flex gap-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={invoice.visibility?.date !== false}
                onChange={() => onChange({ visibility: { ...invoice.visibility, date: !invoice.visibility?.date } })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              {t.fieldName || 'Date'} {t.visibility}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={invoice.visibility?.dueDate !== false}
                onChange={() => onChange({ visibility: { ...invoice.visibility, dueDate: !invoice.visibility?.dueDate } })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              {t.fieldName || 'Due Date'} {t.visibility}
            </label>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-t border-slate-100">
        {/* Bill From */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.billFrom}</h3>
            <div className="flex gap-2 items-center">
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" id="logo-up" />
              <label htmlFor="logo-up" className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">{t.logoUp}</label>
              {invoice.sender.logo && (
                <button
                  onClick={handleLogoRemove}
                  className="text-xs text-red-600 font-medium hover:underline"
                  title={t.removeLogo || 'Remove Logo'}
                >
                  {t.removeLogo || '✕ Remove'}
                </button>
              )}
            </div>
          </div>
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

          {/* Custom Fields for Sender */}
          {invoice.type === 'custom' && (
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
          )}
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

          {/* Custom Fields for Client */}
          {invoice.type === 'custom' && (
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
          )}
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
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                              {systemColumns.map(col => {
                                let colSpan = 'md:col-span-3';
                                if (col.type === 'system-text') colSpan = 'md:col-span-6';
                                if (col.type === 'system-amount') colSpan = 'md:col-span-3';

                                return (
                                  <div key={col.id} className={colSpan}>
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

        <div className="space-y-4 col-span-full pt-4 border-t border-slate-100">
          <div className="flex justify-between items-start relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.paymentInfo}</h3>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowPaymentFieldConfig(!showPaymentFieldConfig)}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title={t.configurePaymentFields || 'Configure Payment Fields'}
              >
                <i className="fas fa-cog"></i>
              </button>
              <input type="file" ref={qrInputRef} onChange={handleQRCodeUpload} accept="image/*" className="hidden" id="qr-upload" />
              <label htmlFor="qr-upload" className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                {t.uploadQR || 'Upload QR Code'}
              </label>
              {invoice.paymentInfo?.qrCode && (
                <button
                  onClick={handleQRCodeRemove}
                  className="text-xs text-red-600 font-medium hover:underline"
                  title={t.removeQR || 'Remove QR Code'}
                >
                  {t.removeQR || '✕ Remove'}
                </button>
              )}
            </div>

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
              <button onClick={clearSignature} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">{t.signClear}</button>
            )}
          </div>

          {invoice.visibility?.signature === true && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative animate-in slide-in-from-top-2 duration-200">
              <canvas ref={canvasRef} width={1000} height={400} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-[200px] cursor-crosshair touch-none" />
              {!invoice.sender.signature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">{t.signPlaceholder}</div>}
            </div>
          )}
        </div>


      </section>


    </div>
  );
};

export default InvoiceForm;

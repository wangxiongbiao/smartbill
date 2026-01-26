import React, { useRef, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, DocumentType, Language, CustomField, InvoiceColumn } from '../types';
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

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
  lang: Language;
}

// Sortable Item Component
const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const t = translations[lang] || translations['en'];

  // Initialize columns if not present
  useEffect(() => {
    if (!invoice.columnConfig) {
      onChange({ columnConfig: defaultColumns });
    }
  }, [invoice.columnConfig, onChange]);

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
      rate: ''
    };
    onChange({ items: [...invoice.items, newItem] });
    setFocusItemId(id);
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    const newItems = invoice.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange({ items: newItems });
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

  const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
    switch (column.type) {
      case 'system-text': // Description
        return (
          <div className="flex justify-between gap-2 w-full">
            <input
              placeholder={column.label}
              className="flex-1 bg-transparent font-medium w-full"
              value={item.description}
              autoFocus={item.id === focusItemId}
              onChange={(e) => updateItem(item.id, { description: e.target.value })}
            />
            <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="text-slate-300 hover:text-red-500 p-1">
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        );
      case 'system-quantity':
        return (
          <input
            type="number"
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
            value={item.quantity}
            onChange={(e) => updateItem(item.id, { quantity: e.target.value === '' ? '' : Number(e.target.value) })}
          />
        );
      case 'system-rate':
        return (
          <input
            type="number"
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
            value={item.rate}
            onChange={(e) => updateItem(item.id, { rate: e.target.value === '' ? '' : Number(e.target.value) })}
          />
        );
      case 'system-amount':
        return (
          <div className="font-bold py-1 text-right">
            {(Number(item.quantity || 0) * Number(item.rate || 0)).toFixed(2)}
          </div>
        );
      case 'custom-text':
      case 'custom-number':
        return (
          <input
            type={column.type === 'custom-number' ? 'number' : 'text'}
            className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
            value={item.customValues?.[column.id] || ''}
            onChange={(e) => updateCustomValue(item.id, column.id, e.target.value)}
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
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" id="logo-up" />
            <label htmlFor="logo-up" className="text-xs text-blue-600 font-medium cursor-pointer">{t.logoUp}</label>
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
                <div key={field.id} className="flex gap-4 items-start">
                  <input
                    placeholder={t.fieldName}
                    value={field.label}
                    onChange={(e) => {
                      const newFields = [...(invoice.sender.customFields || [])];
                      newFields[index] = { ...field, label: e.target.value };
                      onChange({ sender: { ...invoice.sender, customFields: newFields } });
                    }}
                    className="w-1/3 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
                  />
                  <input
                    placeholder={t.fieldValue}
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...(invoice.sender.customFields || [])];
                      newFields[index] = { ...field, value: e.target.value };
                      onChange({ sender: { ...invoice.sender, customFields: newFields } });
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
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
                <div key={field.id} className="flex gap-4 items-start">
                  <input
                    placeholder={t.fieldName}
                    value={field.label}
                    onChange={(e) => {
                      const newFields = [...(invoice.client.customFields || [])];
                      newFields[index] = { ...field, label: e.target.value };
                      onChange({ client: { ...invoice.client, customFields: newFields } });
                    }}
                    className="w-1/3 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
                  />
                  <input
                    placeholder={t.fieldValue}
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...(invoice.client.customFields || [])];
                      newFields[index] = { ...field, value: e.target.value };
                      onChange({ client: { ...invoice.client, customFields: newFields } });
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
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
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex gap-4 px-3 py-1">
                {sortedColumns.map(col => (
                  <div
                    key={col.id}
                    className={`${col.type === 'system-text' ? 'flex-1' : 'w-24'} text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${col.type === 'system-amount' ? 'justify-end' : ''} ${col.visible ? 'text-slate-400' : 'text-slate-300'}`}
                  >
                    {!col.visible && <i className="fas fa-eye-slash text-[10px]"></i>}
                    {col.label}
                  </div>
                ))}
              </div>

              {invoice.items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 select-none touch-manipulation items-center">
                    {sortedColumns.map(col => (
                      <div key={col.id} className={`${col.type === 'system-text' ? 'flex-1' : 'w-24'} ${!col.visible ? 'opacity-40 grayscale' : ''}`}>
                        {renderCell(item, col)}
                      </div>
                    ))}
                  </div>
                </SortableItem>
              ))}
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.paymentInfo}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder={t.bankName}
              value={invoice.paymentInfo?.bankName || ''}
              onChange={(e) => onChange({ paymentInfo: { ...invoice.paymentInfo, bankName: e.target.value } as any })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <input
              placeholder={t.accountName}
              value={invoice.paymentInfo?.accountName || ''}
              onChange={(e) => onChange({ paymentInfo: { ...invoice.paymentInfo, accountName: e.target.value } as any })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <input
              placeholder={t.accountNumber}
              value={invoice.paymentInfo?.accountNumber || ''}
              onChange={(e) => onChange({ paymentInfo: { ...invoice.paymentInfo, accountNumber: e.target.value } as any })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
            <input
              placeholder={t.extraInfo}
              value={invoice.paymentInfo?.extraInfo || ''}
              onChange={(e) => onChange({ paymentInfo: { ...invoice.paymentInfo, extraInfo: e.target.value } as any })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          {/* Custom Fields for Payment Info */}
          <div className="space-y-2 mt-2">
            {invoice.paymentInfo?.customFields?.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <input
                  placeholder={t.fieldName}
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...(invoice.paymentInfo?.customFields || [])];
                    newFields[index] = { ...field, label: e.target.value };
                    onChange({ paymentInfo: { ...invoice.paymentInfo, customFields: newFields } as any });
                  }}
                  className="w-1/3 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
                />
                <input
                  placeholder={t.fieldValue}
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...(invoice.paymentInfo?.customFields || [])];
                    newFields[index] = { ...field, value: e.target.value };
                    onChange({ paymentInfo: { ...invoice.paymentInfo, customFields: newFields } as any });
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
                />
                <button
                  onClick={() => {
                    const newFields = invoice.paymentInfo?.customFields?.filter(f => f.id !== field.id);
                    onChange({ paymentInfo: { ...invoice.paymentInfo, customFields: newFields } as any });
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newField: CustomField = { id: `field-${Date.now()}`, label: '', value: '' };
                const currentFields = invoice.paymentInfo?.customFields || [];
                onChange({ paymentInfo: { ...invoice.paymentInfo, customFields: [...currentFields, newField] } as any });
              }}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              + {t.addCustomField}
            </button>
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

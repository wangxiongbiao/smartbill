'use client';

import React from 'react';
import { Invoice, TemplateType, Language, InvoiceColumn, InvoiceItem } from '../types';
import { translations } from '../i18n';
import EditableTextValue from './preview-editable/EditableTextValue';
import EditableNumberValue from './preview-editable/EditableNumberValue';
import EditableDateValue from './preview-editable/EditableDateValue';
import {
  calculateInvoiceTotals,
  getInvoiceColumns,
  parseEditableNumberInput,
  updateInvoiceItem,
  updateInvoiceItemAmount,
} from '@/lib/invoice';
import {
  InvoicePreviewBody,
  InvoicePreviewCopy,
  InvoicePreviewFooter,
  InvoicePreviewHeader,
} from '@/components/invoice-preview/InvoicePreviewSections';

interface InvoicePreviewProps {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed?: boolean;
  isForPdf?: boolean;
  lang: Language;
  editable?: boolean;
  onChange?: (updates: Partial<Invoice>) => void;
}

const copyByLang = {
  en: {
    addPhone: 'Add phone',
    addEmail: 'Add email',
    addValue: 'Add value',
    addDisclaimer: 'Add disclaimer',
    paymentQrCode: 'Payment QR Code',
    signatureAlt: 'Signature',
    logoAlt: 'Logo',
    subtotal: 'Subtotal',
  },
  'zh-CN': {
    addPhone: '添加电话',
    addEmail: '添加电子邮箱',
    addValue: '添加内容',
    addDisclaimer: '添加免责声明',
    paymentQrCode: '付款 QR Code',
    signatureAlt: '签名',
    logoAlt: 'Logo',
    subtotal: '小计',
  },
  'zh-TW': {
    addPhone: '新增電話',
    addEmail: '新增電子郵件',
    addValue: '新增內容',
    addDisclaimer: '新增免責聲明',
    paymentQrCode: '付款 QR Code',
    signatureAlt: '簽名',
    logoAlt: 'Logo',
    subtotal: '小計',
  },
  th: {
    addPhone: 'เพิ่มโทรศัพท์',
    addEmail: 'เพิ่มอีเมล',
    addValue: 'เพิ่มข้อมูล',
    addDisclaimer: 'เพิ่มข้อจำกัดความรับผิดชอบ',
    paymentQrCode: 'คิวอาร์โค้ดชำระเงิน',
    signatureAlt: 'ลายเซ็น',
    logoAlt: 'โลโก้',
    subtotal: 'ยอดรวมย่อย',
  },
  id: {
    addPhone: 'Tambah telepon',
    addEmail: 'Tambah email',
    addValue: 'Tambah isi',
    addDisclaimer: 'Tambah disclaimer',
    paymentQrCode: 'QR Code pembayaran',
    signatureAlt: 'Tanda tangan',
    logoAlt: 'Logo',
    subtotal: 'Subtotal',
  },
} satisfies Record<Language, InvoicePreviewCopy>;

const styles = {
  header: 'border-b-4 border-slate-900 px-12 pb-10 pt-10',
  tableHeader: 'bg-slate-50 text-slate-900 border-b border-slate-200',
  accentColor: 'slate-900',
  signatureBorder: 'border-slate-900',
};

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  template,
  isHeaderReversed = false,
  isForPdf = false,
  lang,
  editable = false,
  onChange,
}) => {
  const t = translations[lang] || translations.en;
  const copy = copyByLang[lang];
  const previewEditable = editable && !isForPdf;
  const { subtotal, tax, total } = calculateInvoiceTotals(invoice.items, invoice.taxRate);
  const currencyFormatter = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: invoice.currency,
  });

  const docTitle =
    invoice.customStrings?.invoiceTitle ||
    (invoice.type === 'invoice' ? t.invoiceMode.split(' ')[0].toUpperCase() : t.receiptMode.split(' ')[0].toUpperCase());

  const columns = getInvoiceColumns(invoice.columnConfig);
  const visibleColumns = columns.filter((col) => col.visible).sort((a, b) => a.order - b.order);

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    onChange?.({ items: updateInvoiceItem(invoice.items, id, updates) });
  };

  const updateItemAmount = (id: string, newAmount: number | string) => {
    onChange?.({ items: updateInvoiceItemAmount(invoice.items, id, newAmount) });
  };

  const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
    switch (column.type) {
      case 'system-text':
        return (
          <EditableTextValue
            value={item.description || ''}
            placeholder="..."
            multiline
            editable={previewEditable}
            className="whitespace-pre-wrap"
            inputClassName="text-sm"
            onChange={(value) => updateItem(item.id, { description: value })}
          />
        );
      case 'system-quantity':
        return (
          <EditableNumberValue
            value={item.quantity}
            placeholder="0"
            editable={previewEditable}
            className="inline-block min-w-[1.5rem]"
            inputClassName="text-center text-sm"
            onChange={(value) => {
              const nextValue = parseEditableNumberInput(value);
              if (nextValue !== null) updateItem(item.id, { quantity: nextValue });
            }}
          />
        );
      case 'system-rate': {
        const displayValue = item.rate === '' || item.rate === undefined ? '' : String(item.rate);
        return previewEditable ? (
          <EditableNumberValue
            value={displayValue}
            placeholder="0.00"
            editable={previewEditable}
            className="inline-block min-w-[3rem]"
            inputClassName="text-center text-sm"
            onChange={(value) => {
              const nextValue = parseEditableNumberInput(value);
              if (nextValue !== null) updateItem(item.id, { rate: nextValue });
            }}
          />
        ) : (
          currencyFormatter.format(Number(item.rate || 0))
        );
      }
      case 'system-amount': {
        const computedAmount =
          item.amount !== undefined && item.amount !== '' ? item.amount : Number(item.quantity || 0) * Number(item.rate || 0);
        return previewEditable ? (
          <EditableNumberValue
            value={computedAmount}
            placeholder="0.00"
            editable={previewEditable}
            className="inline-block min-w-[4rem]"
            inputClassName="text-right text-sm font-semibold"
            onChange={(value) => {
              const nextValue = parseEditableNumberInput(value);
              if (nextValue !== null) updateItemAmount(item.id, nextValue);
            }}
          />
        ) : (
          currencyFormatter.format(Number(computedAmount || 0))
        );
      }
      case 'custom-text':
      case 'custom-number':
        return (
          <EditableTextValue
            value={String(item.customValues?.[column.id] || '')}
            placeholder="—"
            multiline={column.type === 'custom-text'}
            editable={previewEditable}
            className="whitespace-pre-wrap"
            inputClassName="text-sm"
            onChange={(value) => {
              const customValues = { ...(item.customValues || {}), [column.id]: value };
              updateItem(item.id, { customValues });
            }}
          />
        );
      default:
        return null;
    }
  };

  void template;

  return (
    <div className={`bg-white mx-auto text-slate-800 flex flex-col ${isForPdf ? 'min-h-[296mm] overflow-visible' : 'min-h-[297mm] overflow-hidden'}`}>
      <InvoicePreviewHeader
        invoice={invoice}
        t={t}
        copy={copy}
        styles={styles}
        previewEditable={previewEditable}
        isHeaderReversed={isHeaderReversed}
        docTitle={docTitle}
        onChange={onChange}
        EditableTextValue={EditableTextValue}
      />

      <InvoicePreviewBody
        invoice={invoice}
        t={t}
        copy={copy}
        styles={styles}
        previewEditable={previewEditable}
        visibleColumns={visibleColumns}
        subtotal={subtotal}
        tax={tax}
        total={total}
        currencyFormatter={currencyFormatter}
        onChange={onChange}
        renderCell={renderCell}
        EditableTextValue={EditableTextValue}
        EditableDateValue={EditableDateValue}
      />

      <InvoicePreviewFooter
        invoice={invoice}
        t={t}
        copy={copy}
        previewEditable={previewEditable}
        onChange={onChange}
        EditableTextValue={EditableTextValue}
      />
    </div>
  );
};

export default InvoicePreview;

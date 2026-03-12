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
  hasPaymentInfoContent,
  parseEditableNumberInput,
  updateInvoiceItem,
  updateInvoiceItemAmount,
  updatePaymentInfoFieldValue,
} from '@/lib/invoice';

interface InvoicePreviewProps {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed?: boolean;
  isForPdf?: boolean;
  lang: Language;
  editable?: boolean;
  onChange?: (updates: Partial<Invoice>) => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  template,
  isHeaderReversed = false,
  isForPdf = false,
  lang,
  editable = false,
  onChange,
}) => {
  const t = translations[lang] || translations['en'];
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
  } satisfies Record<Language, {
    addPhone: string;
    addEmail: string;
    addValue: string;
    addDisclaimer: string;
    paymentQrCode: string;
    signatureAlt: string;
    logoAlt: string;
    subtotal: string;
  }>;
  const copy = copyByLang[lang];
  const previewEditable = editable && !isForPdf;
  const { subtotal, tax, total } = calculateInvoiceTotals(invoice.items, invoice.taxRate);
  const currencyFormatter = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: invoice.currency,
  });

  const styles = {
    header: 'border-b-4 border-slate-900 px-12 pb-10 pt-10',
    tableHeader: 'bg-slate-50 text-slate-900 border-b border-slate-200',
    accentColor: 'slate-900',
    signatureBorder: 'border-slate-900'
  };

  const docTitle = invoice.customStrings?.invoiceTitle || (invoice.type === 'invoice' ? t.invoiceMode.split(' ')[0].toUpperCase() : t.receiptMode.split(' ')[0].toUpperCase());

  const columns = getInvoiceColumns(invoice.columnConfig);
  const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);

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
        ) : currencyFormatter.format(Number(item.rate || 0));
      }
      case 'system-amount': {
        const computedAmount = item.amount !== undefined && item.amount !== '' ? item.amount : Number(item.quantity || 0) * Number(item.rate || 0);
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
        ) : currencyFormatter.format(Number(computedAmount || 0));
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

  return (
    <div className={` ${isForPdf ? 'min-h-[296mm]' : 'min-h-[297mm]'} bg-white mx-auto text-slate-800 flex flex-col overflow-hidden`}>
      <div className={styles.header}>
        <div className={`flex justify-between items-start gap-6 ${isHeaderReversed ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-2xl font-semibold mb-1">
              <EditableTextValue
                value={docTitle}
                placeholder={invoice.type === 'invoice' ? 'INVOICE' : 'RECEIPT'}
                editable={previewEditable}
                className="inline"
                inputClassName="text-2xl font-semibold"
                onChange={(value) => onChange?.({ customStrings: { ...invoice.customStrings, invoiceTitle: value } })}
              />
            </h1>
            {invoice.visibility?.invoiceNumber !== false && (
              <p className="opacity-80">
                #
                <EditableTextValue
                  value={invoice.invoiceNumber}
                  placeholder="INV-001"
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-base"
                  onChange={(value) => onChange?.({ invoiceNumber: value })}
                />
              </p>
            )}
          </div>
          <div className={`flex gap-2 ${isHeaderReversed ? 'flex-row text-left' : 'flex-row-reverse text-right'}`}>
            {invoice.sender.logo && <img src={invoice.sender.logo} alt={copy.logoAlt} className="max-h-20 object-contain" />}
            <div>
              <h2 className="text-base font-semibold">
                <EditableTextValue
                  value={invoice.sender.name}
                  placeholder={t.namePlaceholder}
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-base font-semibold"
                  onChange={(value) => onChange?.({ sender: { ...invoice.sender, name: value } })}
                />
              </h2>
              <p className="text-xs opacity-80 whitespace-pre-wrap mt-2">
                <i className="fas fa-map-marker-alt mr-1"></i>
                <EditableTextValue
                  value={invoice.sender.address}
                  placeholder={t.addrPlaceholder}
                  editable={previewEditable}
                  multiline
                  className="inline whitespace-pre-wrap"
                  inputClassName="text-xs"
                  onChange={(value) => onChange?.({ sender: { ...invoice.sender, address: value } })}
                />
              </p>
              <p className="text-xs opacity-80 mt-1">
                <i className="fas fa-phone mr-1"></i>{' '}
                <EditableTextValue
                  value={invoice.sender.phone || ''}
                  placeholder={copy.addPhone}
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-xs"
                  onChange={(value) => onChange?.({ sender: { ...invoice.sender, phone: value } })}
                />
              </p>
              <p className="text-xs opacity-80 mt-1">
                <i className="fas fa-envelope mr-1"></i>{' '}
                <EditableTextValue
                  value={invoice.sender.email || ''}
                  placeholder={copy.addEmail}
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-xs"
                  onChange={(value) => onChange?.({ sender: { ...invoice.sender, email: value } })}
                />
              </p>
              {invoice.sender.customFields?.map(field => (
                <p key={field.id} className="text-xs opacity-80 mt-1">
                  <span className="font-semibold">{field.label}</span>{' '}
                  <span className="whitespace-pre-wrap">{field.value}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-12 py-10 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <div className="border-l-4 border-slate-200 pl-4">
              <p className="font-semibold text-base">
                <EditableTextValue
                  value={invoice.client.name}
                  placeholder={t.clientName}
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-base font-semibold"
                  onChange={(value) => onChange?.({ client: { ...invoice.client, name: value } })}
                />
              </p>
              <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">
                <i className="fas fa-map-marker-alt mr-1 opacity-60"></i>
                <EditableTextValue
                  value={invoice.client.address}
                  placeholder={t.clientAddr}
                  editable={previewEditable}
                  multiline
                  className="inline whitespace-pre-wrap"
                  inputClassName="text-xs"
                  onChange={(value) => onChange?.({ client: { ...invoice.client, address: value } })}
                />
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <i className="fas fa-phone mr-1 opacity-60"></i>{' '}
                <EditableTextValue
                  value={invoice.client.phone || ''}
                  placeholder={copy.addPhone}
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-xs"
                  onChange={(value) => onChange?.({ client: { ...invoice.client, phone: value } })}
                />
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <i className="fas fa-envelope mr-1 opacity-60"></i>{' '}
                <EditableTextValue
                  value={invoice.client.email || ''}
                  placeholder={copy.addEmail}
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-xs"
                  onChange={(value) => onChange?.({ client: { ...invoice.client, email: value } })}
                />
              </p>
              {invoice.client.customFields?.map(field => (
                <p key={field.id} className="text-xs text-slate-500 mt-1">
                  <span className="font-semibold">{field.label}</span>{' '}
                  <span className="whitespace-pre-wrap">{field.value}</span>
                </p>
              ))}
            </div>
          </div>
          <div className="text-right">
            {invoice.visibility?.date !== false && (
              <>
                <p className="text-[0.625rem] font-semibold text-slate-400 mb-1">{invoice.customStrings?.dateLabel ?? t.invoiceDate}</p>
                <p className="text-sm font-medium mb-4"><EditableDateValue value={invoice.date} editable={previewEditable} className="inline" inputClassName="text-sm" onChange={(value) => onChange?.({ date: value })} /></p>
              </>
            )}
            {invoice.visibility?.dueDate !== false && (
              <>
                <p className="text-[0.625rem] font-semibold text-slate-400 mb-1">{invoice.customStrings?.dueDateLabel ?? t.dueDate}</p>
                <p className={`text-sm font-semibold text-${styles.accentColor}`}><EditableDateValue value={invoice.dueDate} editable={previewEditable} className="inline" inputClassName="text-sm font-semibold" onChange={(value) => onChange?.({ dueDate: value })} /></p>
              </>
            )}
          </div>
        </div>

        <table className="w-full text-left mb-8">
          <thead>
            <tr className={`${styles.tableHeader} text-[0.625rem] font-semibold`}>
              {visibleColumns.map(col => (
                <th key={col.id} className={`px-6 py-4 ${col.type === 'system-amount' ? 'text-right' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : '')}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item) => (
              <tr key={item.id} className="text-xs">
                {visibleColumns.map(col => (
                  <td key={col.id} className={`px-6 py-4 ${col.type === 'system-amount' ? 'text-right font-semibold' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : 'font-medium')} ${col.type === 'system-text' || col.type === 'custom-text' ? 'whitespace-pre-wrap' : ''}`}>
                    {renderCell(item, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between pt-6 border-t border-slate-100 mt-auto">
          <div className="flex flex-col items-start">
            {invoice.visibility?.signature === true && (
              <>
                {invoice.sender.signature && (
                  <div className="mb-2">
                    <img src={invoice.sender.signature} alt={copy.signatureAlt} className="h-16 object-contain" />
                  </div>
                )}
                <div className={`border-t ${styles.signatureBorder} pt-2 min-w-[11.25rem]`}>
                  <p className="text-[0.625rem] font-semibold text-slate-400 uppercase tracking-widest">{t.authorizedSignature}</p>
                  <p className="text-xs font-semibold text-slate-900 mt-1">{invoice.sender.name}</p>
                </div>
              </>
            )}
          </div>

          <div className="w-80 space-y-2">
            <div className="flex justify-between text-slate-500 text-xs">
              <span>{copy.subtotal}</span>
              <span>{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t.taxRate} ({invoice.taxRate}%)</span>
              <span>{currencyFormatter.format(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-slate-900 pt-2 border-t border-slate-200">
              <span>{t.total}</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
          </div>
        </div>

        {hasPaymentInfoContent(invoice.paymentInfo) && invoice.visibility?.paymentInfo === true && (
          <div className="mt-8 pt-4 border-t border-slate-100">
            <div className="flex justify-between w-full  items-start gap-8">
              <div className="space-y-1 text-xs text-slate-600 flex-1 overflow-hidden">
                {invoice.paymentInfo?.fields
                  ?.filter(field => field.visible)
                  ?.sort((a, b) => a.order - b.order)
                  ?.map(field => (
                    <div key={field.id} className="flex justify-between sm:justify-start gap-4 items-baseline">
                      <span className="font-medium text-slate-400 min-w-[6.25rem]">{field.label}:</span>
                      <span className={`font-semibold text-slate-800 whitespace-pre-wrap break-words min-w-0 flex-1 text-right sm:text-left ${field.id === 'accountNumber' ? 'font-mono' : ''}`}>
                        <EditableTextValue
                          value={field.value}
                          placeholder={copy.addValue}
                          editable={previewEditable}
                          multiline={field.type === 'textarea'}
                          className="inline whitespace-pre-wrap break-words"
                          inputClassName={`text-xs ${field.id === 'accountNumber' ? 'font-mono' : ''}`}
                          onChange={(value) => {
                            onChange?.({ paymentInfo: updatePaymentInfoFieldValue(invoice.paymentInfo, field.id, value) });
                          }}
                        />
                      </span>
                    </div>
                  ))}

                {!invoice.paymentInfo?.fields && (
                  <>
                    {invoice.paymentInfo?.bankName && (
                      <div className="flex justify-between sm:justify-start gap-4 items-baseline">
                        <span className="font-medium text-slate-400 min-w-[6.25rem]">{t.bankName}:</span>
                        <span className="font-semibold text-slate-800 whitespace-pre-wrap break-words min-w-0 flex-1 text-right sm:text-left">{invoice.paymentInfo.bankName}</span>
                      </div>
                    )}
                    {invoice.paymentInfo?.accountName && (
                      <div className="flex justify-between sm:justify-start gap-4 items-baseline">
                        <span className="font-medium text-slate-400 min-w-[6.25rem]">{t.accountName}:</span>
                        <span className="font-semibold text-slate-800 whitespace-pre-wrap break-words min-w-0 flex-1 text-right sm:text-left">{invoice.paymentInfo.accountName}</span>
                      </div>
                    )}
                    {invoice.paymentInfo?.accountNumber && (
                      <div className="flex justify-between sm:justify-start gap-4 items-baseline">
                        <span className="font-medium text-slate-400 min-w-[6.25rem]">{t.accountNumber}:</span>
                        <span className="font-semibold text-slate-800 font-mono whitespace-pre-wrap break-words min-w-0 flex-1 text-right sm:text-left">{invoice.paymentInfo.accountNumber}</span>
                      </div>
                    )}
                    {invoice.paymentInfo?.extraInfo && (
                      <div className="flex justify-between sm:justify-start gap-4 items-baseline">
                        <span className="font-medium text-slate-400 min-w-[6.25rem]">{t.extraInfo}:</span>
                        <span className="font-semibold text-slate-800 font-mono whitespace-pre-wrap break-words min-w-0 flex-1 text-right sm:text-left">{invoice.paymentInfo.extraInfo}</span>
                      </div>
                    )}
                    {invoice.paymentInfo?.customFields?.map(field => (
                      <div key={field.id} className="flex justify-between sm:justify-start gap-4 items-baseline">
                        <span className="font-medium text-slate-400 min-w-[6.25rem]">{field.label}:</span>
                        <span className="font-semibold text-slate-800 whitespace-pre-wrap break-words min-w-0 flex-1 text-right sm:text-left">{field.value}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {invoice.paymentInfo?.qrCode && (
                <div className="w-32 flex-shrink-0 h-auto max-h-50 border-2 border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
                  <img
                    src={invoice.paymentInfo.qrCode}
                    alt={copy.paymentQrCode}
                    className="w-full h-auto object-contain p-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </div >

      {invoice.sender.disclaimerText && invoice.visibility?.disclaimer !== false && (
        <div className="px-8 py-4 border-t border-slate-50 text-center">
          <div className="flex items-start justify-center gap-2 text-[0.625rem] text-slate-400 leading-relaxed">
            <i className="fas fa-graduation-cap mt-0.5 flex-shrink-0"></i>
            <EditableTextValue
              value={invoice.sender.disclaimerText}
              placeholder={copy.addDisclaimer}
              editable={previewEditable}
              multiline
              className="whitespace-pre-wrap"
              inputClassName="text-[0.625rem]"
              onChange={(value) => onChange?.({ sender: { ...invoice.sender, disclaimerText: value } })}
            />
          </div>
        </div>
      )}

      <div className="p-8 border-t border-slate-50 text-center text-[0.625rem] text-slate-300 uppercase tracking-widest">
        {t.poweredBy}
      </div>
    </div >
  );
};

export default InvoicePreview;

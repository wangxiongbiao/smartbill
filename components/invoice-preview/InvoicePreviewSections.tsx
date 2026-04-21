'use client';

import React, { type ComponentType } from 'react';
import type { Invoice, InvoiceColumn, InvoiceItem } from '@/types';
import { hasPaymentInfoContent, updatePaymentInfoFieldValue } from '@/lib/invoice';
import type { InvoicePreviewCopy, InvoicePreviewStyles } from './invoicePreviewShared';

export interface InvoicePreviewSectionCommonProps {
  invoice: Invoice;
  t: any;
  copy: InvoicePreviewCopy;
  styles: InvoicePreviewStyles;
  previewEditable: boolean;
  isHeaderReversed: boolean;
  visibleColumns: InvoiceColumn[];
  subtotal: number;
  tax: number;
  total: number;
  currencyFormatter: Intl.NumberFormat;
  docTitle: string;
  onChange?: (updates: Partial<Invoice>) => void;
  renderCell: (item: InvoiceItem, column: InvoiceColumn) => React.ReactNode;
  EditableTextValue: ComponentType<any>;
  EditableNumberValue: ComponentType<any>;
  EditableDateValue: ComponentType<any>;
}

export function InvoicePreviewHeader({
  invoice,
  t,
  copy,
  styles,
  previewEditable,
  isHeaderReversed,
  docTitle,
  onChange,
  EditableTextValue,
}: Pick<
  InvoicePreviewSectionCommonProps,
  'invoice' | 't' | 'copy' | 'styles' | 'previewEditable' | 'isHeaderReversed' | 'docTitle' | 'onChange' | 'EditableTextValue'
>) {
  return (
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
        <div className={`flex gap-2 ${isHeaderReversed ? 'flex-row text-left flex-1' : 'flex-row-reverse text-right'}`}>
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
            {invoice.sender.customFields?.map((field) => (
              <p key={field.id} className="text-xs opacity-80 mt-1">
                <span className="font-semibold">{field.label}</span>{' '}
                <span className="whitespace-pre-wrap">{field.value}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InvoicePreviewCompactHeader({
  invoice,
  copy,
  previewEditable,
  docTitle,
  onChange,
  EditableTextValue,
}: Pick<
  InvoicePreviewSectionCommonProps,
  'invoice' | 'copy' | 'previewEditable' | 'docTitle' | 'onChange' | 'EditableTextValue'
>) {
  return (
    <div className="px-12 py-6 border-b border-slate-200">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-lg font-semibold text-slate-900">
            <EditableTextValue
              value={docTitle}
              placeholder={invoice.type === 'invoice' ? 'INVOICE' : 'RECEIPT'}
              editable={previewEditable}
              className="inline"
              inputClassName="text-lg font-semibold"
              onChange={(value) => onChange?.({ customStrings: { ...invoice.customStrings, invoiceTitle: value } })}
            />
          </p>
          {invoice.visibility?.invoiceNumber !== false && (
            <p className="text-xs text-slate-500 mt-1">
              #
              <EditableTextValue
                value={invoice.invoiceNumber}
                placeholder="INV-001"
                editable={previewEditable}
                className="inline"
                inputClassName="text-xs"
                onChange={(value) => onChange?.({ invoiceNumber: value })}
              />
            </p>
          )}
        </div>

        <div className="text-right text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-800">
            <EditableTextValue
              value={invoice.sender.name}
              placeholder={copy.logoAlt}
              editable={previewEditable}
              className="inline"
              inputClassName="text-xs font-semibold"
              onChange={(value) => onChange?.({ sender: { ...invoice.sender, name: value } })}
            />
          </p>
          {invoice.sender.logo && <img src={invoice.sender.logo} alt={copy.logoAlt} className="ml-auto max-h-12 object-contain" />}
        </div>
      </div>
    </div>
  );
}

export function InvoicePreviewMeta({
  invoice,
  t,
  copy,
  previewEditable,
  styles,
  onChange,
  EditableTextValue,
  EditableDateValue,
}: Pick<
  InvoicePreviewSectionCommonProps,
  'invoice' | 't' | 'copy' | 'previewEditable' | 'styles' | 'onChange' | 'EditableTextValue' | 'EditableDateValue'
>) {
  return (
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
          {invoice.client.customFields?.map((field) => (
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
            <p className="text-sm font-medium mb-4">
              <EditableDateValue
                value={invoice.date}
                editable={previewEditable}
                className="inline"
                inputClassName="text-sm"
                onChange={(value) => onChange?.({ date: value })}
              />
            </p>
          </>
        )}
        {invoice.visibility?.dueDate !== false && (
          <>
            <p className="text-[0.625rem] font-semibold text-slate-400 mb-1">{invoice.customStrings?.dueDateLabel ?? t.dueDate}</p>
            <p className={`text-sm font-semibold text-${styles.accentColor}`}>
              <EditableDateValue
                value={invoice.dueDate}
                editable={previewEditable}
                className="inline"
                inputClassName="text-sm font-semibold"
                onChange={(value) => onChange?.({ dueDate: value })}
              />
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function InvoicePreviewTableHeader({
  visibleColumns,
  styles,
}: Pick<InvoicePreviewSectionCommonProps, 'visibleColumns' | 'styles'>) {
  return (
    <thead>
      <tr className={`${styles.tableHeader} text-[0.625rem] font-semibold`}>
        {visibleColumns.map((col) => (
          <th
            key={col.id}
            className={`px-6 py-4 ${col.type === 'system-amount' ? 'text-right' : col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : ''}`}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function InvoicePreviewItemsTable({
  invoice,
  visibleColumns,
  styles,
  renderCell,
  items,
}: Pick<InvoicePreviewSectionCommonProps, 'invoice' | 'visibleColumns' | 'styles' | 'renderCell'> & { items?: InvoiceItem[] }) {
  const rows = items ?? invoice.items;

  return (
    <table className="w-full text-left mb-8">
      <InvoicePreviewTableHeader visibleColumns={visibleColumns} styles={styles} />
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="text-xs">
            {visibleColumns.map((col) => (
              <td
                key={col.id}
                className={`px-6 py-4 ${col.type === 'system-amount' ? 'text-right font-semibold' : col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : 'font-medium'} ${col.type === 'system-text' || col.type === 'custom-text' ? 'whitespace-pre-wrap' : ''}`}
              >
                {renderCell(item, col)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function InvoicePreviewSignature({
  invoice,
  t,
  copy,
  styles,
}: Pick<InvoicePreviewSectionCommonProps, 'invoice' | 't' | 'copy' | 'styles'>) {
  if (invoice.visibility?.signature !== true) {
    return <div className="flex flex-col items-start" />;
  }

  return (
    <div className="flex flex-col items-start">
      {invoice.sender.signature && (
        <div className="mb-2">
          <img src={invoice.sender.signature} alt={copy.signatureAlt} className="h-16 object-contain" />
        </div>
      )}
      <div className={`border-t ${styles.signatureBorder} pt-2 min-w-[11.25rem]`}>
        <p className="text-[0.625rem] font-semibold text-slate-400 uppercase tracking-widest">{t.authorizedSignature}</p>
        <p className="text-xs font-semibold text-slate-900 mt-1">{invoice.sender.name}</p>
      </div>
    </div>
  );
}

export function InvoicePreviewTotals({
  invoice,
  t,
  copy,
  subtotal,
  tax,
  total,
  currencyFormatter,
}: Pick<InvoicePreviewSectionCommonProps, 'invoice' | 't' | 'copy' | 'subtotal' | 'tax' | 'total' | 'currencyFormatter'>) {
  return (
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
  );
}

export function InvoicePreviewPaymentInfo({
  invoice,
  t,
  copy,
  previewEditable,
  onChange,
  EditableTextValue,
}: Pick<
  InvoicePreviewSectionCommonProps,
  'invoice' | 't' | 'copy' | 'previewEditable' | 'onChange' | 'EditableTextValue'
>) {
  if (!hasPaymentInfoContent(invoice.paymentInfo) || invoice.visibility?.paymentInfo !== true) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-slate-100">
      <div className="flex justify-between w-full items-start gap-8">
        <div className="space-y-1 text-xs text-slate-600 flex-1 min-w-0">
          {invoice.paymentInfo?.fields
            ?.filter((field) => field.visible)
            ?.sort((a, b) => a.order - b.order)
            ?.map((field) => (
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
              {invoice.paymentInfo?.customFields?.map((field) => (
                <div key={field.id} className="flex justify-between sm:justify-start gap-4 items-baseline">
                  <span className="font-medium text-slate-400 min-w-[6.25rem]">{field.label}:</span>
                  <span className="font-semibold text-slate-800 whitespace-pre-wrap break-words min-w-0 flex-1 text-right sm:text-left">{field.value}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {invoice.paymentInfo?.qrCode && (
          <div className="w-32 h-auto max-h-50 border-2 border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
            <img src={invoice.paymentInfo.qrCode} alt={copy.paymentQrCode} className="w-full h-auto object-contain p-2" />
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoicePreviewFooter({
  invoice,
  t,
  copy,
  previewEditable,
  onChange,
  EditableTextValue,
}: Pick<
  InvoicePreviewSectionCommonProps,
  'invoice' | 't' | 'copy' | 'previewEditable' | 'onChange' | 'EditableTextValue'
>) {
  return (
    <>
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
    </>
  );
}

export function InvoicePreviewBody({
  invoice,
  t,
  copy,
  styles,
  previewEditable,
  visibleColumns,
  subtotal,
  tax,
  total,
  currencyFormatter,
  onChange,
  renderCell,
  EditableTextValue,
  EditableDateValue,
}: Pick<
  InvoicePreviewSectionCommonProps,
  | 'invoice'
  | 't'
  | 'copy'
  | 'styles'
  | 'previewEditable'
  | 'visibleColumns'
  | 'subtotal'
  | 'tax'
  | 'total'
  | 'currencyFormatter'
  | 'onChange'
  | 'renderCell'
  | 'EditableTextValue'
  | 'EditableDateValue'
>) {
  return (
    <div className="px-12 py-10 flex-1 flex flex-col">
      <InvoicePreviewMeta
        invoice={invoice}
        t={t}
        copy={copy}
        previewEditable={previewEditable}
        styles={styles}
        onChange={onChange}
        EditableTextValue={EditableTextValue}
        EditableDateValue={EditableDateValue}
      />

      <div className="flex-1 flex flex-col">
        <InvoicePreviewItemsTable
          invoice={invoice}
          visibleColumns={visibleColumns}
          styles={styles}
          renderCell={renderCell}
        />

        <div className="mt-auto space-y-8">
          <div className="flex justify-between pt-6 border-t border-slate-100">
            <InvoicePreviewSignature invoice={invoice} t={t} copy={copy} styles={styles} />
            <InvoicePreviewTotals
              invoice={invoice}
              t={t}
              copy={copy}
              subtotal={subtotal}
              tax={tax}
              total={total}
              currencyFormatter={currencyFormatter}
            />
          </div>

          <InvoicePreviewPaymentInfo
            invoice={invoice}
            t={t}
            copy={copy}
            previewEditable={previewEditable}
            onChange={onChange}
            EditableTextValue={EditableTextValue}
          />
        </div>
      </div>
    </div>
  );
}

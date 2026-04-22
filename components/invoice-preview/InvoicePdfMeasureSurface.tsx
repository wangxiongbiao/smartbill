'use client';

import React from 'react';
import type { Invoice, InvoiceColumn, InvoiceItem, Language, TemplateType } from '@/types';
import { translations } from '@/i18n';
import {
  calculateInvoiceTotals,
  getInvoiceColumns,
} from '@/lib/invoice';
import {
  INVOICE_PDF_MEASURE_ITEM_ATTR,
  INVOICE_PDF_MEASURE_PAGE_ATTR,
  INVOICE_PDF_MEASURE_SECTION_ATTR,
} from '@/lib/invoice-pdf-measure';
import { getInvoicePdfPageFrameStyle } from '@/lib/invoice-pdf-page-frame';
import {
  InvoicePreviewCompactHeader,
  InvoicePreviewFooter,
  InvoicePreviewHeader,
  InvoicePreviewItemRow,
  InvoicePreviewMeta,
  InvoicePreviewPaymentInfo,
  InvoicePreviewSignature,
  InvoicePreviewTableHeader,
  InvoicePreviewTotals,
} from './InvoicePreviewSections';
import {
  getInvoiceDocumentTitle,
  invoicePreviewCopyByLang,
  invoicePreviewStyles,
} from './invoicePreviewShared';

function PdfStaticTextValue({ value, className = '' }: { value?: string; className?: string }) {
  if (!value) return null;
  return <span className={className}>{value}</span>;
}

function PdfStaticDateValue({ value, className = '' }: { value?: string; className?: string }) {
  if (!value) return null;
  return <span className={className}>{value}</span>;
}

interface InvoicePdfMeasureSurfaceProps {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed?: boolean;
  lang: Language;
}

export default function InvoicePdfMeasureSurface({
  invoice,
  template,
  isHeaderReversed = false,
  lang,
}: InvoicePdfMeasureSurfaceProps) {
  const t = translations[lang] || translations.en;
  const copy = invoicePreviewCopyByLang[lang];
  const docTitle = getInvoiceDocumentTitle(invoice, t);
  const { subtotal, tax, total } = calculateInvoiceTotals(invoice.items, invoice.taxRate);
  const currencyFormatter = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: invoice.currency,
  });
  const visibleColumns = getInvoiceColumns(invoice.columnConfig)
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
    switch (column.type) {
      case 'system-text':
        return item.description || '';
      case 'system-quantity':
        return String(item.quantity ?? '');
      case 'system-rate':
        return currencyFormatter.format(Number(item.rate || 0));
      case 'system-amount': {
        const computedAmount =
          item.amount !== undefined && item.amount !== '' ? item.amount : Number(item.quantity || 0) * Number(item.rate || 0);
        return currencyFormatter.format(Number(computedAmount || 0));
      }
      case 'custom-text':
      case 'custom-number':
        return String(item.customValues?.[column.id] || '');
      default:
        return null;
    }
  };

  void template;
  const pageFrameStyle = getInvoicePdfPageFrameStyle();

  return (
    <div
      aria-hidden="true"
      data-invoice-pdf-measure-shell="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '210mm',
        pointerEvents: 'none',
        opacity: 0,
        transform: 'translateX(calc(-100% - 96px))',
        zIndex: -1,
        background: '#ffffff',
      }}
    >
      <div
        className="bg-white mx-auto text-slate-800 flex flex-col"
        style={pageFrameStyle}
        {...{ [INVOICE_PDF_MEASURE_PAGE_ATTR]: 'true' }}
      >
        <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'header' }}>
          <InvoicePreviewHeader
            invoice={invoice}
            t={t}
            copy={copy}
            styles={invoicePreviewStyles}
            previewEditable={false}
            isHeaderReversed={isHeaderReversed}
            docTitle={docTitle}
            EditableTextValue={PdfStaticTextValue}
            hideEmptyFields
          />
        </div>

        <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'compactHeader' }}>
          <InvoicePreviewCompactHeader
            invoice={invoice}
            copy={copy}
            previewEditable={false}
            docTitle={docTitle}
            EditableTextValue={PdfStaticTextValue}
            hideEmptyFields
            pageNumber={2}
            totalPages={2}
            dateLabel={invoice.customStrings?.dateLabel ?? t.invoiceDate}
            clientLabel={t.clientName}
            pageLabel="Page"
          />
        </div>

        <div className="px-12 py-10 flex-1 flex flex-col">
          <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'meta' }}>
            <InvoicePreviewMeta
              invoice={invoice}
              t={t}
              copy={copy}
              previewEditable={false}
              styles={invoicePreviewStyles}
              EditableTextValue={PdfStaticTextValue}
              EditableDateValue={PdfStaticDateValue}
              hideEmptyFields
            />
          </div>

          <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'tableHeader' }}>
            <table className="w-full text-left mb-8">
              <InvoicePreviewTableHeader visibleColumns={visibleColumns} styles={invoicePreviewStyles} />
            </table>
          </div>

          <div className="space-y-0">
            {invoice.items.map((item) => (
              <table key={item.id} className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-100">
                  <InvoicePreviewItemRow
                    item={item}
                    visibleColumns={visibleColumns}
                    renderCell={renderCell}
                    rowProps={{ [INVOICE_PDF_MEASURE_ITEM_ATTR]: item.id } as React.HTMLAttributes<HTMLTableRowElement>}
                  />
                </tbody>
              </table>
            ))}
          </div>

          <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'summary' }} className="space-y-8">
            <div className="flex justify-between pt-6 border-t border-slate-100">
              <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'signature' }}>
                <InvoicePreviewSignature invoice={invoice} t={t} copy={copy} styles={invoicePreviewStyles} />
              </div>

              <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'totals' }}>
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
            </div>

            <div {...{ [INVOICE_PDF_MEASURE_SECTION_ATTR]: 'paymentInfo' }}>
              <InvoicePreviewPaymentInfo
                invoice={invoice}
                t={t}
                copy={copy}
                previewEditable={false}
                EditableTextValue={PdfStaticTextValue}
                hideEmptyFields
              />
            </div>
          </div>
        </div>

        <div data-invoice-pdf-measure-footer-root="true">
          <InvoicePreviewFooter
            invoice={invoice}
            t={t}
            copy={copy}
            previewEditable={false}
            EditableTextValue={PdfStaticTextValue}
            hideEmptyFields
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import type { Invoice, InvoiceColumn, InvoiceItem, Language, TemplateType } from '@/types';
import { translations } from '@/i18n';
import {
  calculateInvoiceTotals,
  getInvoiceColumns,
} from '@/lib/invoice';
import type { InvoicePdfPageModel } from '@/lib/invoice-pdf';
import { getInvoicePdfPageFrameStyle } from '@/lib/invoice-pdf-page-frame';
import {
  InvoicePreviewCompactHeader,
  InvoicePreviewFooter,
  InvoicePreviewHeader,
  InvoicePreviewItemsTable,
  InvoicePreviewMeta,
  InvoicePreviewPaymentInfo,
  InvoicePreviewSignature,
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

interface InvoicePdfPageProps {
  invoice: Invoice;
  template: TemplateType;
  pageModel: InvoicePdfPageModel;
  isHeaderReversed?: boolean;
  lang: Language;
}

export default function InvoicePdfPage({
  invoice,
  template,
  pageModel,
  isHeaderReversed = false,
  lang,
}: InvoicePdfPageProps) {
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
  const pageItems = invoice.items.filter((item) => pageModel.itemIds.includes(item.id));

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
  const hasSummarySections = pageModel.sections.signature || pageModel.sections.totals || pageModel.sections.paymentInfo;
  const bodyClassName = hasSummarySections ? 'px-12 py-10 flex-1 flex flex-col' : 'px-12 py-10';
  const contentClassName = hasSummarySections ? 'flex-1 flex flex-col' : '';

  return (
    <div
      className="bg-white mx-auto text-slate-800 flex flex-col"
      style={pageFrameStyle}
      data-invoice-pdf-page-kind={pageModel.kind}
    >
      {pageModel.sections.header && (
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
)}

      {pageModel.sections.compactHeader && (
        <InvoicePreviewCompactHeader
          invoice={invoice}
          copy={copy}
          previewEditable={false}
          docTitle={docTitle}
          EditableTextValue={PdfStaticTextValue}
          hideEmptyFields
          pageNumber={pageModel.pageNumber}
          totalPages={pageModel.totalPages}
          dateLabel={invoice.customStrings?.dateLabel ?? t.invoiceDate}
          clientLabel={t.clientName}
          pageLabel="Page"
        />
      )}

      <div className={bodyClassName}>
        {pageModel.sections.meta && (
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
        )}

        <div className={contentClassName}>
          <InvoicePreviewItemsTable
            invoice={invoice}
            visibleColumns={visibleColumns}
            styles={invoicePreviewStyles}
            renderCell={renderCell}
            items={pageItems}
          />

          {(pageModel.sections.signature || pageModel.sections.totals || pageModel.sections.paymentInfo) && (
            <div className="mt-auto space-y-8">
              {(pageModel.sections.signature || pageModel.sections.totals) && (
                <div className="flex justify-between pt-6 border-t border-slate-100">
                  {pageModel.sections.signature ? (
                    <InvoicePreviewSignature invoice={invoice} t={t} copy={copy} styles={invoicePreviewStyles} />
                  ) : (
                    <div />
                  )}
                  {pageModel.sections.totals ? (
                    <InvoicePreviewTotals
                      invoice={invoice}
                      t={t}
                      copy={copy}
                      subtotal={subtotal}
                      tax={tax}
                      total={total}
                      currencyFormatter={currencyFormatter}
                    />
                  ) : null}
                </div>
              )}

              {pageModel.sections.paymentInfo && (
                <InvoicePreviewPaymentInfo
                  invoice={invoice}
                  t={t}
                  copy={copy}
                  previewEditable={false}
                  EditableTextValue={PdfStaticTextValue}
                  hideEmptyFields
                />
              )}
            </div>
          )}
        </div>
      </div>

      {(pageModel.sections.disclaimer || pageModel.sections.footer) && (
        <>
          {pageModel.sections.disclaimer && (
            <InvoicePreviewFooter
              invoice={invoice}
              t={t}
              copy={copy}
              previewEditable={false}
              EditableTextValue={PdfStaticTextValue}
              hideEmptyFields
            />
          )}
          {!pageModel.sections.disclaimer && pageModel.sections.footer && (
            <div className="p-8 border-t border-slate-50 text-center text-[0.625rem] text-slate-300 uppercase tracking-widest">
              {t.poweredBy}
            </div>
          )}
        </>
      )}
    </div>
  );
}

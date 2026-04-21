'use client';

import React from 'react';
import type { Invoice, InvoiceColumn, InvoiceItem, Language, TemplateType } from '@/types';
import { translations } from '@/i18n';
import EditableDateValue from '@/components/preview-editable/EditableDateValue';
import EditableNumberValue from '@/components/preview-editable/EditableNumberValue';
import EditableTextValue from '@/components/preview-editable/EditableTextValue';
import {
  calculateInvoiceTotals,
  getInvoiceColumns,
} from '@/lib/invoice';
import type { InvoicePdfPageModel } from '@/lib/invoice-pdf';
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

  return (
    <div className="bg-white mx-auto text-slate-800 flex flex-col min-h-[296mm] overflow-visible" data-invoice-pdf-page-kind={pageModel.kind}>
      {pageModel.sections.header && (
        <InvoicePreviewHeader
          invoice={invoice}
          t={t}
          copy={copy}
          styles={invoicePreviewStyles}
          previewEditable={false}
          isHeaderReversed={isHeaderReversed}
          docTitle={docTitle}
          EditableTextValue={EditableTextValue}
        />
      )}

      {pageModel.sections.compactHeader && (
        <InvoicePreviewCompactHeader
          invoice={invoice}
          copy={copy}
          previewEditable={false}
          docTitle={docTitle}
          EditableTextValue={EditableTextValue}
        />
      )}

      <div className="px-12 py-10 flex-1 flex flex-col">
        {pageModel.sections.meta && (
          <InvoicePreviewMeta
            invoice={invoice}
            t={t}
            copy={copy}
            previewEditable={false}
            styles={invoicePreviewStyles}
            EditableTextValue={EditableTextValue}
            EditableDateValue={EditableDateValue}
          />
        )}

        <div className="flex-1 flex flex-col">
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
                  EditableTextValue={EditableTextValue}
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
              EditableTextValue={EditableTextValue}
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

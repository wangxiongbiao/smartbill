import { translations } from '@/shared/i18n';
import {
  calculateInvoiceTotals,
  getSortedInvoiceColumns,
  hasPaymentInfoContent,
} from '@/shared/invoice';
import type {
  CustomField,
  Invoice,
  InvoiceColumn,
  Language,
  PaymentInfo,
  PaymentInfoField,
} from '@/shared/types';

export type InvoiceDocumentMode = 'app-preview' | 'pdf' | 'thumbnail';

type InvoiceDocumentOptions = {
  lang?: Language;
  mode?: InvoiceDocumentMode;
};

export const DEFAULT_INVOICE_DOCUMENT_LANGUAGE: Language = 'en';

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: 'en-US',
  'zh-TW': 'zh-TW',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
};

type PreviewCopy = {
  addEmail: string;
  addPhone: string;
  addrPlaceholder: string;
  authorizedSignature: string;
  clientAddr: string;
  clientName: string;
  dueDate: string;
  itemDescriptionExample: string;
  invoiceDate: string;
  logoAlt: string;
  namePlaceholder: string;
  paymentQrCode: string;
  poweredBy: string;
  signatureAlt: string;
  subtotal: string;
  taxRate: string;
};

export function buildInvoiceDocumentHtml(
  invoice: Invoice,
  { lang = DEFAULT_INVOICE_DOCUMENT_LANGUAGE, mode = 'app-preview' }: InvoiceDocumentOptions = {}
) {
  const translation = translations[lang] || translations.en;
  const previewCopy = resolvePreviewCopy(lang, translation);
  const totals = calculateInvoiceTotals(invoice.items, invoice.taxRate);
  const visibleColumns = getSortedInvoiceColumns(invoice.columnConfig).filter(
    (column) => column.visible
  );
  const paymentFields = getRenderablePaymentFields(invoice.paymentInfo, previewCopy).filter(
    (field) => field.visible
  );
  const isHeaderReversed = invoice.isHeaderReversed ?? true;
  const hasPaymentSection =
    invoice.visibility?.paymentInfo === true && hasPaymentInfoContent(invoice.paymentInfo);
  const docTitle = resolveDocumentTitle(invoice, translation);
  const dateLabel = invoice.customStrings?.dateLabel?.trim() || previewCopy.invoiceDate;
  const dueDateLabel = invoice.customStrings?.dueDateLabel?.trim() || previewCopy.dueDate;
  const locale = LOCALE_BY_LANGUAGE[lang] || LOCALE_BY_LANGUAGE.en;
  const screenScript =
    mode === 'app-preview' || mode === 'thumbnail'
      ? `
        <script>
          (function () {
            function syncScale() {
              var shell = document.getElementById('page-shell');
              var page = document.getElementById('page-document');
              var stage = document.getElementById('page-stage');
              if (!shell || !page || !stage) return;
              var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
              var scale = Math.min((width - ${mode === 'app-preview' ? 24 : 0}) / page.offsetWidth, 1);
              shell.style.transform = 'scale(' + scale + ')';
              stage.style.height = page.offsetHeight * scale + 'px';
            }
            window.addEventListener('resize', syncScale);
            window.addEventListener('load', syncScale);
            syncScale();
          })();
        </script>
      `
      : '';

  return `<!DOCTYPE html>
  <html lang="${escapeAttribute(locale)}">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <style>
        :root {
          color-scheme: light;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: ${mode === 'app-preview' ? '#f6f5f2' : mode === 'thumbnail' ? 'transparent' : '#ffffff'};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1e293b;
        }

        img {
          display: block;
          max-width: 100%;
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        body {
          ${mode === 'app-preview' ? 'padding: 14px 0 40px;' : 'padding: 0;'}
        }

        .page-stage {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          ${mode === 'app-preview' || mode === 'thumbnail' ? 'overflow: hidden;' : ''}
        }

        .page-shell {
          width: 210mm;
          margin: 0;
          flex: 0 0 auto;
          transform-origin: top center;
          ${mode === 'pdf' ? 'transform: none !important;' : ''}
        }

        .document {
          width: 210mm;
          min-height: ${mode === 'pdf' ? '296mm' : '297mm'};
          background: #ffffff;
          color: #1e293b;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          ${mode === 'app-preview' ? 'box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);' : ''}
        }

        .doc-header {
          border-bottom: 4px solid #0f172a;
          padding: 40px 48px;
        }

        .doc-header-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .doc-header-grid.reversed {
          flex-direction: row-reverse;
        }

        .doc-title-block {
          min-width: 0;
        }

        .doc-title-block.title-right {
          text-align: right;
        }

        .doc-title-block.title-left {
          text-align: left;
        }

        .doc-title {
          margin: 0 0 4px;
          font-size: 24px;
          line-height: 1.35;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .doc-number {
          margin: 0;
          font-size: 16px;
          line-height: 1.45;
          color: rgba(15, 23, 42, 0.8);
        }

        .sender-cluster {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          text-align: right;
          flex-direction: row-reverse;
        }

        .sender-cluster.reversed {
          flex-direction: row;
          text-align: left;
        }

        .sender-logo {
          max-height: 80px;
          max-width: 140px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .sender-name {
          margin: 0;
          font-size: 16px;
          line-height: 1.4;
          font-weight: 600;
          color: #0f172a;
        }

        .sender-line,
        .party-line {
          margin: 4px 0 0;
          font-size: 12px;
          line-height: 1.55;
          color: rgba(15, 23, 42, 0.8);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .sender-name.placeholder,
        .client-name.placeholder,
        .signature-name.placeholder,
        .sender-line.placeholder,
        .client-line.placeholder {
          color: #cbd5e1;
        }

        .field-placeholder {
          color: #cbd5e1;
        }

        .info-icon {
          display: inline-flex;
          width: 11px;
          height: 11px;
          margin-right: 4px;
          vertical-align: -1px;
          color: currentColor;
        }

        .info-icon svg {
          width: 100%;
          height: 100%;
          display: block;
          fill: currentColor;
        }

        .sender-line.leading,
        .client-line.leading {
          margin-top: 8px;
        }

        .doc-body {
          padding: 40px 48px;
          display: flex;
          flex: 1;
          flex-direction: column;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 180px;
          gap: 48px;
          margin-bottom: 40px;
        }

        .client-card {
          border-left: 4px solid #e2e8f0;
          padding-left: 16px;
          min-width: 0;
        }

        .client-name {
          margin: 0;
          font-size: 16px;
          line-height: 1.4;
          font-weight: 600;
          color: #0f172a;
        }

        .client-line {
          margin: 4px 0 0;
          font-size: 12px;
          line-height: 1.55;
          color: #64748b;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .dates-column {
          text-align: right;
        }

        .date-block + .date-block {
          margin-top: 16px;
        }

        .date-label {
          margin: 0 0 4px;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .date-value {
          margin: 0;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 600;
          color: #0f172a;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
          text-align: left;
        }

        .items-head-row {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .items-head-cell {
          padding: 16px 24px;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 600;
          color: #0f172a;
          text-align: left;
          vertical-align: top;
        }

        .items-head-cell.center,
        .items-body-cell.center {
          text-align: center;
        }

        .items-head-cell.left,
        .items-body-cell.left {
          text-align: left;
        }

        .items-head-cell.first-column,
        .items-body-cell.first-column {
          text-align: left !important;
        }

        .items-head-cell.right,
        .items-body-cell.right {
          text-align: right;
        }

        .items-body-row + .items-body-row {
          border-top: 1px solid #f1f5f9;
        }

        .items-body-cell {
          padding: 16px 24px;
          font-size: 12px;
          line-height: 1.35;
          color: #0f172a;
          vertical-align: top;
        }

        .items-body-cell.amount {
          font-weight: 600;
        }

        .items-body-cell.textual {
          font-weight: 500;
 
          word-break: break-word;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          border-top: 1px solid #f1f5f9;
          padding-top: 24px;
          margin-top: auto;
        }

        .signature-wrap {
          min-width: 180px;
        }

        .signature-image {
          max-height: 64px;
          object-fit: contain;
          margin-bottom: 8px;
        }

        .signature-line {
          border-top: 1px solid #0f172a;
          padding-top: 8px;
          min-width: 180px;
        }

        .signature-label {
          margin: 0;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .signature-name {
          margin: 4px 0 0;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
          color: #0f172a;
        }

        .totals-panel {
          width: 302px;
          margin-left: auto;
        }

        .totals-line,
        .payment-line {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .totals-line + .totals-line {
          margin-top: 8px;
        }

        .totals-line .label,
        .payment-label {
          color: #64748b;
        }

        .totals-line .value,
        .payment-value {
          color: #0f172a;
          font-weight: 600;
          text-align: right;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .totals-line.strong {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .totals-line.strong .label,
        .totals-line.strong .value {
          font-size: 18px;
          line-height: 1.45;
          font-weight: 600;
          color: #0f172a;
        }

        .payment-section {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .payment-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 32px;
        }

        .payment-lines {
          flex: 1;
          min-width: 0;
        }

        .payment-line + .payment-line {
          margin-top: 6px;
        }

        .payment-label {
          min-width: 100px;
          font-size: 12px;
          line-height: 1.55;
          font-weight: 500;
        }

        .payment-value {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          line-height: 1.55;
        }

        .payment-value.mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .payment-qr {
          width: 122px;
          flex-shrink: 0;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          padding: 8px;
        }

        .payment-qr img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .section-footer {
          padding: 16px 32px;
          border-top: 1px solid #f8fafc;
          text-align: center;
        }

        .section-footer-row {
          display: inline-flex;
          align-items: flex-start;
          justify-content: center;
          gap: 8px;
        }

        .section-footer-icon {
          width: 10px;
          height: 10px;
          color: #94a3b8;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .section-footer-icon svg {
          width: 100%;
          height: 100%;
          display: block;
          fill: currentColor;
        }

        .section-footer-copy {
          margin: 0;
          font-size: 10px;
          line-height: 1.7;
          color: #94a3b8;
          white-space: pre-wrap;
        }

        .brand-footer {
          padding: 32px;
          border-top: 1px solid #f8fafc;
          text-align: center;
          font-size: 10px;
          line-height: 1.4;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }
      </style>
      ${screenScript}
    </head>
    <body>
      <div class="page-stage" id="page-stage">
        <div class="page-shell" id="page-shell">
          <article class="document" id="page-document">
            <header class="doc-header">
              <div class="doc-header-grid ${isHeaderReversed ? 'reversed' : ''}">
                <div class="doc-title-block ${isHeaderReversed ? 'title-right' : 'title-left'}">
                  <h1 class="doc-title">${escapeHtml(docTitle)}</h1>
                  ${invoice.visibility?.invoiceNumber !== false
      ? `<p class="doc-number">#${escapeHtml(invoice.invoiceNumber)}</p>`
      : ''
    }
                </div>

                <div class="sender-cluster ${isHeaderReversed ? 'reversed' : ''}">
                  ${invoice.sender.logo
      ? `<img class="sender-logo" src="${escapeAttribute(
        invoice.sender.logo
      )}" alt="${escapeAttribute(previewCopy.logoAlt)}" />`
      : ''
    }
                  <div>
                    <h2 class="sender-name ${invoice.sender.name.trim() ? '' : 'placeholder'}">${escapeHtml(
      invoice.sender.name.trim() || previewCopy.namePlaceholder
    )}</h2>
                    ${renderPartyLines({
      address: invoice.sender.address,
      phone: invoice.sender.phone,
      email: invoice.sender.email,
    }, previewCopy)}
                    ${renderCustomFieldLines(invoice.sender.customFields)}
                  </div>
                </div>
              </div>
            </header>

            <main class="doc-body">
              <section class="meta-grid">
                <div class="client-card">
                  <p class="client-name ${invoice.client.name.trim() ? '' : 'placeholder'}">${escapeHtml(
      invoice.client.name.trim() || previewCopy.clientName
    )}</p>
                  ${renderClientLines({
      address: invoice.client.address,
      phone: invoice.client.phone,
      email: invoice.client.email,
    }, previewCopy)}
                  ${renderClientCustomFieldLines(invoice.client.customFields)}
                </div>

                <div class="dates-column">
                  ${invoice.visibility?.date !== false
      ? `
                        <div class="date-block">
                          <p class="date-label">${escapeHtml(dateLabel)}</p>
                          <p class="date-value">${escapeHtml(invoice.date)}</p>
                        </div>
                      `
      : ''
    }
                  ${invoice.visibility?.dueDate !== false
      ? `
                        <div class="date-block">
                          <p class="date-label">${escapeHtml(dueDateLabel)}</p>
                          <p class="date-value">${escapeHtml(invoice.dueDate)}</p>
                        </div>
                      `
      : ''
    }
                </div>
              </section>

              <table class="items-table">
                <thead>
                  <tr class="items-head-row">
                    ${visibleColumns
      .map(
        (column, columnIndex) => `
                          <th class="items-head-cell ${getColumnAlignmentClass(column)} ${columnIndex === 0 ? 'first-column' : ''
          }">
                            ${escapeHtml(column.label)}
                          </th>
                        `
      )
      .join('')}
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items
      .map(
        (item) => `
                        <tr class="items-body-row">
                          ${visibleColumns
            .map(
              (column, columnIndex) => `
                                <td class="items-body-cell ${getColumnAlignmentClass(
                column
              )} ${columnIndex === 0 ? 'first-column' : ''} ${column.type === 'system-amount' ? 'amount' : ''
                } ${isTextualColumn(column) ? 'textual' : ''}">
                                  ${renderItemCell(item, column, invoice.currency, locale, previewCopy)}
                                </td>
                              `
            )
            .join('')}
                        </tr>
                      `
      )
      .join('')}
                </tbody>
              </table>

              <section class="summary-row">
                <div class="signature-wrap">
                  ${invoice.visibility?.signature === true
      ? `
                        ${invoice.sender.signature ? `<img class="signature-image" src="${escapeAttribute(invoice.sender.signature)}" alt="Signature" />` : ''}
                        <div class="signature-line">
                          <p class="signature-label">${escapeHtml(previewCopy.authorizedSignature)}</p>
                          <p class="signature-name ${invoice.sender.name.trim() ? '' : 'placeholder'}">${escapeHtml(
        invoice.sender.name.trim() || previewCopy.namePlaceholder
      )}</p>
                        </div>
                      `
      : ''
    }
                </div>

                <div class="totals-panel">
                  <div class="totals-line">
                    <span class="label">${escapeHtml(previewCopy.subtotal)}</span>
                    <span class="value">${formatMoney(locale, invoice.currency, totals.subtotal)}</span>
                  </div>
                  <div class="totals-line">
                    <span class="label">${escapeHtml(
      `${previewCopy.taxRate} (${String(invoice.taxRate)}%)`
    )}</span>
                    <span class="value">${formatMoney(locale, invoice.currency, totals.tax)}</span>
                  </div>
                  <div class="totals-line strong">
                    <span class="label">${escapeHtml(translation.total || 'Total')}</span>
                    <span class="value">${formatMoney(locale, invoice.currency, totals.total)}</span>
                  </div>
                </div>
              </section>

              ${hasPaymentSection
      ? `
                    <section class="payment-section">
                      <div class="payment-grid">
                        <div class="payment-lines">
                          ${paymentFields
        .map(
          (field) => `
                                <div class="payment-line">
                                  <span class="payment-label">${escapeHtml(field.label)}:</span>
                                  <span class="payment-value ${field.id === 'accountNumber' ? 'mono' : ''}">
                                    ${renderOptionalText(field.value)}
                                  </span>
                                </div>
                              `
        )
        .join('')}
                        </div>
                        ${invoice.paymentInfo?.qrCode
        ? `
                              <div class="payment-qr">
                                <img src="${escapeAttribute(invoice.paymentInfo.qrCode)}" alt="${escapeAttribute(
          previewCopy.paymentQrCode
        )}" />
                              </div>
                            `
        : ''
      }
                      </div>
                    </section>
                  `
      : ''
    }
            </main>

            ${invoice.visibility?.disclaimer !== false && invoice.sender.disclaimerText
      ? `
                  <section class="section-footer">
                    <div class="section-footer-row">
                      <span class="section-footer-icon" aria-hidden="true">${getInfoIconSvg(
        'disclaimer'
      )}</span>
                      <p class="section-footer-copy">${formatMultilineText(
        invoice.sender.disclaimerText
      )}</p>
                    </div>
                  </section>
                `
      : ''
    }

            <footer class="brand-footer">${escapeHtml(previewCopy.poweredBy)}</footer>
          </article>
        </div>
      </div>
    </body>
  </html>`;
}

function getRenderablePaymentFields(
  paymentInfo: PaymentInfo | undefined,
  previewCopy: PreviewCopy
) {
  if (paymentInfo?.fields?.length) {
    return [...paymentInfo.fields].sort((a, b) => a.order - b.order);
  }

  const fallbackFields: PaymentInfoField[] = [
    {
      id: 'bankName',
      label: previewCopyLabel(previewCopy, 'bankName'),
      type: 'text',
      order: 0,
      visible: true,
      required: true,
      value: paymentInfo?.bankName || '',
    },
    {
      id: 'accountName',
      label: previewCopyLabel(previewCopy, 'accountName'),
      type: 'text',
      order: 1,
      visible: true,
      required: true,
      value: paymentInfo?.accountName || '',
    },
    {
      id: 'accountNumber',
      label: previewCopyLabel(previewCopy, 'accountNumber'),
      type: 'text',
      order: 2,
      visible: true,
      required: true,
      value: paymentInfo?.accountNumber || '',
    },
    {
      id: 'address',
      label: previewCopyLabel(previewCopy, 'bankAddress'),
      type: 'textarea',
      order: 3,
      visible: true,
      required: false,
      value: paymentInfo?.address || '',
    },
    {
      id: 'extraInfo',
      label: previewCopyLabel(previewCopy, 'extraInfo'),
      type: 'textarea',
      order: 4,
      visible: true,
      required: false,
      value: paymentInfo?.extraInfo || '',
    },
    ...((paymentInfo?.customFields || []).map((field, index) => ({
      id: field.id,
      label: field.label,
      type: 'text' as const,
      order: 10 + index,
      visible: true,
      required: false,
      value: field.value,
    })) || []),
  ];

  return fallbackFields.filter((field) => field.value.trim());
}

function renderItemCell(
  item: Invoice['items'][number],
  column: InvoiceColumn,
  currency: string,
  locale: string,
  previewCopy: PreviewCopy
) {
  switch (column.type) {
    case 'system-text':
      return renderOptionalText(item.description, previewCopy.itemDescriptionExample);
    case 'system-quantity':
      return renderOptionalText(stringifyValue(item.quantity) || '0');
    case 'system-rate':
      return formatMoney(locale, currency, Number(item.rate || 0));
    case 'system-amount': {
      const amount =
        item.amount !== undefined && item.amount !== ''
          ? Number(item.amount)
          : Number(item.quantity || 0) * Number(item.rate || 0);
      return formatMoney(locale, currency, amount);
    }
    case 'custom-text':
    case 'custom-number':
      return renderOptionalText(String(item.customValues?.[column.id] || ''));
    default:
      return '&mdash;';
  }
}

function getColumnAlignmentClass(column: InvoiceColumn) {
  if (column.type === 'system-amount') {
    return 'right';
  }

  if (column.type === 'system-quantity' || column.type === 'system-rate') {
    return 'center';
  }

  return 'left';
}

function renderPartyLines(
  values: { address?: string; phone?: string; email?: string },
  previewCopy: PreviewCopy
) {
  return (
    [
      { key: 'address' as const, value: values.address, placeholder: previewCopy.addrPlaceholder },
      { key: 'phone' as const, value: values.phone, placeholder: previewCopy.addPhone },
      { key: 'email' as const, value: values.email, placeholder: previewCopy.addEmail },
    ]
      .map(
        (entry, index) =>
          `<p class="sender-line ${index === 0 ? 'leading' : ''} ${entry.value?.trim() ? '' : 'placeholder'}"><span class="info-icon" aria-hidden="true">${getInfoIconSvg(
            entry.key
          )}</span>${renderDisplayText(entry.value, entry.placeholder)}</p>`
      )
      .join('')
  );
}

function renderCustomFieldLines(fields: CustomField[] | undefined) {
  return (fields || [])
    .filter((field) => field.label.trim() || field.value.trim())
    .map(
      (field) => `
        <p class="party-line">
          <strong>${escapeHtml(field.label || '')}</strong>
          ${field.label ? ' ' : ''}${formatMultilineText(field.value || '')}
        </p>
      `
    )
    .join('');
}

function renderClientLines(
  values: { address?: string; phone?: string; email?: string },
  previewCopy: PreviewCopy
) {
  return (
    [
      { key: 'address' as const, value: values.address, placeholder: previewCopy.clientAddr },
      { key: 'phone' as const, value: values.phone, placeholder: previewCopy.addPhone },
      { key: 'email' as const, value: values.email, placeholder: previewCopy.addEmail },
    ]
      .map(
        (entry, index) =>
          `<p class="client-line ${index === 0 ? 'leading' : ''} ${entry.value?.trim() ? '' : 'placeholder'}"><span class="info-icon" aria-hidden="true">${getInfoIconSvg(
            entry.key
          )}</span>${renderDisplayText(entry.value, entry.placeholder)}</p>`
      )
      .join('')
  );
}

function isTextualColumn(column: InvoiceColumn) {
  return !(
    column.type === 'system-amount' ||
    column.type === 'system-quantity' ||
    column.type === 'system-rate'
  );
}


function renderClientCustomFieldLines(fields: CustomField[] | undefined) {
  return (fields || [])
    .filter((field) => field.label.trim() || field.value.trim())
    .map(
      (field) => `
        <p class="client-line">
          <strong>${escapeHtml(field.label || '')}</strong>
          ${field.label ? ' ' : ''}${formatMultilineText(field.value || '')}
        </p>
      `
    )
    .join('');
}

function renderOptionalText(value: string | number | undefined, placeholder?: string) {
  const stringValue = stringifyValue(value).trim();
  return stringValue
    ? formatMultilineText(stringValue)
    : placeholder
      ? `<span class="field-placeholder">${escapeHtml(placeholder)}</span>`
      : '&mdash;';
}

function stringifyValue(value: number | string | undefined) {
  return value === undefined ? '' : String(value);
}

function formatMoney(locale: string, currency: string, amount: number) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatMultilineText(value: string) {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}

function resolveDocumentTitle(invoice: Invoice, translation: Record<string, string>) {
  const customTitle = invoice.customStrings?.invoiceTitle?.trim();
  if (customTitle) {
    return customTitle;
  }

  const fallback =
    invoice.type === 'invoice' ? translation.invoiceMode || 'Invoice Mode' : translation.receiptMode || 'Receipt Mode';

  return fallback.split(' ')[0]?.toUpperCase() || (invoice.type === 'invoice' ? 'INVOICE' : 'RECEIPT');
}

function getInfoIconSvg(kind: 'address' | 'phone' | 'email' | 'disclaimer') {
  switch (kind) {
    case 'address':
      return '<svg viewBox="0 0 384 512" aria-hidden="true"><path d="M172.3 501.7C26.97 291 0 269.4 0 192 0 85.96 85.96 0 192 0S384 85.96 384 192c0 77.4-26.98 99-172.3 309.7-9.5 13.8-29.9 13.8-39.4 0zM192 272c44.18 0 80-35.82 80-80S236.2 112 192 112 112 147.8 112 192s35.8 80 80 80z"/></svg>';
    case 'phone':
      return '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M511.1 387.1c-1.21 12.33-4.85 24.51-10.75 35.41c-13.21 24.39-37.86 41.61-65.95 46.59c-24.35 4.317-48.45 6.226-72.62 6.226c-108.7 0-214.9-38.02-299.6-108.5C26.14 286.7-12.86 180.4 4.362 73.76C9.548 41.69 29.1 14.64 56.63 5.125C77.95-2.25 102.7-1.5 122.7 10.38l69.98 41.59c21.68 12.89 33.68 37.52 30.48 62.59l-9.062 71.41c-1.312 10.36 1.906 20.8 8.812 28.66l68.84 78.32c6.906 7.859 16.93 11.86 27.12 10.97l70.68-6.219c24.86-2.172 49.09 9.844 61.52 30.5l40.2 67.05c11.4 19.01 16.1 41.77 13.82 64.84z"/></svg>';
    case 'email':
      return '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M502.3 190.8l-192 160c-15.38 12.81-38.25 12.81-53.63 0l-192-160C24.6 178.9 16 161.3 16 142.8V128c0-35.35 28.65-64 64-64h352c35.35 0 64 28.65 64 64v14.81c0 18.48-8.599 36.12-23.73 47.99zM16 215.8l188.1 156.8c30.75 25.62 74.12 25.62 104.9 0L496 215.8V384c0 35.35-28.65 64-64 64H80c-35.35 0-64-28.65-64-64V215.8z"/></svg>';
    case 'disclaimer':
      return '<svg viewBox="0 0 640 512" aria-hidden="true"><path d="M622.3 153.7L343.1 15.15c-14.4-7.144-31.7-7.144-46.06 0L17.75 153.7C6.956 159.1 0 170.1 0 182.2v147.6c0 67.64 28.44 132.3 78.31 176.5l97.5 86.32c18.06 16 45.31 16 63.38 0l97.5-86.32C411.6 462.1 440 397.5 440 329.9V294.4l136.8 67.94c9.438 4.687 20.69 4.156 29.63-1.375C615.4 355.5 621.3 345.5 621.3 334.7V179.3C640 168.5 634.5 159.7 622.3 153.7zM223.1 320.1l-47.1-47.06c-9.375-9.375-9.375-24.56 0-33.94c9.375-9.375 24.56-9.375 33.94 0L240 269.2l126.1-126.1c9.375-9.375 24.56-9.375 33.94 0c9.375 9.375 9.375 24.56 0 33.94l-143 143C247.6 329.4 232.4 329.4 223.1 320.1z"/></svg>';
  }
}

function renderDisplayText(value: string | undefined, placeholder: string) {
  const trimmed = value?.trim();
  return trimmed ? formatMultilineText(trimmed) : escapeHtml(placeholder);
}

function resolvePreviewCopy(lang: Language, translation: Record<string, string>): PreviewCopy {
  const baseByLanguage: Record<Language, Pick<PreviewCopy, 'addEmail' | 'addPhone' | 'paymentQrCode' | 'signatureAlt' | 'logoAlt'>> = {
    en: {
      addEmail: 'Add email',
      addPhone: 'Add phone',
      paymentQrCode: 'Payment QR Code',
      signatureAlt: 'Signature',
      logoAlt: 'Logo',
    },
    'zh-TW': {
      addEmail: '新增電子郵件',
      addPhone: '新增電話',
      paymentQrCode: '付款 QR Code',
      signatureAlt: '簽名',
      logoAlt: 'Logo',
    },
    fr: {
      addEmail: 'Add email',
      addPhone: 'Add phone',
      paymentQrCode: 'Payment QR Code',
      signatureAlt: 'Signature',
      logoAlt: 'Logo',
    },
    de: {
      addEmail: 'Add email',
      addPhone: 'Add phone',
      paymentQrCode: 'Payment QR Code',
      signatureAlt: 'Signature',
      logoAlt: 'Logo',
    },
    ja: {
      addEmail: 'メールを追加',
      addPhone: '電話番号を追加',
      paymentQrCode: '支払い QR コード',
      signatureAlt: '署名',
      logoAlt: 'Logo',
    },
  };

  return {
    ...baseByLanguage[lang],
    addrPlaceholder: translation.addrPlaceholder || 'Address and contact info',
    authorizedSignature: translation.authorizedSignature || 'Authorized Signature',
    clientAddr: translation.clientAddr || 'Client Address',
    clientName: translation.clientName || 'Client Name',
    dueDate: translation.dueDate || 'Due Date',
    invoiceDate: translation.invoiceDate || 'Date',
    itemDescriptionExample: translation.itemDescriptionExample || 'Example Service Item',
    namePlaceholder: translation.namePlaceholder || 'Business/Personal Name',
    poweredBy: translation.poweredBy || 'Powered by SmartBill Pro',
    subtotal: translation.subtotal || 'Subtotal',
    taxRate:
      translation.taxRate === 'Tax Rate (%)'
        ? 'Tax Rate / VAT'
        : translation.taxRate || 'Tax Rate / VAT',
  };
}

function previewCopyLabel(
  previewCopy: PreviewCopy,
  kind: 'bankName' | 'accountName' | 'accountNumber' | 'bankAddress' | 'extraInfo'
) {
  switch (kind) {
    case 'bankName':
      return 'Bank Name';
    case 'accountName':
      return 'Account Name';
    case 'accountNumber':
      return 'Account Number';
    case 'bankAddress':
      return 'Bank Address';
    case 'extraInfo':
      return 'Additional Info (SWIFT/IBAN)';
  }
}

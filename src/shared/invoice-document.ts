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

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: 'en-US',
  'zh-TW': 'zh-TW',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
};

export function buildInvoiceDocumentHtml(
  invoice: Invoice,
  { lang = 'en', mode = 'app-preview' }: InvoiceDocumentOptions = {}
) {
  const translation = translations[lang] || translations.en;
  const totals = calculateInvoiceTotals(invoice.items, invoice.taxRate);
  const visibleColumns = getSortedInvoiceColumns(invoice.columnConfig).filter(
    (column) => column.visible
  );
  const paymentFields = getRenderablePaymentFields(invoice.paymentInfo).filter(
    (field) => field.visible
  );
  const hasPaymentSection =
    invoice.visibility?.paymentInfo === true && hasPaymentInfoContent(invoice.paymentInfo);
  const docTitle =
    invoice.customStrings?.invoiceTitle?.trim() ||
    (invoice.type === 'invoice' ? 'INVOICE' : 'RECEIPT');
  const dateLabel = invoice.customStrings?.dateLabel?.trim() || 'Date';
  const dueDateLabel = invoice.customStrings?.dueDateLabel?.trim() || 'Due Date';
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
          min-height: 296mm;
          background: #ffffff;
          color: #1e293b;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          ${mode === 'app-preview' ? 'box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);' : ''}
        }

        .doc-header {
          border-bottom: 4px solid #0f172a;
          padding: 40px 48px 34px;
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

        .doc-title {
          margin: 0 0 4px;
          font-size: 32px;
          line-height: 1.15;
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
          gap: 12px;
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
          margin: 8px 0 0;
          font-size: 12px;
          line-height: 1.55;
          color: rgba(15, 23, 42, 0.8);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .doc-body {
          padding: 40px 48px 48px;
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
        }

        .items-head-row {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .items-head-cell {
          padding: 16px 24px;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 700;
          color: #0f172a;
          text-align: left;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          vertical-align: top;
        }

        .items-head-cell.center,
        .items-body-cell.center {
          text-align: center;
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
          line-height: 1.55;
          color: #0f172a;
          vertical-align: top;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .items-body-cell.amount {
          font-weight: 700;
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
          border-radius: 12px;
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
              <div class="doc-header-grid ${invoice.isHeaderReversed ? 'reversed' : ''}">
                <div class="doc-title-block">
                  <h1 class="doc-title">${escapeHtml(docTitle)}</h1>
                  ${
                    invoice.visibility?.invoiceNumber !== false
                      ? `<p class="doc-number">#${escapeHtml(invoice.invoiceNumber)}</p>`
                      : ''
                  }
                </div>

                <div class="sender-cluster ${invoice.isHeaderReversed ? 'reversed' : ''}">
                  ${
                    invoice.sender.logo
                      ? `<img class="sender-logo" src="${escapeAttribute(
                          invoice.sender.logo
                        )}" alt="Logo" />`
                      : ''
                  }
                  <div>
                    <h2 class="sender-name">${escapeHtml(
                      invoice.sender.name || 'Your business'
                    )}</h2>
                    ${renderPartyLines([
                      invoice.sender.address,
                      invoice.sender.phone,
                      invoice.sender.email,
                    ])}
                    ${renderCustomFieldLines(invoice.sender.customFields)}
                  </div>
                </div>
              </div>
            </header>

            <main class="doc-body">
              <section class="meta-grid">
                <div class="client-card">
                  <p class="client-name">${escapeHtml(
                    invoice.client.name || 'Unknown client'
                  )}</p>
                  ${renderClientLines([
                    invoice.client.address,
                    invoice.client.phone,
                    invoice.client.email,
                  ])}
                  ${renderClientCustomFieldLines(invoice.client.customFields)}
                </div>

                <div class="dates-column">
                  ${
                    invoice.visibility?.date !== false
                      ? `
                        <div class="date-block">
                          <p class="date-label">${escapeHtml(dateLabel)}</p>
                          <p class="date-value">${escapeHtml(invoice.date)}</p>
                        </div>
                      `
                      : ''
                  }
                  ${
                    invoice.visibility?.dueDate !== false
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
                        (column) => `
                          <th class="items-head-cell ${getColumnAlignmentClass(column)}">
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
                              (column) => `
                                <td class="items-body-cell ${getColumnAlignmentClass(
                                  column
                                )} ${column.type === 'system-amount' ? 'amount' : ''}">
                                  ${renderItemCell(item, column, invoice.currency, locale)}
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
                  ${
                    invoice.visibility?.signature === true
                      ? `
                        ${invoice.sender.signature ? `<img class="signature-image" src="${escapeAttribute(invoice.sender.signature)}" alt="Signature" />` : ''}
                        <div class="signature-line">
                          <p class="signature-label">Authorized Signature</p>
                          <p class="signature-name">${escapeHtml(invoice.sender.name || '')}</p>
                        </div>
                      `
                      : ''
                  }
                </div>

                <div class="totals-panel">
                  <div class="totals-line">
                    <span class="label">Subtotal</span>
                    <span class="value">${formatMoney(locale, invoice.currency, totals.subtotal)}</span>
                  </div>
                  <div class="totals-line">
                    <span class="label">Tax (${escapeHtml(String(invoice.taxRate))}%)</span>
                    <span class="value">${formatMoney(locale, invoice.currency, totals.tax)}</span>
                  </div>
                  <div class="totals-line strong">
                    <span class="label">${escapeHtml(translation.total || 'Total')}</span>
                    <span class="value">${formatMoney(locale, invoice.currency, totals.total)}</span>
                  </div>
                </div>
              </section>

              ${
                hasPaymentSection
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
                        ${
                          invoice.paymentInfo?.qrCode
                            ? `
                              <div class="payment-qr">
                                <img src="${escapeAttribute(invoice.paymentInfo.qrCode)}" alt="Payment QR Code" />
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

            ${
              invoice.visibility?.disclaimer !== false && invoice.sender.disclaimerText
                ? `
                  <section class="section-footer">
                    <p class="section-footer-copy">${formatMultilineText(
                      invoice.sender.disclaimerText
                    )}</p>
                  </section>
                `
                : ''
            }

            <footer class="brand-footer">Powered by SmartBill Pro</footer>
          </article>
        </div>
      </div>
    </body>
  </html>`;
}

function getRenderablePaymentFields(paymentInfo: PaymentInfo | undefined) {
  if (paymentInfo?.fields?.length) {
    return [...paymentInfo.fields].sort((a, b) => a.order - b.order);
  }

  const fallbackFields: PaymentInfoField[] = [
    {
      id: 'bankName',
      label: 'Bank name',
      type: 'text',
      order: 0,
      visible: true,
      required: true,
      value: paymentInfo?.bankName || '',
    },
    {
      id: 'accountName',
      label: 'Account name',
      type: 'text',
      order: 1,
      visible: true,
      required: true,
      value: paymentInfo?.accountName || '',
    },
    {
      id: 'accountNumber',
      label: 'Account number',
      type: 'text',
      order: 2,
      visible: true,
      required: true,
      value: paymentInfo?.accountNumber || '',
    },
    {
      id: 'extraInfo',
      label: 'Extra info',
      type: 'textarea',
      order: 3,
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
  locale: string
) {
  switch (column.type) {
    case 'system-text':
      return renderOptionalText(item.description);
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

  return '';
}

function renderPartyLines(values: Array<string | undefined>) {
  return values
    .filter((value) => Boolean(value && value.trim()))
    .map((value) => `<p class="sender-line">${formatMultilineText(value || '')}</p>`)
    .join('');
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

function renderClientLines(values: Array<string | undefined>) {
  return values
    .filter((value) => Boolean(value && value.trim()))
    .map((value) => `<p class="client-line">${formatMultilineText(value || '')}</p>`)
    .join('');
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

function renderOptionalText(value: string | number | undefined) {
  const stringValue = stringifyValue(value).trim();
  return stringValue ? formatMultilineText(stringValue) : '&mdash;';
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

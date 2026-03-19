import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  buildInvoiceDocumentHtml,
  DEFAULT_INVOICE_DOCUMENT_LANGUAGE,
} from '@/shared/invoice-document';
import type { Invoice, Language } from '@/shared/types';

export async function generateInvoicePdfFile(
  invoice: Invoice,
  lang: Language = DEFAULT_INVOICE_DOCUMENT_LANGUAGE
) {
  const html = buildInvoiceDocumentHtml(invoice, {
    lang,
    mode: 'pdf',
  });

  const result = await Print.printToFileAsync({
    html,
    margins: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  });

  return {
    ...result,
    fileName: buildInvoicePdfFileName(invoice),
  };
}

export async function shareInvoicePdfFile(
  invoice: Invoice,
  options?: {
    dialogTitle?: string;
    lang?: Language;
  }
) {
  const { uri } = await generateInvoicePdfFile(
    invoice,
    options?.lang || DEFAULT_INVOICE_DOCUMENT_LANGUAGE
  );
  const sharingAvailable = await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    return { uri, shared: false };
  }

  await Sharing.shareAsync(uri, {
    UTI: 'com.adobe.pdf',
    mimeType: 'application/pdf',
    dialogTitle: options?.dialogTitle || 'Share invoice PDF',
  });

  return { uri, shared: true };
}

export function buildInvoiceMailtoUrl(invoice: Invoice, recipientEmail: string) {
  const subject = `Invoice ${invoice.invoiceNumber}`;
  const greetingName = invoice.client.name || 'there';
  const amount = formatMoney(invoice.currency, getInvoiceTotal(invoice));
  const body = [
    `Hi ${greetingName},`,
    '',
    `Please find invoice ${invoice.invoiceNumber} attached in the next step or shared separately.`,
    `Issued date: ${invoice.date}`,
    `Total: ${amount}`,
    '',
    `Best,`,
    invoice.sender.name || 'SmartBill',
  ].join('\n');

  return `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export function buildInvoicePdfFileName(invoice: Invoice) {
  const safeClientName = (invoice.client.name || 'Client')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s_-]/g, '')
    .trim();

  return `${safeClientName || 'Client'}_${invoice.invoiceNumber}.pdf`;
}

function getInvoiceTotal(invoice: Invoice) {
  return invoice.items.reduce((sum, item) => {
    const hasExplicitAmount =
      item.amount !== undefined &&
      item.amount !== '' &&
      !Number.isNaN(Number(item.amount));
    const nextAmount = hasExplicitAmount
      ? Number(item.amount)
      : Number(item.quantity || 0) * Number(item.rate || 0);

    return sum + nextAmount;
  }, 0) * (1 + Number(invoice.taxRate || 0) / 100);
}

function formatMoney(currency: string, amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

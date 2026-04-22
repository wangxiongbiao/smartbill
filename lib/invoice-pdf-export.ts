import type { CustomField, Invoice, InvoiceItem, PaymentInfoField } from '../types';
import type { InvoicePdfMeasurements } from './invoice-pdf-measure';
import { paginateInvoicePdf } from './invoice-pdf-layout';
import type { InvoicePdfPageModel, InvoicePdfPlan } from './invoice-pdf';

export interface BuildInvoicePdfExportStateParams {
  invoice: Invoice;
  measurements: InvoicePdfMeasurements;
}

export interface InvoicePdfRenderPage {
  pageModel: InvoicePdfPageModel;
  items: InvoiceItem[];
}

export interface InvoicePdfExportState {
  invoiceForPdf: Invoice;
  plan: InvoicePdfPlan;
  renderPages: InvoicePdfRenderPage[];
}

function hasVisibleValue(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function filterCustomFields(fields?: CustomField[]): CustomField[] | undefined {
  const filtered = fields?.filter((field) => hasVisibleValue(field.label) && hasVisibleValue(field.value));
  return filtered && filtered.length > 0 ? filtered : undefined;
}

function filterPaymentInfoFields(fields?: PaymentInfoField[]): PaymentInfoField[] | undefined {
  const filtered = fields
    ?.filter((field) => field.visible !== false)
    .filter((field) => hasVisibleValue(field.label) && hasVisibleValue(field.value))
    .map((field) => ({
      ...field,
      value: field.value.trim(),
    }));

  return filtered && filtered.length > 0 ? filtered : undefined;
}

export function prepareInvoiceForPdf(invoice: Invoice): Invoice {
  const paymentFields = filterPaymentInfoFields(invoice.paymentInfo?.fields);
  const paymentCustomFields = filterCustomFields(invoice.paymentInfo?.customFields);
  const paymentInfo = invoice.paymentInfo
    ? {
        ...invoice.paymentInfo,
        fields: paymentFields,
        bankName: hasVisibleValue(invoice.paymentInfo.bankName) ? invoice.paymentInfo.bankName?.trim() : undefined,
        accountName: hasVisibleValue(invoice.paymentInfo.accountName) ? invoice.paymentInfo.accountName?.trim() : undefined,
        accountNumber: hasVisibleValue(invoice.paymentInfo.accountNumber) ? invoice.paymentInfo.accountNumber?.trim() : undefined,
        extraInfo: hasVisibleValue(invoice.paymentInfo.extraInfo) ? invoice.paymentInfo.extraInfo?.trim() : undefined,
        customFields: paymentCustomFields,
      }
    : undefined;

  return {
    ...invoice,
    sender: {
      ...invoice.sender,
      name: invoice.sender.name?.trim() || '',
      email: hasVisibleValue(invoice.sender.email) ? invoice.sender.email.trim() : '',
      phone: hasVisibleValue(invoice.sender.phone) ? invoice.sender.phone.trim() : '',
      address: invoice.sender.address?.trim() || '',
      disclaimerText: hasVisibleValue(invoice.sender.disclaimerText) ? invoice.sender.disclaimerText?.trim() : undefined,
      customFields: filterCustomFields(invoice.sender.customFields),
    },
    client: {
      ...invoice.client,
      name: invoice.client.name?.trim() || '',
      email: hasVisibleValue(invoice.client.email) ? invoice.client.email.trim() : '',
      phone: hasVisibleValue(invoice.client.phone) ? invoice.client.phone.trim() : '',
      address: invoice.client.address?.trim() || '',
      customFields: filterCustomFields(invoice.client.customFields),
    },
    paymentInfo,
  };
}

export function getInvoicePdfPageItems(invoice: Invoice, pageModel: InvoicePdfPageModel): InvoiceItem[] {
  const pageItemIds = new Set(pageModel.itemIds);
  return invoice.items.filter((item) => pageItemIds.has(item.id));
}

export function buildInvoicePdfExportState({
  invoice,
  measurements,
}: BuildInvoicePdfExportStateParams): InvoicePdfExportState {
  const invoiceForPdf = prepareInvoiceForPdf(invoice);
  const plan = paginateInvoicePdf({ invoice: invoiceForPdf, measurements });

  return buildInvoicePdfExportStateFromPlan({
    invoice: invoiceForPdf,
    plan,
    invoiceAlreadyPrepared: true,
  });
}

export function buildInvoicePdfExportStateFromPlan({
  invoice,
  plan,
  invoiceAlreadyPrepared = false,
}: {
  invoice: Invoice;
  plan: InvoicePdfPlan;
  invoiceAlreadyPrepared?: boolean;
}): InvoicePdfExportState {
  const invoiceForPdf = invoiceAlreadyPrepared ? invoice : prepareInvoiceForPdf(invoice);

  return {
    invoiceForPdf,
    plan,
    renderPages: plan.pages.map((pageModel) => ({
      pageModel,
      items: getInvoicePdfPageItems(invoiceForPdf, pageModel),
    })),
  };
}

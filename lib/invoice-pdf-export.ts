import type { Invoice, InvoiceItem, Language, TemplateType } from '../types';
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
  plan: InvoicePdfPlan;
  renderPages: InvoicePdfRenderPage[];
}

export interface InvoicePdfExportRenderParams {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
}

export function getInvoicePdfPageItems(invoice: Invoice, pageModel: InvoicePdfPageModel): InvoiceItem[] {
  const pageItemIds = new Set(pageModel.itemIds);
  return invoice.items.filter((item) => pageItemIds.has(item.id));
}

export function buildInvoicePdfExportState({
  invoice,
  measurements,
}: BuildInvoicePdfExportStateParams): InvoicePdfExportState {
  const plan = paginateInvoicePdf({ invoice, measurements });

  return {
    plan,
    renderPages: plan.pages.map((pageModel) => ({
      pageModel,
      items: getInvoicePdfPageItems(invoice, pageModel),
    })),
  };
}

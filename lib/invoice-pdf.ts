import type { Invoice, InvoiceItem } from '../types';

export type InvoicePdfPageKind = 'single' | 'first' | 'middle' | 'last';

export interface InvoicePdfSectionVisibility {
  header: boolean;
  compactHeader: boolean;
  meta: boolean;
  tableHeader: boolean;
  totals: boolean;
  paymentInfo: boolean;
  signature: boolean;
  disclaimer: boolean;
  footer: boolean;
}

export interface InvoicePdfPageModel {
  id: string;
  kind: InvoicePdfPageKind;
  pageNumber: number;
  itemIds: string[];
  itemStartIndex: number;
  itemEndIndex: number;
  sections: InvoicePdfSectionVisibility;
}

export interface InvoicePdfDraftPlan {
  pages: InvoicePdfPageModel[];
  allItemIds: string[];
}

export function createInvoicePdfSectionVisibility(kind: InvoicePdfPageKind): InvoicePdfSectionVisibility {
  return {
    header: kind === 'single' || kind === 'first',
    compactHeader: kind === 'middle' || kind === 'last',
    meta: kind === 'single' || kind === 'first',
    tableHeader: true,
    totals: kind === 'single' || kind === 'last',
    paymentInfo: kind === 'single' || kind === 'last',
    signature: kind === 'single' || kind === 'last',
    disclaimer: kind === 'single' || kind === 'last',
    footer: true,
  };
}

export function createInvoicePdfPageModel(
  kind: InvoicePdfPageKind,
  pageNumber: number,
  items: InvoiceItem[],
  itemStartIndex = 0,
): InvoicePdfPageModel {
  const itemIds = items.map((item) => item.id);
  const itemEndIndex = items.length > 0 ? itemStartIndex + items.length - 1 : -1;

  return {
    id: `invoice-page-${pageNumber}`,
    kind,
    pageNumber,
    itemIds,
    itemStartIndex: items.length > 0 ? itemStartIndex : -1,
    itemEndIndex,
    sections: createInvoicePdfSectionVisibility(kind),
  };
}

export function createDraftInvoicePdfPlan(invoice: Invoice): InvoicePdfDraftPlan {
  const kind: InvoicePdfPageKind = 'single';

  return {
    pages: [createInvoicePdfPageModel(kind, 1, invoice.items, 0)],
    allItemIds: invoice.items.map((item) => item.id),
  };
}

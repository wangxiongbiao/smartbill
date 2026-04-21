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

export interface InvoicePdfItemRange {
  startIndex: number;
  endIndex: number;
  count: number;
}

export interface InvoicePdfPageModel {
  id: string;
  kind: InvoicePdfPageKind;
  pageNumber: number;
  totalPages: number;
  itemIds: string[];
  itemRange: InvoicePdfItemRange;
  itemStartIndex: number;
  itemEndIndex: number;
  sections: InvoicePdfSectionVisibility;
}

export interface InvoicePdfPlanSummary {
  totalPages: number;
  totalItems: number;
  hasMultiplePages: boolean;
}

export interface InvoicePdfPlan {
  pages: InvoicePdfPageModel[];
  allItemIds: string[];
  summary: InvoicePdfPlanSummary;
}

export interface CreateInvoicePdfPageParams {
  items: InvoiceItem[];
  pageNumber: number;
  totalPages: number;
  itemStartIndex?: number;
}

export interface BuildInvoicePdfPlanParams {
  invoice: Invoice;
  pageItemGroups: InvoiceItem[][];
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

export function getInvoicePdfPageKind({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}): InvoicePdfPageKind {
  if (totalPages <= 1) return 'single';
  if (pageNumber <= 1) return 'first';
  if (pageNumber >= totalPages) return 'last';
  return 'middle';
}

export function createInvoicePdfPage({
  items,
  pageNumber,
  totalPages,
  itemStartIndex = 0,
}: CreateInvoicePdfPageParams): InvoicePdfPageModel {
  const kind = getInvoicePdfPageKind({ pageNumber, totalPages });
  const itemIds = items.map((item) => item.id);
  const hasItems = items.length > 0;
  const itemRange: InvoicePdfItemRange = {
    startIndex: hasItems ? itemStartIndex : -1,
    endIndex: hasItems ? itemStartIndex + items.length - 1 : -1,
    count: items.length,
  };

  return {
    id: `invoice-page-${pageNumber}`,
    kind,
    pageNumber,
    totalPages,
    itemIds,
    itemRange,
    itemStartIndex: itemRange.startIndex,
    itemEndIndex: itemRange.endIndex,
    sections: createInvoicePdfSectionVisibility(kind),
  };
}

function assertPageItemsFollowInvoiceOrder(invoiceItems: InvoiceItem[], pageItemGroups: InvoiceItem[][]) {
  const expectedIds = invoiceItems.map((item) => item.id);
  const actualIds = pageItemGroups.flatMap((items) => items.map((item) => item.id));

  if (expectedIds.length !== actualIds.length) {
    throw new Error('Invoice PDF page groups must include every invoice item exactly once.');
  }

  for (let index = 0; index < expectedIds.length; index += 1) {
    if (expectedIds[index] !== actualIds[index]) {
      throw new Error('Invoice PDF page groups must preserve invoice item order.');
    }
  }
}

export function buildInvoicePdfPlan({ invoice, pageItemGroups }: BuildInvoicePdfPlanParams): InvoicePdfPlan {
  if (pageItemGroups.length === 0) {
    throw new Error('Invoice PDF plan requires at least one page item group.');
  }

  assertPageItemsFollowInvoiceOrder(invoice.items, pageItemGroups);

  const totalPages = pageItemGroups.length;
  let itemStartIndex = 0;
  const pages = pageItemGroups.map((items, pageIndex) => {
    const page = createInvoicePdfPage({
      items,
      pageNumber: pageIndex + 1,
      totalPages,
      itemStartIndex,
    });
    itemStartIndex += items.length;
    return page;
  });

  return {
    pages,
    allItemIds: invoice.items.map((item) => item.id),
    summary: {
      totalPages,
      totalItems: invoice.items.length,
      hasMultiplePages: totalPages > 1,
    },
  };
}

export function createInvoicePdfPageModel(
  kind: InvoicePdfPageKind,
  pageNumber: number,
  items: InvoiceItem[],
  itemStartIndex = 0,
): InvoicePdfPageModel {
  const requestedTotalPages = kind === 'single' ? 1 : Math.max(pageNumber, 2);
  const page = createInvoicePdfPage({
    items,
    pageNumber,
    totalPages: requestedTotalPages,
    itemStartIndex,
  });

  if (page.kind === kind) {
    return page;
  }

  return {
    ...page,
    kind,
    sections: createInvoicePdfSectionVisibility(kind),
  };
}

export function createDraftInvoicePdfPlan(invoice: Invoice): InvoicePdfPlan {
  return buildInvoicePdfPlan({
    invoice,
    pageItemGroups: [invoice.items],
  });
}

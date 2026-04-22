import type { Invoice, InvoiceItem } from '../types';
import {
  buildInvoicePdfPlan,
  type InvoicePdfPageKind,
  type InvoicePdfPlan,
} from './invoice-pdf';
import {
  getInvoicePdfFallbackItemHeight,
  getInvoicePdfSectionHeight,
  sumInvoicePdfItemHeights,
  type InvoicePdfMeasurements,
} from './invoice-pdf-measure';

export interface PaginateInvoicePdfParams {
  invoice: Invoice;
  measurements: InvoicePdfMeasurements;
}

function getInvoicePdfFixedSectionKeys(kind: InvoicePdfPageKind) {
  switch (kind) {
    case 'single':
      return ['header', 'meta', 'tableHeader', 'summary', 'disclaimer', 'footer'] as const;
    case 'first':
      return ['header', 'meta', 'tableHeader', 'footer'] as const;
    case 'middle':
      return ['compactHeader', 'tableHeader', 'footer'] as const;
    case 'last':
      return ['compactHeader', 'tableHeader', 'summary', 'disclaimer', 'footer'] as const;
    default:
      return ['tableHeader', 'footer'] as const;
  }
}

export function getInvoicePdfPageFixedHeight(
  measurements: InvoicePdfMeasurements,
  kind: InvoicePdfPageKind
): number {
  return getInvoicePdfSectionHeight(measurements, [...getInvoicePdfFixedSectionKeys(kind)]);
}

export function getInvoicePdfPageAvailableItemHeight(
  measurements: InvoicePdfMeasurements,
  kind: InvoicePdfPageKind
): number {
  return measurements.pageHeight - getInvoicePdfPageFixedHeight(measurements, kind);
}

function canFitItemsOnPage(
  measurements: InvoicePdfMeasurements,
  items: InvoiceItem[],
  availableItemHeight: number
): boolean {
  if (items.length <= 1) return true;
  const fallbackItemHeight = getInvoicePdfFallbackItemHeight(measurements);
  return sumInvoicePdfItemHeights(measurements, items.map((item) => item.id), fallbackItemHeight) <= availableItemHeight;
}

function takeLeadingItemsForPage(
  measurements: InvoicePdfMeasurements,
  items: InvoiceItem[],
  availableItemHeight: number,
  leaveAtLeast: number
): InvoiceItem[] {
  const maxSelectable = Math.max(0, items.length - leaveAtLeast);
  if (maxSelectable === 0) return [];

  const selected: InvoiceItem[] = [];
  let usedHeight = 0;
  const fallbackItemHeight = getInvoicePdfFallbackItemHeight(measurements);

  for (let index = 0; index < maxSelectable; index += 1) {
    const item = items[index]!;
    const nextHeight = measurements.itemHeights[item.id] ?? fallbackItemHeight;

    if (selected.length === 0) {
      selected.push(item);
      usedHeight += nextHeight;
      continue;
    }

    if (usedHeight + nextHeight > availableItemHeight) {
      break;
    }

    selected.push(item);
    usedHeight += nextHeight;
  }

  return selected;
}

export function paginateInvoicePdf({ invoice, measurements }: PaginateInvoicePdfParams): InvoicePdfPlan {
  if (measurements.pageHeight <= 0) {
    throw new Error('Invoice PDF pagination requires a measured page height.');
  }

  if (invoice.items.length === 0) {
    return buildInvoicePdfPlan({
      invoice,
      pageItemGroups: [[]],
    });
  }

  const singleAvailable = getInvoicePdfPageAvailableItemHeight(measurements, 'single');
  if (invoice.items.length === 1 || canFitItemsOnPage(measurements, invoice.items, singleAvailable)) {
    return buildInvoicePdfPlan({
      invoice,
      pageItemGroups: [invoice.items],
    });
  }

  const firstAvailable = getInvoicePdfPageAvailableItemHeight(measurements, 'first');
  const middleAvailable = getInvoicePdfPageAvailableItemHeight(measurements, 'middle');
  const lastAvailable = getInvoicePdfPageAvailableItemHeight(measurements, 'last');

  const pageItemGroups: InvoiceItem[][] = [];
  let remainingItems = [...invoice.items];

  const firstPageItems = takeLeadingItemsForPage(measurements, remainingItems, firstAvailable, 1);
  pageItemGroups.push(firstPageItems);
  remainingItems = remainingItems.slice(firstPageItems.length);

  while (!canFitItemsOnPage(measurements, remainingItems, lastAvailable)) {
    const middlePageItems = takeLeadingItemsForPage(measurements, remainingItems, middleAvailable, 1);
    pageItemGroups.push(middlePageItems);
    remainingItems = remainingItems.slice(middlePageItems.length);
  }

  pageItemGroups.push(remainingItems);

  return buildInvoicePdfPlan({
    invoice,
    pageItemGroups,
  });
}

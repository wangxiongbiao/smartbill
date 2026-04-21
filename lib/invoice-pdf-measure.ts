import type { InvoiceItem } from '../types';

export const INVOICE_PDF_MEASURE_PAGE_ATTR = 'data-invoice-pdf-measure-page';
export const INVOICE_PDF_MEASURE_SECTION_ATTR = 'data-invoice-pdf-measure-section';
export const INVOICE_PDF_MEASURE_ITEM_ATTR = 'data-invoice-pdf-measure-item-id';
export const INVOICE_PDF_FOOTER_BLOCK_ATTR = 'data-invoice-pdf-footer-block';

export const INVOICE_PDF_MEASURE_SECTION_KEYS = [
  'header',
  'compactHeader',
  'meta',
  'tableHeader',
  'signature',
  'totals',
  'paymentInfo',
  'disclaimer',
  'footer',
] as const;

export type InvoicePdfMeasuredSectionKey = (typeof INVOICE_PDF_MEASURE_SECTION_KEYS)[number];

export type InvoicePdfMeasuredSectionHeights = Record<InvoicePdfMeasuredSectionKey, number>;

export interface InvoicePdfMeasurements {
  pageHeight: number;
  sectionHeights: InvoicePdfMeasuredSectionHeights;
  itemHeights: Record<string, number>;
}

export interface CreateInvoicePdfMeasurementsInput {
  pageHeight?: number;
  sectionHeights?: Partial<Record<InvoicePdfMeasuredSectionKey, number | null | undefined>>;
  itemHeights?: Record<string, number | null | undefined>;
}

function normalizeInvoicePdfMeasuredHeight(value: number | null | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value as number));
}

function createEmptyInvoicePdfSectionHeights(): InvoicePdfMeasuredSectionHeights {
  return {
    header: 0,
    compactHeader: 0,
    meta: 0,
    tableHeader: 0,
    signature: 0,
    totals: 0,
    paymentInfo: 0,
    disclaimer: 0,
    footer: 0,
  };
}

export function createInvoicePdfMeasurements({
  pageHeight,
  sectionHeights,
  itemHeights,
}: CreateInvoicePdfMeasurementsInput = {}): InvoicePdfMeasurements {
  const normalizedSectionHeights = createEmptyInvoicePdfSectionHeights();

  for (const key of INVOICE_PDF_MEASURE_SECTION_KEYS) {
    normalizedSectionHeights[key] = normalizeInvoicePdfMeasuredHeight(sectionHeights?.[key]);
  }

  const normalizedItemHeights = Object.fromEntries(
    Object.entries(itemHeights ?? {}).map(([itemId, value]) => [itemId, normalizeInvoicePdfMeasuredHeight(value)])
  );

  return {
    pageHeight: normalizeInvoicePdfMeasuredHeight(pageHeight),
    sectionHeights: normalizedSectionHeights,
    itemHeights: normalizedItemHeights,
  };
}

export function getInvoicePdfSectionHeight(
  measurements: InvoicePdfMeasurements,
  keys: InvoicePdfMeasuredSectionKey | InvoicePdfMeasuredSectionKey[]
): number {
  const sectionKeys = Array.isArray(keys) ? keys : [keys];
  return sectionKeys.reduce((total, key) => total + measurements.sectionHeights[key], 0);
}

export function getInvoicePdfItemHeight(
  measurements: InvoicePdfMeasurements,
  itemId: string,
  fallback = 0
): number {
  return measurements.itemHeights[itemId] ?? fallback;
}

export function sumInvoicePdfItemHeights(measurements: InvoicePdfMeasurements, itemIds: string[]): number {
  return itemIds.reduce((total, itemId) => total + getInvoicePdfItemHeight(measurements, itemId), 0);
}

function readMeasuredElementHeight(root: ParentNode, selector: string): number {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) return 0;

  return normalizeInvoicePdfMeasuredHeight(
    Math.max(element.offsetHeight, element.scrollHeight, Math.round(element.getBoundingClientRect().height))
  );
}

function readMeasuredItemHeights(root: ParentNode): Record<string, number> {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(`[${INVOICE_PDF_MEASURE_ITEM_ATTR}]`));

  return Object.fromEntries(
    elements.map((element) => {
      const itemId = element.getAttribute(INVOICE_PDF_MEASURE_ITEM_ATTR) || '';
      return [
        itemId,
        normalizeInvoicePdfMeasuredHeight(
          Math.max(element.offsetHeight, element.scrollHeight, Math.round(element.getBoundingClientRect().height))
        ),
      ];
    }).filter(([itemId]) => itemId)
  );
}

function readMeasuredSectionHeights(root: ParentNode): InvoicePdfMeasuredSectionHeights {
  const sectionHeights = Object.fromEntries(
    INVOICE_PDF_MEASURE_SECTION_KEYS.map((sectionKey) => [
      sectionKey,
      readMeasuredElementHeight(root, `[${INVOICE_PDF_MEASURE_SECTION_ATTR}="${sectionKey}"]`),
    ])
  ) as InvoicePdfMeasuredSectionHeights;

  sectionHeights.disclaimer = readMeasuredElementHeight(root, `[${INVOICE_PDF_FOOTER_BLOCK_ATTR}="disclaimer"]`);
  sectionHeights.footer = readMeasuredElementHeight(root, `[${INVOICE_PDF_FOOTER_BLOCK_ATTR}="footer"]`);

  return sectionHeights;
}

export function measureInvoicePdfElements(root: ParentNode): InvoicePdfMeasurements {
  const pageHeight = readMeasuredElementHeight(root, `[${INVOICE_PDF_MEASURE_PAGE_ATTR}="true"]`);

  return createInvoicePdfMeasurements({
    pageHeight,
    sectionHeights: readMeasuredSectionHeights(root),
    itemHeights: readMeasuredItemHeights(root),
  });
}

export function createInvoicePdfMeasurementItemGroups(items: InvoiceItem[]): InvoiceItem[][] {
  return items.map((item) => [item]);
}

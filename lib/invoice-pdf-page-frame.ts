import type { CSSProperties } from 'react';

export const INVOICE_PDF_PAGE_WIDTH_MM = 210;
export const INVOICE_PDF_PAGE_HEIGHT_MM = 297;

export function getInvoicePdfPageFrameStyle(): CSSProperties {
  const width = `${INVOICE_PDF_PAGE_WIDTH_MM}mm`;
  const height = `${INVOICE_PDF_PAGE_HEIGHT_MM}mm`;

  return {
    width,
    height,
    minHeight: height,
    maxHeight: height,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };
}

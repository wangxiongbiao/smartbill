"use client";

import { useCallback } from 'react';
import type React from 'react';
import type { Invoice, Language, TemplateType } from '@/types';

declare var html2pdf: any;

interface UseInvoicePdfExportParams {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  printAreaRef: React.RefObject<HTMLDivElement | null>;
}

export function useInvoicePdfExport({ invoice, isExporting, setIsExporting, printAreaRef }: UseInvoicePdfExportParams) {
  const handleExportPdf = useCallback(async () => {
    if (!printAreaRef.current || isExporting) return;
    setIsExporting(true);
    const filename = `${invoice.client.name ? invoice.client.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s_-]/g, '') : 'Client'}_${invoice.invoiceNumber}.pdf`;

    try {
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(printAreaRef.current)
        .save();
    } catch (error) {
      console.error('PDF Generation failed', error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  }, [invoice.client.name, invoice.invoiceNumber, isExporting, printAreaRef, setIsExporting]);

  return {
    handleExportPdf,
  };
}

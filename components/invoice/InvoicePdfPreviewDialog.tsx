'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { exportPreviewElementToPdf } from '@/lib/pdf-client';
import { Invoice, TemplateType } from '@/types/invoice';

interface InvoicePdfPreviewDialogProps {
  invoice: Invoice | null;
  template?: TemplateType;
  isOpen: boolean;
  onClose: () => void;
}

function getExportFileName(invoice: Invoice) {
  return invoice.invoiceNumber || invoice.id || 'invoice';
}

export default function InvoicePdfPreviewDialog({
  invoice,
  template,
  isOpen,
  onClose,
}: InvoicePdfPreviewDialogProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const activeTemplate = useMemo<TemplateType>(() => {
    if (invoice?.template) return invoice.template;
    if (template) return template;
    return 'minimalist';
  }, [invoice?.template, template]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = originalOverflow;
      setIsExporting(false);
    };
  }, [isOpen, isExporting, onClose]);

  if (!isOpen || !invoice) {
    return null;
  }

  const handleExport = async () => {
    if (!previewRef.current) return;

    try {
      setIsExporting(true);
      await exportPreviewElementToPdf({
        element: previewRef.current,
        fileName: getExportFileName(invoice),
      });
    } catch (error) {
      console.error('Failed to export PDF from preview:', error);
      window.alert('导出 PDF 失败，请稍后重试。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
        onClick={() => {
          if (!isExporting) onClose();
        }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-[1120px] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6"
      >
        <div className="max-h-[76vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
          <div
            className="mx-auto w-[210mm] max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl pointer-events-none select-none"
          >
            <div ref={previewRef}>
              <InvoicePreview
                invoice={invoice}
                template={activeTemplate}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isExporting ? '导出中...' : '导出'}
          </button>
        </div>
      </div>
    </div>
  );
}

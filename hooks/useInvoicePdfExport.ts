"use client";

import { createElement, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { RefObject } from 'react';
import InvoicePdfPage from '@/components/invoice-preview/InvoicePdfPage';
import { buildInvoicePdfExportState } from '@/lib/invoice-pdf-export';
import { measureDetachedInvoicePdf } from '@/lib/invoice-pdf-measure-client';
import type { Invoice, Language, TemplateType } from '@/types';

interface UseInvoicePdfExportParams {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  printAreaRef: RefObject<HTMLDivElement | null>;
}

interface CreateDetachedExportPageSurfaceParams {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
  pageModel: ReturnType<typeof buildInvoicePdfExportState>['renderPages'][number]['pageModel'];
}

function sanitizeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s_-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60) || 'invoice';
}

async function waitForFonts() {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  } catch {
    // Ignore and continue export.
  }
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const done = () => resolve();
      image.addEventListener('load', done, { once: true });
      image.addEventListener('error', done, { once: true });
      window.setTimeout(done, 2500);
    });
  }));
}

async function waitForNextPaint() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function createDetachedExportPageSurface({
  invoice,
  template,
  isHeaderReversed,
  lang,
  pageModel,
}: CreateDetachedExportPageSurfaceParams) {
  const shell = document.createElement('div');
  shell.setAttribute('data-invoice-export-shell', 'true');
  Object.assign(shell.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '210mm',
    pointerEvents: 'none',
    background: '#ffffff',
    transform: 'translateX(calc(-100% - 48px))',
    zIndex: '-1',
  } satisfies Partial<CSSStyleDeclaration>);

  const rootNode = document.createElement('div');
  rootNode.setAttribute('data-invoice-export-root', 'true');
  rootNode.style.width = '210mm';
  shell.appendChild(rootNode);
  document.body.appendChild(shell);

  const root = createRoot(rootNode);
  flushSync(() => {
    root.render(
      createElement(InvoicePdfPage, {
        invoice,
        template,
        isHeaderReversed,
        lang,
        pageModel,
      })
    );
  });

  return {
    rootNode,
    cleanup() {
      root.unmount();
      shell.remove();
    },
  };
}

async function renderInvoicePdfPageCanvas(target: HTMLElement) {
  await waitForFonts();
  await waitForImages(target);
  await waitForNextPaint();

  const targetRect = target.getBoundingClientRect();
  const width = Math.max(
    1,
    Math.round(target.scrollWidth),
    Math.round(target.clientWidth),
    Math.round(targetRect.width)
  );
  const height = Math.max(
    1,
    Math.round(target.scrollHeight),
    Math.round(target.clientHeight),
    Math.round(targetRect.height)
  );

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      const clonedShell = clonedDoc.querySelector<HTMLElement>('[data-invoice-export-shell="true"]');
      if (clonedShell) {
        clonedShell.style.position = 'fixed';
        clonedShell.style.top = '0';
        clonedShell.style.left = '0';
        clonedShell.style.transform = 'none';
        clonedShell.style.pointerEvents = 'none';
        clonedShell.style.background = '#ffffff';
      }

      const clonedTarget = clonedDoc.querySelector<HTMLElement>('[data-invoice-export-root="true"]');
      if (clonedTarget) {
        clonedTarget.style.width = `${width}px`;
        clonedTarget.style.maxWidth = 'none';
      }
    },
  });

  return canvas;
}

export function useInvoicePdfExport({
  invoice,
  template,
  isHeaderReversed,
  lang,
  isExporting,
  setIsExporting,
}: UseInvoicePdfExportParams) {
  const handleExportPdf = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);
    const filename = `${sanitizeFilenamePart(invoice.client.name || 'Client')}_${sanitizeFilenamePart(invoice.invoiceNumber || 'invoice')}.pdf`;

    try {
      const measurements = await measureDetachedInvoicePdf({
        invoice,
        template,
        isHeaderReversed,
        lang,
      });
      const exportState = buildInvoicePdfExportState({
        invoice,
        measurements,
      });

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (const [pageIndex, renderPage] of exportState.renderPages.entries()) {
        const exportSurface = createDetachedExportPageSurface({
          invoice,
          template,
          isHeaderReversed,
          lang,
          pageModel: renderPage.pageModel,
        });

        try {
          const canvas = await renderInvoicePdfPageCanvas(exportSurface.rootNode);

          if (pageIndex > 0) {
            pdf.addPage();
          }

          pdf.addImage(
            canvas.toDataURL('image/jpeg', 0.98),
            'JPEG',
            0,
            0,
            pageWidth,
            pageHeight,
            undefined,
            'FAST'
          );
        } finally {
          exportSurface.cleanup();
        }
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Invoice PDF generation failed', error);
    } finally {
      setIsExporting(false);
    }
  }, [invoice, invoice.client.name, invoice.invoiceNumber, isExporting, isHeaderReversed, lang, setIsExporting, template]);

  return {
    handleExportPdf,
  };
}

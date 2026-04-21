"use client";

import { createElement, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type React from 'react';
import InvoicePreview from '@/components/InvoicePreview';
import type { Invoice, Language, TemplateType } from '@/types';

interface UseInvoicePdfExportParams {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  printAreaRef: React.RefObject<HTMLDivElement | null>;
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

function createDetachedExportSurface({
  invoice,
  template,
  isHeaderReversed,
  lang,
}: Pick<UseInvoicePdfExportParams, 'invoice' | 'template' | 'isHeaderReversed' | 'lang'>) {
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
      createElement(InvoicePreview, {
        invoice,
        template,
        isHeaderReversed,
        isForPdf: true,
        lang,
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
    let exportSurface: ReturnType<typeof createDetachedExportSurface> | null = null;

    try {
      exportSurface = createDetachedExportSurface({
        invoice,
        template,
        isHeaderReversed,
        lang,
      });

      const target = exportSurface.rootNode;
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

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageHeightPx = Math.max(1, Math.floor((canvas.width * pageHeight) / pageWidth));
      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const context = pageCanvas.getContext('2d');
        if (!context) {
          throw new Error('Failed to create export canvas context.');
        }

        context.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const imageHeight = (sliceHeight * pageWidth) / canvas.width;
        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 0.98),
          'JPEG',
          0,
          0,
          pageWidth,
          imageHeight,
          undefined,
          'FAST'
        );

        renderedHeight += sliceHeight;
        pageIndex += 1;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Invoice PDF generation failed', error);
    } finally {
      exportSurface?.cleanup();
      setIsExporting(false);
    }
  }, [invoice, invoice.client.name, invoice.invoiceNumber, isExporting, isHeaderReversed, lang, setIsExporting, template]);

  return {
    handleExportPdf,
  };
}

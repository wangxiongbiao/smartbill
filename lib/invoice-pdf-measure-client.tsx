'use client';

import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import InvoicePdfMeasureSurface from '@/components/invoice-preview/InvoicePdfMeasureSurface';
import { measureInvoicePdfElements, type InvoicePdfMeasurements } from '@/lib/invoice-pdf-measure';
import type { Invoice, Language, TemplateType } from '@/types';

interface MeasureDetachedInvoicePdfParams {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
}

async function waitForFonts() {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  } catch {
    // Ignore and continue.
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

export async function measureDetachedInvoicePdf({
  invoice,
  template,
  isHeaderReversed,
  lang,
}: MeasureDetachedInvoicePdfParams): Promise<InvoicePdfMeasurements> {
  const shell = document.createElement('div');
  shell.setAttribute('data-invoice-pdf-measure-host', 'true');
  document.body.appendChild(shell);

  const root = createRoot(shell);

  try {
    flushSync(() => {
      root.render(
        createElement(InvoicePdfMeasureSurface, {
          invoice,
          template,
          isHeaderReversed,
          lang,
        })
      );
    });

    await waitForFonts();
    await waitForImages(shell);
    await waitForNextPaint();

    return measureInvoicePdfElements(shell);
  } finally {
    root.unmount();
    shell.remove();
  }
}

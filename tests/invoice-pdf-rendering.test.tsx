import React from 'react';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import InvoicePdfPage from '../components/invoice-preview/InvoicePdfPage';
import InvoicePdfMeasureSurface from '../components/invoice-preview/InvoicePdfMeasureSurface';
import type { Invoice, InvoiceItem } from '../types';
import { createInvoicePdfMeasurements } from '../lib/invoice-pdf-measure';
import { buildInvoicePdfExportState } from '../lib/invoice-pdf-export';
import {
  INVOICE_PDF_PAGE_HEIGHT_MM,
  INVOICE_PDF_PAGE_WIDTH_MM,
} from '../lib/invoice-pdf-page-frame';

function createItem(id: string): InvoiceItem {
  return {
    id,
    description: `Item ${id}`,
    quantity: 1,
    rate: 100,
    amount: 100,
  };
}

function createInvoice(items: InvoiceItem[]): Invoice {
  return {
    id: 'invoice-render',
    type: 'invoice',
    invoiceNumber: '   ',
    date: '2026-04-21',
    dueDate: '2026-04-28',
    sender: {
      name: 'Sender',
      email: 'sender@example.com',
      address: '123 Test St',
      disclaimerText: 'Thank you',
    },
    client: {
      name: 'Client',
      email: 'client@example.com',
      address: '456 Client Rd',
    },
    paymentInfo: {
      fields: [
        {
          id: 'bankName',
          label: 'Bank Name',
          type: 'text',
          order: 0,
          visible: true,
          required: true,
          value: 'Test Bank',
        },
      ],
    },
    items,
    taxRate: 0,
    currency: 'USD',
    notes: '',
    visibility: {
      paymentInfo: true,
      signature: false,
      disclaimer: true,
      invoiceNumber: true,
    },
  };
}

test('compact PDF header does not render an empty invoice number placeholder', () => {
  const items = [createItem('c-1'), createItem('c-2'), createItem('c-3')];
  const invoice = createInvoice(items);
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createInvoicePdfMeasurements({
      pageHeight: 1000,
      sectionHeights: {
        header: 180,
        compactHeader: 90,
        meta: 120,
        tableHeader: 60,
        signature: 0,
        totals: 140,
        paymentInfo: 160,
        disclaimer: 70,
        footer: 50,
      },
      itemHeights: { 'c-1': 170, 'c-2': 170, 'c-3': 170 },
    }),
  });

  const lastPage = state.plan.pages[state.plan.pages.length - 1]!;
  const html = renderToStaticMarkup(
    <InvoicePdfPage
      invoice={state.invoiceForPdf}
      template="minimalist"
      isHeaderReversed={false}
      lang="en"
      pageModel={lastPage}
    />
  );

  assert.equal(lastPage.kind, 'last');
  assert.equal(html.includes('#INV-001'), false);
  assert.equal(html.includes('#</p>'), false);
});

test('InvoicePdfPage renders with a fixed A4 frame so export pages do not collapse into one scaled image', () => {
  const invoice = createInvoice([createItem('p-1'), createItem('p-2')]);
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createInvoicePdfMeasurements({
      pageHeight: 1000,
      sectionHeights: {
        header: 180,
        compactHeader: 90,
        meta: 120,
        tableHeader: 60,
        signature: 0,
        totals: 140,
        paymentInfo: 160,
        disclaimer: 70,
        footer: 50,
      },
      itemHeights: { 'p-1': 160, 'p-2': 160 },
    }),
  });

  const html = renderToStaticMarkup(
    <InvoicePdfPage
      invoice={state.invoiceForPdf}
      template="minimalist"
      isHeaderReversed={false}
      lang="en"
      pageModel={state.plan.pages[0]!}
    />
  );

  assert.match(html, new RegExp(`width:${INVOICE_PDF_PAGE_WIDTH_MM}mm`));
  assert.match(html, new RegExp(`height:${INVOICE_PDF_PAGE_HEIGHT_MM}mm`));
  assert.match(html, /overflow:hidden/);
});

test('multi-page PDF pages use a compact continuation header instead of repeating the full first-page header', () => {
  const items = [createItem('h-1'), createItem('h-2'), createItem('h-3')];
  const invoice = {
    ...createInvoice(items),
    invoiceNumber: 'INV-001',
  };
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createInvoicePdfMeasurements({
      pageHeight: 1000,
      sectionHeights: {
        header: 180,
        compactHeader: 90,
        meta: 120,
        tableHeader: 60,
        signature: 0,
        totals: 140,
        paymentInfo: 160,
        disclaimer: 70,
        footer: 50,
      },
      itemHeights: { 'h-1': 170, 'h-2': 170, 'h-3': 170 },
    }),
  });

  const lastPage = state.plan.pages[state.plan.pages.length - 1]!;
  const html = renderToStaticMarkup(
    <InvoicePdfPage
      invoice={state.invoiceForPdf}
      template="minimalist"
      isHeaderReversed={false}
      lang="en"
      pageModel={lastPage}
    />
  );

  assert.equal(lastPage.kind, 'last');
  assert.equal(lastPage.sections.header, false);
  assert.equal(lastPage.sections.meta, false);
  assert.equal(lastPage.sections.compactHeader, true);
  assert.match(html, /INV-001/);
  assert.match(html, /Sender/);
  assert.match(html, /Page 2 \/ 2/);
  assert.doesNotMatch(html, /<p class="font-semibold text-base"><span class="inline">Client<\/span><\/p>/);
  assert.doesNotMatch(html, /Due Date/);
});

test('non-summary pages do not force a full-height flex body that leaves a large blank gap before the footer', () => {
  const html = renderToStaticMarkup(
    <InvoicePdfPage
      invoice={createInvoice([createItem('gap-1'), createItem('gap-2')])}
      template="minimalist"
      isHeaderReversed={false}
      lang="en"
      pageModel={{
        id: 'page-gap',
        kind: 'first',
        pageNumber: 1,
        totalPages: 2,
        itemIds: ['gap-1', 'gap-2'],
        itemRange: { startIndex: 0, endIndex: 1, count: 2 },
        itemStartIndex: 0,
        itemEndIndex: 1,
        sections: {
          header: true,
          compactHeader: false,
          meta: true,
          tableHeader: true,
          totals: false,
          paymentInfo: false,
          signature: false,
          disclaimer: false,
          footer: true,
        },
      }}
    />
  );

  assert.doesNotMatch(html, /px-12 py-10 flex-1 flex flex-col/);
  assert.doesNotMatch(html, /<div class="flex-1 flex flex-col">/);
  assert.doesNotMatch(html, /mt-auto space-y-8/);
});

test('InvoicePdfMeasureSurface measures against the same fixed A4 frame used during export', () => {
  const html = renderToStaticMarkup(
    <InvoicePdfMeasureSurface
      invoice={createInvoice([createItem('m-1')])}
      template="minimalist"
      isHeaderReversed={false}
      lang="en"
    />
  );

  assert.match(html, new RegExp(`width:${INVOICE_PDF_PAGE_WIDTH_MM}mm`));
  assert.match(html, new RegExp(`height:${INVOICE_PDF_PAGE_HEIGHT_MM}mm`));
  assert.match(html, /data-invoice-pdf-measure-page="true"/);
});

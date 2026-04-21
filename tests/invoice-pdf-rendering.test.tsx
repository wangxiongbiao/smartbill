import React from 'react';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import InvoicePdfPage from '../components/invoice-preview/InvoicePdfPage';
import type { Invoice, InvoiceItem } from '../types';
import { createInvoicePdfMeasurements } from '../lib/invoice-pdf-measure';
import { buildInvoicePdfExportState } from '../lib/invoice-pdf-export';

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

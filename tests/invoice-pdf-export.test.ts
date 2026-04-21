import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Invoice, InvoiceItem } from '../types';
import { createInvoicePdfMeasurements } from '../lib/invoice-pdf-measure';
import {
  buildInvoicePdfExportState,
  getInvoicePdfPageItems,
  prepareInvoiceForPdf,
} from '../lib/invoice-pdf-export';

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
    id: 'invoice-1',
    type: 'invoice',
    invoiceNumber: 'INV-001',
    date: '2026-04-21',
    dueDate: '2026-04-28',
    sender: {
      name: 'Sender',
      email: 'sender@example.com',
      phone: '',
      address: '123 Test St',
      disclaimerText: 'Pay within 7 days',
      signature: 'signature.png',
      customFields: [
        { id: 'sender-empty', label: 'Empty', value: '   ' },
        { id: 'sender-tax', label: 'Tax ID', value: 'AB-123' },
      ],
    },
    client: {
      name: 'Client',
      email: '',
      phone: '',
      address: '456 Client Rd',
      customFields: [
        { id: 'client-empty', label: 'Client Empty', value: '' },
        { id: 'client-ref', label: 'Reference', value: 'REF-1' },
      ],
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
        {
          id: 'blankField',
          label: 'Blank Field',
          type: 'text',
          order: 1,
          visible: true,
          required: false,
          value: '   ',
        },
      ],
    },
    items,
    taxRate: 0,
    currency: 'USD',
    notes: '',
    visibility: {
      paymentInfo: true,
      signature: true,
      disclaimer: true,
    },
  };
}

function createMeasurements(itemHeights: Record<string, number>) {
  return createInvoicePdfMeasurements({
    pageHeight: 1000,
    sectionHeights: {
      header: 180,
      compactHeader: 90,
      meta: 120,
      tableHeader: 60,
      signature: 90,
      totals: 140,
      paymentInfo: 160,
      disclaimer: 70,
      footer: 50,
    },
    itemHeights,
  });
}

test('prepareInvoiceForPdf removes empty optional fields so placeholders do not pollute PDF output', () => {
  const invoice = createInvoice([createItem('a')]);
  const prepared = prepareInvoiceForPdf(invoice);

  assert.equal(prepared.sender.phone, '');
  assert.equal(prepared.client.email, '');
  assert.deepEqual(prepared.sender.customFields, [
    { id: 'sender-tax', label: 'Tax ID', value: 'AB-123' },
  ]);
  assert.deepEqual(prepared.client.customFields, [
    { id: 'client-ref', label: 'Reference', value: 'REF-1' },
  ]);
  assert.deepEqual(prepared.paymentInfo?.fields?.map((field) => field.id), ['bankName']);
});

test('getInvoicePdfPageItems returns the exact page subset while preserving invoice order', () => {
  const invoice = createInvoice([createItem('a'), createItem('b'), createItem('c')]);
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createMeasurements({ a: 100, b: 100, c: 100 }),
  });

  const firstPageItems = getInvoicePdfPageItems(invoice, state.plan.pages[0]!);
  const lastPageItems = getInvoicePdfPageItems(invoice, state.plan.pages[1]!);

  assert.deepEqual(firstPageItems.map((item) => item.id), ['a', 'b']);
  assert.deepEqual(lastPageItems.map((item) => item.id), ['c']);
});

test('buildInvoicePdfExportState creates ordered render pages from paginated plan', () => {
  const invoice = createInvoice([
    createItem('a'),
    createItem('b'),
    createItem('c'),
    createItem('d'),
  ]);

  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createMeasurements({ a: 170, b: 170, c: 170, d: 170 }),
  });

  assert.equal(state.plan.summary.totalPages, 2);
  assert.deepEqual(state.renderPages.map((page) => page.pageModel.kind), ['first', 'last']);
  assert.deepEqual(state.renderPages.map((page) => page.items.map((item) => item.id)), [
    ['a', 'b', 'c'],
    ['d'],
  ]);
  assert.equal(state.renderPages[0]?.pageModel.pageNumber, 1);
  assert.equal(state.renderPages[1]?.pageModel.pageNumber, 2);
  assert.deepEqual(state.invoiceForPdf.sender.customFields, [
    { id: 'sender-tax', label: 'Tax ID', value: 'AB-123' },
  ]);
});

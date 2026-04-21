import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Invoice, InvoiceItem } from '../types';
import { createInvoicePdfMeasurements } from '../lib/invoice-pdf-measure';
import {
  getInvoicePdfPageAvailableItemHeight,
  getInvoicePdfPageFixedHeight,
  paginateInvoicePdf,
} from '../lib/invoice-pdf-layout';

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
      address: '123 Test St',
      disclaimerText: 'Pay within 7 days',
      signature: 'signature.png',
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

test('getInvoicePdfPageFixedHeight sums required sections for single and last pages', () => {
  const measurements = createMeasurements({ a: 80 });

  assert.equal(getInvoicePdfPageFixedHeight(measurements, 'single'), 870);
  assert.equal(getInvoicePdfPageFixedHeight(measurements, 'first'), 410);
  assert.equal(getInvoicePdfPageFixedHeight(measurements, 'middle'), 200);
  assert.equal(getInvoicePdfPageFixedHeight(measurements, 'last'), 660);
  assert.equal(getInvoicePdfPageAvailableItemHeight(measurements, 'last'), 340);
});

test('paginateInvoicePdf keeps a short invoice on a single page', () => {
  const invoice = createInvoice([createItem('a')]);
  const plan = paginateInvoicePdf({
    invoice,
    measurements: createMeasurements({ a: 80 }),
  });

  assert.equal(plan.summary.totalPages, 1);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['single']);
  assert.deepEqual(plan.pages[0]?.itemIds, ['a']);
});

test('paginateInvoicePdf splits items across first, middle, and last pages using measured heights', () => {
  const invoice = createInvoice([
    createItem('a'),
    createItem('b'),
    createItem('c'),
    createItem('d'),
    createItem('e'),
    createItem('f'),
  ]);

  const plan = paginateInvoicePdf({
    invoice,
    measurements: createMeasurements({
      a: 160,
      b: 160,
      c: 160,
      d: 160,
      e: 160,
      f: 160,
    }),
  });

  assert.equal(plan.summary.totalPages, 3);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['first', 'middle', 'last']);
  assert.deepEqual(plan.pages.map((page) => page.itemIds), [
    ['a', 'b', 'c'],
    ['d', 'e'],
    ['f'],
  ]);
});

test('paginateInvoicePdf reserves the last-page bottom block before placing trailing rows', () => {
  const invoice = createInvoice([
    createItem('a'),
    createItem('b'),
    createItem('c'),
    createItem('d'),
  ]);

  const plan = paginateInvoicePdf({
    invoice,
    measurements: createMeasurements({
      a: 170,
      b: 170,
      c: 170,
      d: 170,
    }),
  });

  assert.equal(plan.summary.totalPages, 2);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['first', 'last']);
  assert.deepEqual(plan.pages[0]?.itemIds, ['a', 'b', 'c']);
  assert.deepEqual(plan.pages[1]?.itemIds, ['d']);
});

test('paginateInvoicePdf still assigns at least one item to the last page when the bottom block leaves no free row space', () => {
  const invoice = createInvoice([createItem('a'), createItem('b')]);
  const measurements = createInvoicePdfMeasurements({
    pageHeight: 1000,
    sectionHeights: {
      header: 180,
      compactHeader: 120,
      meta: 120,
      tableHeader: 60,
      signature: 220,
      totals: 220,
      paymentInfo: 220,
      disclaimer: 120,
      footer: 80,
    },
    itemHeights: {
      a: 140,
      b: 140,
    },
  });

  const plan = paginateInvoicePdf({ invoice, measurements });

  assert.equal(plan.summary.totalPages, 2);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['first', 'last']);
  assert.deepEqual(plan.pages[0]?.itemIds, ['a']);
  assert.deepEqual(plan.pages[1]?.itemIds, ['b']);
});

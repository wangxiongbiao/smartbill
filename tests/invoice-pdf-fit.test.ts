import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Invoice, InvoiceItem } from '../types';
import { paginateInvoicePdfByFitting } from '../lib/invoice-pdf-fit';

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
    id: 'invoice-fit',
    type: 'invoice',
    invoiceNumber: 'INV-FIT',
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

test('paginateInvoicePdfByFitting keeps a short invoice on a single page when single fits', async () => {
  const invoice = createInvoice([createItem('a'), createItem('b')]);
  const calls: string[] = [];

  const plan = await paginateInvoicePdfByFitting({
    invoice,
    canFitPage: async ({ kind, items }) => {
      calls.push(`${kind}:${items.length}`);
      return kind === 'single' && items.length <= 2;
    },
  });

  assert.equal(plan.summary.totalPages, 1);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['single']);
  assert.deepEqual(plan.pages[0]?.itemIds, ['a', 'b']);
  assert.deepEqual(calls, ['single:2']);
});

test('paginateInvoicePdfByFitting creates a last page when the single-page fit fails even if the first page can hold many rows', async () => {
  const items = Array.from({ length: 19 }, (_, index) => createItem(`i-${index + 1}`));
  const invoice = createInvoice(items);

  const plan = await paginateInvoicePdfByFitting({
    invoice,
    canFitPage: async ({ kind, items: pageItems }) => {
      if (kind === 'single') return pageItems.length <= 18;
      if (kind === 'first') return pageItems.length <= 18;
      if (kind === 'middle') return pageItems.length <= 18;
      if (kind === 'last') return pageItems.length <= 1;
      return false;
    },
  });

  assert.equal(plan.summary.totalPages, 2);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['first', 'last']);
  assert.deepEqual(plan.pages[0]?.itemIds, items.slice(0, 18).map((item) => item.id));
  assert.deepEqual(plan.pages[1]?.itemIds, [items[18]!.id]);
});

test('paginateInvoicePdfByFitting uses middle pages until the remainder fits on the last page', async () => {
  const items = Array.from({ length: 8 }, (_, index) => createItem(`m-${index + 1}`));
  const invoice = createInvoice(items);

  const plan = await paginateInvoicePdfByFitting({
    invoice,
    canFitPage: async ({ kind, items: pageItems }) => {
      if (kind === 'single') return false;
      if (kind === 'first') return pageItems.length <= 3;
      if (kind === 'middle') return pageItems.length <= 3;
      if (kind === 'last') return pageItems.length <= 2;
      return false;
    },
  });

  assert.equal(plan.summary.totalPages, 3);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['first', 'middle', 'last']);
  assert.deepEqual(plan.pages.map((page) => page.itemIds), [
    ['m-1', 'm-2', 'm-3'],
    ['m-4', 'm-5', 'm-6'],
    ['m-7', 'm-8'],
  ]);
});

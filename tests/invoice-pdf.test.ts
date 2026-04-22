import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Invoice, InvoiceItem } from '../types';
import {
  buildInvoicePdfPlan,
  createInvoicePdfPage,
  createInvoicePdfSectionVisibility,
  getInvoicePdfPageKind,
} from '../lib/invoice-pdf';

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

test('getInvoicePdfPageKind returns the right kind for single and multi-page positions', () => {
  assert.equal(getInvoicePdfPageKind({ pageNumber: 1, totalPages: 1 }), 'single');
  assert.equal(getInvoicePdfPageKind({ pageNumber: 1, totalPages: 3 }), 'first');
  assert.equal(getInvoicePdfPageKind({ pageNumber: 2, totalPages: 3 }), 'middle');
  assert.equal(getInvoicePdfPageKind({ pageNumber: 3, totalPages: 3 }), 'last');
});

test('createInvoicePdfPage builds explicit range, item ids, and section visibility', () => {
  const items = [createItem('a'), createItem('b')];
  const page = createInvoicePdfPage({
    items,
    pageNumber: 2,
    totalPages: 3,
    itemStartIndex: 4,
  });

  assert.equal(page.kind, 'middle');
  assert.equal(page.pageNumber, 2);
  assert.equal(page.totalPages, 3);
  assert.deepEqual(page.itemIds, ['a', 'b']);
  assert.deepEqual(page.itemRange, {
    startIndex: 4,
    endIndex: 5,
    count: 2,
  });
  assert.equal(page.sections.header, false);
  assert.equal(page.sections.compactHeader, true);
  assert.equal(page.sections.meta, false);
  assert.equal(page.sections.totals, false);
  assert.equal(page.sections.footer, true);
});

test('createInvoicePdfSectionVisibility keeps totals and payment info only on single/last pages', () => {
  const single = createInvoicePdfSectionVisibility('single');
  const first = createInvoicePdfSectionVisibility('first');
  const last = createInvoicePdfSectionVisibility('last');

  assert.equal(single.totals, true);
  assert.equal(single.paymentInfo, true);
  assert.equal(first.totals, false);
  assert.equal(first.paymentInfo, false);
  assert.equal(last.totals, true);
  assert.equal(last.paymentInfo, true);
  assert.equal(first.compactHeader, false);
  assert.equal(last.compactHeader, true);
  assert.equal(first.header, true);
  assert.equal(last.header, false);
  assert.equal(first.meta, true);
  assert.equal(last.meta, false);
});

test('buildInvoicePdfPlan creates a single-page explicit plan from grouped page items', () => {
  const invoice = createInvoice([createItem('a'), createItem('b')]);
  const plan = buildInvoicePdfPlan({
    invoice,
    pageItemGroups: [invoice.items],
  });

  assert.equal(plan.summary.totalPages, 1);
  assert.equal(plan.summary.totalItems, 2);
  assert.equal(plan.summary.hasMultiplePages, false);
  assert.deepEqual(plan.allItemIds, ['a', 'b']);
  assert.equal(plan.pages[0]?.kind, 'single');
  assert.deepEqual(plan.pages[0]?.itemRange, {
    startIndex: 0,
    endIndex: 1,
    count: 2,
  });
});

test('buildInvoicePdfPlan creates ordered first/middle/last page models from grouped page items', () => {
  const invoice = createInvoice([
    createItem('a'),
    createItem('b'),
    createItem('c'),
    createItem('d'),
    createItem('e'),
  ]);
  const plan = buildInvoicePdfPlan({
    invoice,
    pageItemGroups: [
      invoice.items.slice(0, 2),
      invoice.items.slice(2, 4),
      invoice.items.slice(4),
    ],
  });

  assert.equal(plan.summary.totalPages, 3);
  assert.equal(plan.summary.hasMultiplePages, true);
  assert.deepEqual(plan.pages.map((page) => page.kind), ['first', 'middle', 'last']);
  assert.deepEqual(
    plan.pages.map((page) => page.itemRange),
    [
      { startIndex: 0, endIndex: 1, count: 2 },
      { startIndex: 2, endIndex: 3, count: 2 },
      { startIndex: 4, endIndex: 4, count: 1 },
    ]
  );
  assert.deepEqual(plan.pages[2]?.itemIds, ['e']);
});

test('buildInvoicePdfPlan rejects page groups that do not preserve invoice item order', () => {
  const invoice = createInvoice([createItem('a'), createItem('b')]);

  assert.throws(
    () =>
      buildInvoicePdfPlan({
        invoice,
        pageItemGroups: [[invoice.items[1]!, invoice.items[0]!]],
      }),
    /preserve invoice item order/
  );
});

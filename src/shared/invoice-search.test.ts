import { test } from 'node:test';
import assert from 'node:assert/strict';

import { filterInvoicesByQuery, type SearchableInvoice } from './invoice-search.ts';

const invoices: SearchableInvoice[] = [
  {
    id: '1',
    client: 'Acme Studio',
    ref: '#INV-001',
    date: 'Mar 24',
    amount: 1250,
    currency: 'USD',
    status: 'paid',
  },
  {
    id: '2',
    client: 'Beta Labs',
    ref: '#INV-002',
    date: 'Apr 2',
    amount: 980,
    currency: 'CNY',
    status: 'unpaid',
  },
];

test('returns all invoices for empty search query', () => {
  assert.equal(filterInvoicesByQuery(invoices, '').length, 2);
});

test('matches invoices by client name case-insensitively', () => {
  const results = filterInvoicesByQuery(invoices, 'acme');
  assert.deepEqual(results.map((invoice) => invoice.id), ['1']);
});

test('matches invoices by invoice reference and amount text', () => {
  const refResults = filterInvoicesByQuery(invoices, 'inv-002');
  assert.deepEqual(refResults.map((invoice) => invoice.id), ['2']);

  const amountResults = filterInvoicesByQuery(invoices, '1250');
  assert.deepEqual(amountResults.map((invoice) => invoice.id), ['1']);
});

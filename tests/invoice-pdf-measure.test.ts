import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  createInvoicePdfMeasurements,
  getInvoicePdfItemHeight,
  getInvoicePdfSectionHeight,
  sumInvoicePdfItemHeights,
} from '../lib/invoice-pdf-measure';

test('createInvoicePdfMeasurements normalizes section, item, and page heights', () => {
  const measurements = createInvoicePdfMeasurements({
    pageHeight: 1122.7,
    sectionHeights: {
      header: 120.3,
      compactHeader: Number.NaN,
      meta: -25,
      tableHeader: 48.8,
      totals: 160.2,
    },
    itemHeights: {
      a: 44.9,
      b: Number.POSITIVE_INFINITY,
      c: -5,
    },
  });

  assert.equal(measurements.pageHeight, 1123);
  assert.equal(measurements.sectionHeights.header, 120);
  assert.equal(measurements.sectionHeights.compactHeader, 0);
  assert.equal(measurements.sectionHeights.meta, 0);
  assert.equal(measurements.sectionHeights.tableHeader, 49);
  assert.equal(measurements.sectionHeights.totals, 160);
  assert.equal(measurements.sectionHeights.signature, 0);
  assert.equal(measurements.itemHeights.a, 45);
  assert.equal(measurements.itemHeights.b, 0);
  assert.equal(measurements.itemHeights.c, 0);
});

test('getInvoicePdfSectionHeight sums one or many measured sections', () => {
  const measurements = createInvoicePdfMeasurements({
    sectionHeights: {
      header: 100,
      meta: 80,
      tableHeader: 40,
      totals: 160,
    },
  });

  assert.equal(getInvoicePdfSectionHeight(measurements, 'header'), 100);
  assert.equal(getInvoicePdfSectionHeight(measurements, ['header', 'meta', 'tableHeader']), 220);
  assert.equal(getInvoicePdfSectionHeight(measurements, ['signature', 'totals']), 160);
});

test('getInvoicePdfItemHeight returns measured row heights with a fallback', () => {
  const measurements = createInvoicePdfMeasurements({
    itemHeights: {
      a: 40,
    },
  });

  assert.equal(getInvoicePdfItemHeight(measurements, 'a'), 40);
  assert.equal(getInvoicePdfItemHeight(measurements, 'missing'), 0);
  assert.equal(getInvoicePdfItemHeight(measurements, 'missing', 55), 55);
});

test('sumInvoicePdfItemHeights adds item row heights in invoice order', () => {
  const measurements = createInvoicePdfMeasurements({
    itemHeights: {
      a: 40,
      b: 64,
      c: 72,
    },
  });

  assert.equal(sumInvoicePdfItemHeights(measurements, ['a', 'b']), 104);
  assert.equal(sumInvoicePdfItemHeights(measurements, ['b', 'missing', 'c']), 136);
  assert.equal(sumInvoicePdfItemHeights(measurements, []), 0);
});

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Invoice, InvoiceItem } from '../types';
import { createInvoicePdfMeasurements } from '../lib/invoice-pdf-measure';
import { buildInvoicePdfExportState } from '../lib/invoice-pdf-export';

function createItem(id: string, description = `Item ${id}`): InvoiceItem {
  return {
    id,
    description,
    quantity: 1,
    rate: 100,
    amount: 100,
  };
}

function createInvoice(items: InvoiceItem[], overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'invoice-verify',
    type: 'invoice',
    invoiceNumber: 'INV-VERIFY',
    date: '2026-04-21',
    dueDate: '2026-04-28',
    sender: {
      name: 'Sender',
      email: 'sender@example.com',
      address: '123 Test St',
      disclaimerText: 'Thank you',
      signature: 'signature.png',
      ...(overrides.sender || {}),
    },
    client: {
      name: 'Client',
      email: 'client@example.com',
      address: '456 Client Rd',
      ...(overrides.client || {}),
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
      ...(overrides.paymentInfo || {}),
    },
    items,
    taxRate: 0,
    currency: 'USD',
    notes: '',
    visibility: {
      paymentInfo: true,
      signature: true,
      disclaimer: true,
      ...(overrides.visibility || {}),
    },
    ...overrides,
  };
}

function createMeasurements(itemHeights: Record<string, number>, paymentInfo = 160) {
  return createInvoicePdfMeasurements({
    pageHeight: 1000,
    sectionHeights: {
      header: 180,
      compactHeader: 90,
      meta: 120,
      tableHeader: 60,
      signature: 90,
      totals: 140,
      paymentInfo,
      disclaimer: 70,
      footer: 50,
    },
    itemHeights,
  });
}

function assertLastPageHasFinalSections(state: ReturnType<typeof buildInvoicePdfExportState>) {
  const lastPage = state.plan.pages[state.plan.pages.length - 1]!;
  assert.equal(lastPage.sections.totals, true);
  assert.equal(lastPage.sections.paymentInfo, true);
  assert.equal(lastPage.sections.tableHeader, true);
}

test('verification matrix: short invoice keeps full content on one page', () => {
  const invoice = createInvoice([createItem('a'), createItem('b'), createItem('c')]);
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createMeasurements({ a: 100, b: 100, c: 100 }),
  });

  assert.equal(state.plan.summary.totalPages, 2);
  assert.equal(state.plan.pages[0]?.sections.header, true);
  assertLastPageHasFinalSections(state);
});

test('verification matrix: medium invoice repeats compact header on middle/last pages', () => {
  const items = Array.from({ length: 15 }, (_, index) => createItem(`m-${index}`));
  const heights = Object.fromEntries(items.map((item) => [item.id, 160]));
  const state = buildInvoicePdfExportState({
    invoice: createInvoice(items),
    measurements: createMeasurements(heights),
  });

  assert.equal(state.plan.summary.totalPages > 2, true);
  assert.equal(state.plan.pages[0]?.sections.header, true);
  assert.equal(state.plan.pages[1]?.sections.compactHeader, true);
  assertLastPageHasFinalSections(state);
});

test('verification matrix: long invoice stays ordered across many pages', () => {
  const items = Array.from({ length: 30 }, (_, index) => createItem(`l-${index}`));
  const heights = Object.fromEntries(items.map((item) => [item.id, 150]));
  const state = buildInvoicePdfExportState({
    invoice: createInvoice(items),
    measurements: createMeasurements(heights),
  });

  assert.equal(state.plan.summary.totalItems, 30);
  assert.equal(state.plan.summary.totalPages >= 4, true);
  assert.deepEqual(state.plan.allItemIds, items.map((item) => item.id));
  assertLastPageHasFinalSections(state);
});

test('verification matrix: long payment info is preserved only on the last page', () => {
  const items = Array.from({ length: 8 }, (_, index) => createItem(`p-${index}`));
  const invoice = createInvoice(items, {
    paymentInfo: {
      fields: Array.from({ length: 8 }, (_, index) => ({
        id: `field-${index}`,
        label: `Field ${index}`,
        type: index % 2 === 0 ? 'text' : 'textarea',
        order: index,
        visible: true,
        required: false,
        value: `Long payment value ${index}`,
      })),
    },
  });
  const heights = Object.fromEntries(items.map((item) => [item.id, 170]));
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createMeasurements(heights, 320),
  });

  assert.equal(state.plan.pages[0]?.sections.paymentInfo, false);
  assert.equal(state.plan.pages[state.plan.pages.length - 1]?.sections.paymentInfo, true);
});

test('verification matrix: QR code is retained in PDF snapshot data', () => {
  const invoice = createInvoice([createItem('qr-1')], {
    paymentInfo: {
      fields: [
        {
          id: 'bankName',
          label: 'Bank Name',
          type: 'text',
          order: 0,
          visible: true,
          required: true,
          value: 'QR Bank',
        },
      ],
      qrCode: 'qr-code.png',
    },
  });
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createMeasurements({ 'qr-1': 120 }),
  });

  assert.equal(state.invoiceForPdf.paymentInfo?.qrCode, 'qr-code.png');
});

test('verification matrix: signature/disclaimer visibility toggles reduce last-page sections', () => {
  const invoice = createInvoice([createItem('s-1'), createItem('s-2')], {
    visibility: {
      paymentInfo: true,
      signature: false,
      disclaimer: false,
    },
    sender: {
      name: 'Sender',
      email: 'sender@example.com',
      address: '123 Test St',
    },
  });
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createMeasurements({ 's-1': 180, 's-2': 180 }),
  });

  const lastPage = state.plan.pages[state.plan.pages.length - 1]!;
  assert.equal(lastPage.sections.signature, true);
  assert.equal(state.invoiceForPdf.visibility?.signature, false);
  assert.equal(state.invoiceForPdf.visibility?.disclaimer, false);
});

test('verification matrix: empty optional fields are removed from PDF snapshot data', () => {
  const invoice = createInvoice([createItem('e-1')], {
    sender: {
      name: 'Sender',
      email: '',
      phone: '',
      address: '123 Test St',
      customFields: [{ id: 'blank', label: 'Blank', value: '   ' }],
    },
    client: {
      name: 'Client',
      email: '',
      phone: '',
      address: '456 Client Rd',
    },
    paymentInfo: {
      fields: [
        {
          id: 'blankField',
          label: 'Blank',
          type: 'text',
          order: 0,
          visible: true,
          required: false,
          value: '   ',
        },
      ],
    },
  });
  const state = buildInvoicePdfExportState({
    invoice,
    measurements: createMeasurements({ 'e-1': 120 }),
  });

  assert.equal(state.invoiceForPdf.sender.email, '');
  assert.equal(state.invoiceForPdf.sender.customFields, undefined);
  assert.equal(state.invoiceForPdf.paymentInfo?.fields, undefined);
});

test('verification matrix: Chinese content survives pagination and ordering', () => {
  const items = [
    createItem('zh-1', '服务费\n第二行说明'),
    createItem('zh-2', '技术咨询'),
    createItem('zh-3', '项目管理'),
    createItem('zh-4', '尾款'),
  ];
  const state = buildInvoicePdfExportState({
    invoice: createInvoice(items, {
      client: {
        name: '上海客户',
        email: 'client@example.com',
        address: '上海市浦东新区',
      },
    }),
    measurements: createMeasurements({ 'zh-1': 220, 'zh-2': 170, 'zh-3': 170, 'zh-4': 170 }),
  });

  assert.deepEqual(state.plan.allItemIds, ['zh-1', 'zh-2', 'zh-3', 'zh-4']);
  assert.equal(state.invoiceForPdf.client.name, '上海客户');
  assertLastPageHasFinalSections(state);
});

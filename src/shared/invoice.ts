import type {
  Invoice,
  InvoiceColumn,
  InvoiceItem,
  PaymentInfo,
  PaymentInfoField,
} from '@/shared/types';

export const DEFAULT_INVOICE_COLUMNS: InvoiceColumn[] = [
  {
    id: 'description',
    field: 'description',
    label: 'Description',
    type: 'system-text',
    order: 0,
    visible: true,
    required: true,
  },
  {
    id: 'quantity',
    field: 'quantity',
    label: 'Qty',
    type: 'system-quantity',
    order: 1,
    visible: true,
    required: true,
  },
  {
    id: 'rate',
    field: 'rate',
    label: 'Rate',
    type: 'system-rate',
    order: 2,
    visible: true,
    required: true,
  },
  {
    id: 'amount',
    field: 'amount',
    label: 'Amount',
    type: 'system-amount',
    order: 3,
    visible: true,
    required: true,
  },
];

export function buildDefaultPaymentFields(): PaymentInfoField[] {
  return [
    {
      id: 'bankName',
      label: 'Bank name',
      type: 'text',
      order: 0,
      visible: true,
      required: true,
      value: '',
    },
    {
      id: 'accountName',
      label: 'Account name',
      type: 'text',
      order: 1,
      visible: true,
      required: true,
      value: '',
    },
    {
      id: 'accountNumber',
      label: 'Account number',
      type: 'text',
      order: 2,
      visible: true,
      required: true,
      value: '',
    },
    {
      id: 'address',
      label: 'Bank address',
      type: 'textarea',
      order: 3,
      visible: true,
      required: true,
      value: '',
    },
    {
      id: 'extraInfo',
      label: 'Extra info',
      type: 'textarea',
      order: 4,
      visible: true,
      required: false,
      value: '',
    },
  ];
}

export function getInvoiceColumns(columnConfig?: InvoiceColumn[]) {
  return columnConfig?.length ? columnConfig : DEFAULT_INVOICE_COLUMNS;
}

export function getSortedInvoiceColumns(columnConfig?: InvoiceColumn[]) {
  return [...getInvoiceColumns(columnConfig)].sort((a, b) => a.order - b.order);
}

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate = 0) {
  const subtotal = items.reduce((sum, item) => {
    const hasExplicitAmount =
      item.amount !== undefined &&
      item.amount !== '' &&
      !Number.isNaN(Number(item.amount));
    const lineAmount = hasExplicitAmount
      ? Number(item.amount)
      : Number(item.quantity || 0) * Number(item.rate || 0);

    return sum + lineAmount;
  }, 0);

  const tax = subtotal * (Number(taxRate || 0) / 100);

  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

export function updateInvoiceItem(
  items: InvoiceItem[],
  id: string,
  updates: Partial<InvoiceItem>
) {
  return items.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const updated = { ...item, ...updates };

    if (('quantity' in updates || 'rate' in updates) && !('amount' in updates)) {
      if (!String(updated.quantity ?? '') || !String(updated.rate ?? '')) {
        updated.amount = '';
      } else {
        updated.amount = Number(updated.quantity || 0) * Number(updated.rate || 0);
      }
    }

    return updated;
  });
}

export function updateInvoiceItemAmount(
  items: InvoiceItem[],
  id: string,
  amount: number | string
) {
  return items.map((item) => (item.id === id ? { ...item, amount } : item));
}

export function updateInvoiceItemCustomValue(
  items: InvoiceItem[],
  itemId: string,
  columnId: string,
  value: string
) {
  const target = items.find((item) => item.id === itemId);

  if (!target) {
    return items;
  }

  return updateInvoiceItem(items, itemId, {
    customValues: {
      ...(target.customValues || {}),
      [columnId]: value,
    },
  });
}

export function updatePaymentInfoFieldValue(
  paymentInfo: PaymentInfo | undefined,
  fieldId: string,
  value: string
): PaymentInfo {
  return {
    ...paymentInfo,
    fields:
      paymentInfo?.fields?.map((field) =>
        field.id === fieldId ? { ...field, value } : field
      ) || [],
  };
}

export function hasPaymentInfoContent(paymentInfo: PaymentInfo | undefined) {
  return Boolean(
    paymentInfo?.fields?.some((field) => field.value.trim()) ||
      paymentInfo?.bankName ||
      paymentInfo?.accountName ||
      paymentInfo?.accountNumber ||
      paymentInfo?.extraInfo ||
      paymentInfo?.qrCode ||
      paymentInfo?.customFields?.length
  );
}

export function createEmptyInvoice(): Invoice {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);
  const shortYear = String(today.getFullYear()).slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return {
    id: String(Date.now()),
    type: 'invoice',
    invoiceNumber: `KY${shortYear}${month}${day}`,
    date: toIsoDate(today),
    dueDate: toIsoDate(dueDate),
    sender: {
      name: '',
      email: '',
      address: '',
      phone: '',
      disclaimerText:
        'This is a computer generated document and no signature is required.',
      customFields: [],
    },
    client: {
      name: '',
      email: '',
      address: '',
      phone: '',
      customFields: [],
    },
    paymentInfo: {
      fields: buildDefaultPaymentFields(),
    },
    items: [
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        rate: '',
        amount: '',
        customValues: {},
      },
    ],
    taxRate: 0,
    currency: 'CNY',
    notes: '',
    status: 'Pending',
    template: 'minimalist',
    isHeaderReversed: false,
    visibility: {
      invoiceNumber: true,
      date: true,
      dueDate: true,
      paymentInfo: true,
      signature: false,
      disclaimer: true,
    },
    columnConfig: DEFAULT_INVOICE_COLUMNS,
    customStrings: {
      invoiceTitle: '',
      dateLabel: 'Date',
      dueDateLabel: 'Due Date',
    },
  };
}

function toIsoDate(date: Date) {
  return date.toISOString().split('T')[0];
}

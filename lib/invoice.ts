import type { Invoice, InvoiceColumn, InvoiceItem, PaymentInfo, PaymentInfoField, Sender, User } from '@/types';

export const DEFAULT_INVOICE_COLUMNS: InvoiceColumn[] = [
  { id: 'desc', field: 'description', label: 'Description', type: 'system-text', order: 0, visible: true, required: true },
  { id: 'qty', field: 'quantity', label: 'Quantity', type: 'system-quantity', order: 1, visible: true, required: true },
  { id: 'rate', field: 'rate', label: 'Rate', type: 'system-rate', order: 2, visible: true, required: true },
  { id: 'amt', field: 'amount', label: 'Amount', type: 'system-amount', order: 3, visible: true, required: true },
];

interface PaymentInfoFieldLabels {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankAddress: string;
  extraInfo: string;
}

export function getInvoiceColumns(columnConfig?: InvoiceColumn[]) {
  return columnConfig || DEFAULT_INVOICE_COLUMNS;
}

export function getSortedInvoiceColumns(columnConfig?: InvoiceColumn[]) {
  return [...getInvoiceColumns(columnConfig)].sort((a, b) => a.order - b.order);
}

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
  const tax = subtotal * (Number(taxRate || 0) / 100);

  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

export function calculateInvoiceTotal(invoice: Pick<Invoice, 'items' | 'taxRate'>) {
  return calculateInvoiceTotals(invoice.items, invoice.taxRate).total;
}

export function getLatestSender(records: Invoice[]): Sender | undefined {
  return [...records]
    .sort((a, b) => {
      const aTime = Date.parse(a.date || '') || 0;
      const bTime = Date.parse(b.date || '') || 0;
      return bTime - aTime;
    })
    .map((record) => record.sender)
    .find((sender) => sender?.name || sender?.email || sender?.phone || sender?.address);
}

export function getDefaultSenderForNewInvoice(user: User | null, records: Invoice[]): Pick<Sender, 'name' | 'email' | 'phone' | 'address'> {
  const latestSender = getLatestSender(records);

  return {
    name: latestSender?.name || user?.name || '',
    email: latestSender?.email || user?.email || '',
    phone: latestSender?.phone || '',
    address: latestSender?.address || '',
  };
}

export function parseEditableNumberInput(value: string) {
  if (!value) return '';

  const numberRegex = /^-?\d*\.?\d*$/;
  if (!numberRegex.test(value)) return null;

  if (value === '-' || value === '.' || value === '-.' || value.endsWith('.')) {
    return value;
  }

  return Number(value);
}

export function updateInvoiceItem(items: InvoiceItem[], id: string, updates: Partial<InvoiceItem>) {
  return items.map((item) => {
    if (item.id !== id) return item;

    const updated = { ...item, ...updates };
    if (('quantity' in updates || 'rate' in updates) && !('amount' in updates)) {
      if (!String(updated.quantity ?? '') || !String(updated.rate ?? '')) {
        updated.amount = undefined;
        return updated;
      }

      updated.amount = Number(updated.quantity || 0) * Number(updated.rate || 0);
    }

    return updated;
  });
}

export function updateInvoiceItemAmount(items: InvoiceItem[], id: string, newAmount: number | string) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return items;

  if (newAmount === '') {
    return updateInvoiceItem(items, id, { amount: '', rate: '' });
  }

  const amount = Number(newAmount);
  const qty = item.quantity;
  const rate = item.rate;

  if ((!qty || qty === '') && (!rate || rate === '')) {
    return updateInvoiceItem(items, id, { quantity: 1, rate: amount, amount });
  }

  if (qty && qty !== '' && (!rate || rate === '')) {
    return updateInvoiceItem(items, id, {
      rate: Number(qty) !== 0 ? amount / Number(qty) : amount,
      amount,
    });
  }

  if ((!qty || qty === '') && rate && rate !== '') {
    return updateInvoiceItem(items, id, {
      quantity: Number(rate) !== 0 ? amount / Number(rate) : 1,
      amount,
    });
  }

  if (qty && qty !== '' && rate && rate !== '') {
    return updateInvoiceItem(items, id, {
      rate: Number(qty) !== 0 ? amount / Number(qty) : amount,
      amount,
    });
  }

  return updateInvoiceItem(items, id, { amount });
}

export function updateInvoiceItemCustomValue(items: InvoiceItem[], itemId: string, columnId: string, value: string) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return items;

  return updateInvoiceItem(items, itemId, {
    customValues: {
      ...(item.customValues || {}),
      [columnId]: value,
    },
  });
}

export function buildPaymentInfoFields(paymentInfo: PaymentInfo | undefined, labels: PaymentInfoFieldLabels): PaymentInfoField[] {
  const fields: PaymentInfoField[] = [
    { id: 'bankName', label: labels.bankName, type: 'text', order: 0, visible: true, required: true, value: paymentInfo?.bankName || '' },
    { id: 'accountName', label: labels.accountName, type: 'text', order: 1, visible: true, required: true, value: paymentInfo?.accountName || '' },
    { id: 'accountNumber', label: labels.accountNumber, type: 'text', order: 2, visible: true, required: true, value: paymentInfo?.accountNumber || '' },
    { id: 'address', label: labels.bankAddress, type: 'textarea', order: 3, visible: true, required: true, value: '' },
    { id: 'extraInfo', label: labels.extraInfo, type: 'textarea', order: 4, visible: true, required: false, value: paymentInfo?.extraInfo || '' },
  ];

  paymentInfo?.customFields?.forEach((field, index) => {
    fields.push({
      id: field.id,
      label: field.label,
      type: 'text',
      order: 5 + index,
      visible: true,
      required: false,
      value: field.value,
    });
  });

  return fields;
}

export function updatePaymentInfoFieldValue(paymentInfo: PaymentInfo | undefined, fieldId: string, value: string): PaymentInfo {
  const fields = paymentInfo?.fields?.map((field) => (
    field.id === fieldId ? { ...field, value } : field
  )) || [];

  return {
    ...paymentInfo,
    fields,
  };
}

export function hasPaymentInfoContent(paymentInfo: PaymentInfo | undefined) {
  return Boolean(
    paymentInfo?.fields
    || paymentInfo?.bankName
    || paymentInfo?.accountName
    || paymentInfo?.accountNumber
    || paymentInfo?.extraInfo
    || paymentInfo?.qrCode
    || (paymentInfo?.customFields && paymentInfo.customFields.length > 0)
  );
}

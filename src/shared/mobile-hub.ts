import { calculateInvoiceTotals, createEmptyInvoice } from '@/shared/invoice';
import type { Invoice, InvoiceTemplateRecord, Sender } from '@/shared/types';

function cloneCustomFields(fields?: Sender['customFields']) {
  return (fields || []).map((field) => ({ ...field }));
}

function cloneItems(items: Invoice['items']) {
  return items.map((item) => ({
    ...item,
    customValues: item.customValues ? { ...item.customValues } : {},
  }));
}

function clonePaymentInfo(paymentInfo: Invoice['paymentInfo']) {
  if (!paymentInfo) {
    return undefined;
  }

  return {
    ...paymentInfo,
    fields: (paymentInfo.fields || []).map((field) => ({ ...field })),
    customFields: cloneCustomFields(paymentInfo.customFields),
  };
}

export function getMobileInvoices(createdInvoices: Invoice[], deletedInvoiceIds: string[]) {
  const hiddenIds = new Set(deletedInvoiceIds);

  return createdInvoices.filter((invoice) => !hiddenIds.has(invoice.id));
}

export function getInvoiceAmount(invoice: Invoice) {
  return calculateInvoiceTotals(invoice.items, invoice.taxRate).total;
}

export function isPaidInvoice(invoice: Invoice) {
  return invoice.status === 'Paid';
}

export function isOverdueInvoice(invoice: Invoice) {
  if (invoice.status === 'Paid') {
    return false;
  }

  const due = new Date(invoice.dueDate);
  const today = new Date();

  if (Number.isNaN(due.getTime())) {
    return false;
  }

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return due < today;
}

export function getMobileTemplates(savedTemplates: InvoiceTemplateRecord[]) {
  return [...savedTemplates].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function buildInvoiceFromTemplateData(templateData: Partial<Invoice>) {
  const baseInvoice = createEmptyInvoice();

  return {
    ...baseInvoice,
    ...templateData,
    sender: {
      ...baseInvoice.sender,
      ...templateData.sender,
      customFields: cloneCustomFields(templateData.sender?.customFields),
    },
    client: {
      ...baseInvoice.client,
      ...templateData.client,
      customFields: cloneCustomFields(templateData.client?.customFields),
    },
    paymentInfo: clonePaymentInfo(templateData.paymentInfo || baseInvoice.paymentInfo),
    items: cloneItems(templateData.items?.length ? templateData.items : baseInvoice.items),
    visibility: {
      ...baseInvoice.visibility,
      ...templateData.visibility,
    },
    columnConfig: (templateData.columnConfig || baseInvoice.columnConfig || []).map((column) => ({
      ...column,
    })),
    customStrings: {
      ...baseInvoice.customStrings,
      ...templateData.customStrings,
    },
  };
}

export function createDraftInvoiceFromTemplate(template: InvoiceTemplateRecord) {
  const baseInvoice = createEmptyInvoice();
  const templateInvoice = buildInvoiceFromTemplateData(template.templateData);

  return {
    ...baseInvoice,
    type: templateInvoice.type,
    sender: templateInvoice.sender,
    client: templateInvoice.client,
    paymentInfo: templateInvoice.paymentInfo,
    items: cloneItems(templateInvoice.items),
    taxRate: templateInvoice.taxRate,
    currency: templateInvoice.currency,
    notes: templateInvoice.notes,
    template: templateInvoice.template,
    isHeaderReversed: templateInvoice.isHeaderReversed,
    visibility: {
      ...templateInvoice.visibility,
    },
    columnConfig: (templateInvoice.columnConfig || []).map((column) => ({ ...column })),
    customStrings: {
      ...templateInvoice.customStrings,
    },
  };
}

export function getDashboardSummary(invoices: Invoice[]) {
  const totals = invoices.reduce(
    (acc, invoice) => {
      const amount = getInvoiceAmount(invoice);
      acc.total += amount;

      if (isPaidInvoice(invoice)) {
        acc.paid += amount;
      } else {
        acc.unpaid += amount;
      }

      if (isOverdueInvoice(invoice)) {
        acc.overdue += amount;
      }

      return acc;
    },
    { total: 0, paid: 0, unpaid: 0, overdue: 0 }
  );

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const clients = new Map<string, number>();
  invoices.forEach((invoice) => {
    const name = invoice.client.name || 'Unknown client';
    clients.set(name, (clients.get(name) || 0) + getInvoiceAmount(invoice));
  });

  const topClients = [...clients.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const last7Days = Array.from({ length: 7 }).map((_, index) => {
    const current = new Date();
    current.setDate(current.getDate() - (6 - index));
    const key = current.toISOString().split('T')[0];
    const amount = invoices
      .filter((invoice) => invoice.date === key)
      .reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);

    return {
      key,
      label: current.toLocaleDateString('en-US', { weekday: 'short' }),
      amount,
    };
  });

  return {
    ...totals,
    recentInvoices,
    topClients,
    last7Days,
  };
}

export function getDefaultSenderSummary(invoices: Invoice[]) {
  const sender = invoices.find(
    (invoice) => invoice.sender.name || invoice.sender.email || invoice.sender.address
  )?.sender;

  if (!sender) {
    return {
      name: 'Not configured',
      email: '',
      phone: '',
      address: '',
    };
  }

  return {
    name: sender.name || 'Not configured',
    email: sender.email || '',
    phone: sender.phone || '',
    address: sender.address || '',
  };
}

import type { Invoice } from '@/types';

export type InvoiceDisplayStatus = 'pending' | 'paid' | 'overdue';

function parseLocalDate(value?: string | null) {
  if (!value) return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getStartOfLocalDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function isInvoicePaid(invoice: Pick<Invoice, 'status'>) {
  return invoice.status === 'Paid';
}

export function isInvoiceOverdue(invoice: Pick<Invoice, 'status' | 'dueDate'>, today = new Date()) {
  if (isInvoicePaid(invoice)) return false;

  const dueDate = parseLocalDate(invoice.dueDate);
  if (!dueDate) return false;

  return dueDate.getTime() < getStartOfLocalDay(today).getTime();
}

export function getInvoiceDisplayStatus(invoice: Pick<Invoice, 'status' | 'dueDate'>, today = new Date()): InvoiceDisplayStatus {
  if (isInvoicePaid(invoice)) return 'paid';
  if (isInvoiceOverdue(invoice, today)) return 'overdue';
  return 'pending';
}

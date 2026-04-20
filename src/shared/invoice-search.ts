export type SearchableInvoice = {
  id: string;
  client: string;
  ref: string;
  date: string;
  amount: number;
  currency?: string;
  status: 'unpaid' | 'paid';
};

function buildSearchHaystack(invoice: SearchableInvoice) {
  return [
    invoice.client,
    invoice.ref,
    invoice.date,
    invoice.status,
    invoice.currency ?? '',
    String(invoice.amount),
  ]
    .join(' ')
    .toLowerCase();
}

export function filterInvoicesByQuery<T extends SearchableInvoice>(invoices: T[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return invoices;
  }

  return invoices.filter((invoice) => buildSearchHaystack(invoice).includes(normalizedQuery));
}

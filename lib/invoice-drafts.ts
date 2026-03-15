import { translations } from '@/i18n';
import { getDefaultCurrencyForLanguage } from '@/lib/language';
import type { Invoice, InvoiceTemplate, Language, User } from '@/types';
import { INITIAL_INVOICE } from '@/hooks/useInvoiceWorkspace';

function createDraftId() {
  return Date.now().toString();
}

function buildSenderDefaults(user: User | null, sender?: Partial<Invoice['sender']>) {
  return {
    ...INITIAL_INVOICE.sender,
    ...(user ? { name: user.name || '', email: user.email || '' } : {}),
    ...(sender || {}),
  };
}

export function createInvoiceDraft(params: {
  lang: Language;
  user: User | null;
  preset?: Partial<Invoice>;
}) {
  const id = createDraftId();
  const { lang, user, preset } = params;

  return {
    ...INITIAL_INVOICE,
    currency: getDefaultCurrencyForLanguage(lang),
    items: [{ id: 'item-1', description: translations[lang].itemDescriptionExample || 'Example Service Item', quantity: 1, rate: 0 }],
    ...preset,
    client: { ...INITIAL_INVOICE.client },
    sender: buildSenderDefaults(user, preset?.sender),
    id,
    invoiceNumber: `INV-${id.slice(-6)}`,
  } satisfies Invoice;
}

export function duplicateInvoiceDraft(sourceInvoice: Invoice) {
  const id = createDraftId();

  return {
    ...sourceInvoice,
    id,
    invoiceNumber: `INV-${id.slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: sourceInvoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
    items: sourceInvoice.items.map((item, index) => ({
      ...item,
      id: `${id}-item-${index + 1}`,
    })),
  } satisfies Invoice;
}

export function createInvoiceFromTemplate(templateRecord: InvoiceTemplate, params: { user: User | null; lang: Language }) {
  return createInvoiceDraft({
    lang: params.lang,
    user: params.user,
    preset: {
      ...templateRecord.template_data,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: { name: '', email: '', address: '' },
      status: 'Pending',
    },
  });
}

export function upsertLocalInvoiceRecord(invoice: Invoice) {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem('invoice_records_v2');
  const records = raw ? JSON.parse(raw) : [];
  const next = Array.isArray(records)
    ? records.some((record) => record?.id === invoice.id)
      ? records.map((record) => (record.id === invoice.id ? invoice : record))
      : [invoice, ...records]
    : [invoice];
  window.localStorage.setItem('invoice_records_v2', JSON.stringify(next));
}

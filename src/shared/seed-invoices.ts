import { DEFAULT_INVOICE_COLUMNS, buildDefaultPaymentFields } from '@/shared/invoice';
import type { Invoice } from '@/shared/types';

type SeededInvoiceRecord = {
  invoice: Invoice;
  muted?: boolean;
  overdueText?: string;
};

const EYE_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="80" viewBox="0 0 160 80" fill="none">
    <path d="M80 8C42 8 15 40 15 40s27 32 65 32 65-32 65-32S118 8 80 8Z" fill="black"/>
    <circle cx="80" cy="40" r="22" fill="white"/>
    <circle cx="80" cy="40" r="10" fill="black"/>
    <circle cx="87" cy="35" r="3" fill="white"/>
  </svg>
`)}`;

const BASE_VISIBILITY = {
  invoiceNumber: true,
  date: true,
  dueDate: true,
  paymentInfo: true,
  signature: false,
  disclaimer: true,
};

const BASE_CUSTOM_STRINGS = {
  invoiceTitle: '',
  dateLabel: 'Date',
  dueDateLabel: 'Due Date',
};

function makeInvoice(overrides: Partial<Invoice>): Invoice {
  return {
    id: String(Date.now()),
    type: 'invoice',
    invoiceNumber: 'KY250114',
    date: '2026-03-13',
    dueDate: '2026-03-27',
    sender: {
      name: 'Gary',
      email: '',
      address: '',
      phone: '',
      logo: undefined,
      signature: undefined,
      disclaimerText: 'This is a computer generated document and no signature is required.',
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
        id: 'seed-item-1',
        description: '',
        quantity: 1,
        rate: '',
        amount: 0,
        customValues: {},
      },
    ],
    taxRate: 0,
    currency: 'CNY',
    notes: '',
    status: 'Pending',
    template: 'minimalist',
    isHeaderReversed: false,
    visibility: BASE_VISIBILITY,
    columnConfig: DEFAULT_INVOICE_COLUMNS,
    customStrings: BASE_CUSTOM_STRINGS,
    ...overrides,
  };
}

export const SEEDED_INVOICE_RECORDS: SeededInvoiceRecord[] = [
  {
    muted: true,
    invoice: makeInvoice({
      id: 'invoice-0114',
      invoiceNumber: 'KY250114',
      date: '2026-03-13',
      dueDate: '2026-03-27',
      sender: {
        name: 'Gary',
        email: '',
        address: '',
        phone: '',
        logo: EYE_LOGO,
        signature: undefined,
        disclaimerText: 'This is a computer generated document and no signature is required.',
        customFields: [],
      },
      client: {
        name: '',
        email: '',
        address: '',
        phone: '',
        customFields: [],
      },
      items: [
        {
          id: 'seed-0114-item-1',
          description: '',
          quantity: 1,
          rate: 0,
          amount: 0,
          customValues: {},
        },
      ],
    }),
  },
  {
    overdueText: 'overdue 1d',
    invoice: makeInvoice({
      id: 'invoice-0113',
      invoiceNumber: 'KY250113',
      date: '2026-03-06',
      dueDate: '2026-03-13',
      client: {
        name: 'Alan ~ New energy procurement',
        email: '',
        address: '',
        phone: '',
        customFields: [],
      },
      items: [
        {
          id: 'seed-0113-item-1',
          description: 'New energy procurement',
          quantity: 1,
          rate: 700,
          amount: 700,
          customValues: {},
        },
      ],
    }),
  },
  {
    overdueText: 'overdue 413d',
    invoice: makeInvoice({
      id: 'invoice-0112',
      invoiceNumber: 'KY250112',
      date: '2026-01-13',
      dueDate: '2026-01-20',
      client: {
        name: 'Alan ~ New energy procurement',
        email: '',
        address: '',
        phone: '',
        customFields: [],
      },
      items: [
        {
          id: 'seed-0112-item-1',
          description: 'New energy procurement',
          quantity: 1,
          rate: 480700,
          amount: 480700,
          customValues: {},
        },
      ],
    }),
  },
];

export function findSeededInvoiceRecordById(id: string) {
  return SEEDED_INVOICE_RECORDS.find((record) => record.invoice.id === id);
}

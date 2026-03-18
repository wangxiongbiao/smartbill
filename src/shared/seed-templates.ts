import type { InvoiceTemplateRecord } from '@/shared/types';

const BASE_SENDER = {
  name: 'Gary',
  email: 'hello@smartbill.app',
  address: 'Shanghai, China',
  phone: '+86 21 5566 1024',
  customFields: [],
};

export const SEEDED_TEMPLATE_RECORDS: InvoiceTemplateRecord[] = [
  {
    id: 'template-business-core',
    name: 'Business Core',
    description: 'A clean business invoice for general billing workflows.',
    templateType: 'business',
    usageCount: 18,
    templateData: {
      type: 'invoice',
      currency: 'CNY',
      sender: {
        ...BASE_SENDER,
      },
      client: {
        name: 'Alan Trading',
        email: '',
        address: '',
        phone: '',
        customFields: [],
      },
      items: [
        {
          id: 'template-business-item',
          description: 'Monthly consulting service',
          quantity: 1,
          rate: 12000,
          amount: 12000,
          customValues: {},
        },
      ],
      taxRate: 0,
    },
    createdAt: '2026-03-02T09:30:00.000Z',
    updatedAt: '2026-03-12T11:10:00.000Z',
  },
  {
    id: 'template-service-followup',
    name: 'Service Follow-up',
    description: 'A lighter follow-up invoice for service-based recurring clients.',
    templateType: 'service',
    usageCount: 7,
    templateData: {
      type: 'invoice',
      currency: 'USD',
      sender: {
        ...BASE_SENDER,
      },
      client: {
        name: 'Northwind Studio',
        email: '',
        address: '',
        phone: '',
        customFields: [],
      },
      items: [
        {
          id: 'template-service-item',
          description: 'Design support retainer',
          quantity: 1,
          rate: 2400,
          amount: 2400,
          customValues: {},
        },
      ],
      taxRate: 6,
    },
    createdAt: '2026-02-22T08:15:00.000Z',
    updatedAt: '2026-03-10T16:45:00.000Z',
  },
  {
    id: 'template-commercial-large',
    name: 'Commercial Large',
    description: 'Built for bigger procurement and equipment billing.',
    templateType: 'commercial',
    usageCount: 3,
    templateData: {
      type: 'invoice',
      currency: 'CNY',
      sender: {
        ...BASE_SENDER,
      },
      client: {
        name: 'Harbor Logistics',
        email: '',
        address: '',
        phone: '',
        customFields: [],
      },
      items: [
        {
          id: 'template-commercial-item',
          description: 'Equipment procurement package',
          quantity: 1,
          rate: 88000,
          amount: 88000,
          customValues: {},
        },
      ],
      taxRate: 0,
    },
    createdAt: '2026-01-18T07:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
  },
];

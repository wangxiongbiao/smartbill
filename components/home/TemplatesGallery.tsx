import React from 'react';
import InvoicePreview from '@/components/InvoicePreview';
import ScalableInvoiceContainer from '@/components/ScalableInvoiceContainer';
import type { Invoice, InvoiceTemplate } from '@/types';

const TEMPLATE_ITEMS: Array<{ template: InvoiceTemplate; category: string }> = [
  {
    category: 'Consulting',
    template: {
      id: 'public-consulting-template',
      user_id: 'public',
      name: 'Consulting invoice template',
      description: 'For strategy retainers, workshops, and advisory projects.',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
      usage_count: 124,
      template_data: {
        type: 'invoice',
        currency: 'USD',
        taxRate: 0,
        template: 'minimalist',
        isHeaderReversed: true,
        sender: {
          name: 'Northline Consulting',
          email: 'billing@northline.co',
          address: '88 Market Street, Suite 1200',
        },
        client: {
          name: 'Acme Growth Partners',
          email: 'finance@acmegrowth.com',
          address: '420 Mission Bay, San Francisco, CA',
        },
        items: [
          { id: '1', description: 'Monthly advisory retainer', quantity: 1, rate: 2400 },
          { id: '2', description: 'Stakeholder workshop', quantity: 1, rate: 850 },
        ],
        notes: 'Payment due within 14 days.',
        paymentInfo: {
          fields: [
            { id: 'bankName', label: 'Bank', type: 'text', order: 0, visible: true, required: true, value: 'DBS Business' },
            { id: 'accountName', label: 'Account Name', type: 'text', order: 1, visible: true, required: true, value: 'Northline Consulting Ltd.' },
            { id: 'accountNumber', label: 'Account Number', type: 'text', order: 2, visible: true, required: true, value: '512-204-8891' },
          ],
        },
        visibility: { date: true, dueDate: true, paymentInfo: true },
      },
    },
  },
  {
    category: 'Agency',
    template: {
      id: 'public-agency-template',
      user_id: 'public',
      name: 'Creative agency invoice template',
      description: 'For campaign retainers, design work, and production billing.',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
      usage_count: 96,
      template_data: {
        type: 'invoice',
        currency: 'USD',
        taxRate: 8,
        template: 'minimalist',
        isHeaderReversed: true,
        sender: {
          name: 'Studio Radius',
          email: 'accounts@studioradius.com',
          address: '19 Howard Street, New York, NY',
        },
        client: {
          name: 'Lumina Skincare',
          email: 'ap@lumina.co',
          address: '600 Spring Street, Los Angeles, CA',
        },
        items: [
          { id: '1', description: 'Campaign concept development', quantity: 1, rate: 1800 },
          { id: '2', description: 'Creative production support', quantity: 1, rate: 1200 },
        ],
        notes: 'Includes one revision round and export-ready assets.',
        visibility: { date: true, dueDate: true, paymentInfo: false },
      },
    },
  },
  {
    category: 'Freelance',
    template: {
      id: 'public-freelance-template',
      user_id: 'public',
      name: 'Developer retainer invoice template',
      description: 'For engineering support, bug fixes, and monthly maintenance.',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
      usage_count: 138,
      template_data: {
        type: 'invoice',
        currency: 'USD',
        taxRate: 0,
        template: 'minimalist',
        isHeaderReversed: true,
        sender: {
          name: 'Kai Dev Studio',
          email: 'billing@kaidev.io',
          address: 'Remote-first · Singapore',
        },
        client: {
          name: 'Orbit Labs',
          email: 'finance@orbitlabs.ai',
          address: '71 Robinson Road, Singapore',
        },
        items: [
          { id: '1', description: 'Monthly maintenance retainer', quantity: 1, rate: 1500 },
          { id: '2', description: 'Production bug fixes', quantity: 4, rate: 120 },
        ],
        notes: 'Covers support requests up to agreed monthly scope.',
        visibility: { date: true, dueDate: true, paymentInfo: false },
      },
    },
  },
  {
    category: 'Construction',
    template: {
      id: 'public-contractor-template',
      user_id: 'public',
      name: 'Contractor progress invoice template',
      description: 'For milestone billing, site work, and project-based payment schedules.',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
      usage_count: 62,
      template_data: {
        type: 'invoice',
        currency: 'USD',
        taxRate: 5,
        template: 'minimalist',
        isHeaderReversed: true,
        sender: {
          name: 'Granite Build Co.',
          email: 'billing@granitebuild.com',
          address: '250 River Road, Austin, TX',
        },
        client: {
          name: 'Harbor Retail Group',
          email: 'accounts@harborretail.com',
          address: '19 West Plaza, Austin, TX',
        },
        items: [
          { id: '1', description: 'Framing and structural labor', quantity: 1, rate: 4200 },
          { id: '2', description: 'Electrical rough-in milestone', quantity: 1, rate: 1650 },
        ],
        notes: 'Progress billing for phase 2 completion.',
        visibility: { date: true, dueDate: true, paymentInfo: false },
      },
    },
  },
  {
    category: 'Marketing',
    template: {
      id: 'public-marketing-template',
      user_id: 'public',
      name: 'Marketing monthly invoice template',
      description: 'For content retainers, ads management, and reporting cycles.',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
      usage_count: 101,
      template_data: {
        type: 'invoice',
        currency: 'USD',
        taxRate: 0,
        template: 'minimalist',
        isHeaderReversed: true,
        sender: {
          name: 'Signal Growth',
          email: 'ops@signalgrowth.io',
          address: '100 King Street, Toronto, ON',
        },
        client: {
          name: 'Peak Commerce',
          email: 'finance@peakcommerce.com',
          address: '500 Queen Street, Toronto, ON',
        },
        items: [
          { id: '1', description: 'Monthly paid ads management', quantity: 1, rate: 1300 },
          { id: '2', description: 'Performance reporting and insights', quantity: 1, rate: 350 },
        ],
        notes: 'Includes monthly optimization and performance summary.',
        visibility: { date: true, dueDate: true, paymentInfo: false },
      },
    },
  },
  {
    category: 'General',
    template: {
      id: 'public-simple-template',
      user_id: 'public',
      name: 'Simple clean invoice template',
      description: 'A versatile format for service providers who want a minimal layout.',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
      usage_count: 189,
      template_data: {
        type: 'invoice',
        currency: 'USD',
        taxRate: 0,
        template: 'minimalist',
        isHeaderReversed: true,
        sender: {
          name: 'SmartBill Studio',
          email: 'hello@smartbillpro.com',
          address: 'Online business template',
        },
        client: {
          name: 'Client Company',
          email: 'client@example.com',
          address: 'Client billing address',
        },
        items: [
          { id: '1', description: 'Service item', quantity: 1, rate: 800 },
          { id: '2', description: 'Additional scope', quantity: 1, rate: 260 },
        ],
        notes: 'Minimalist invoice layout for general use cases.',
        visibility: { date: true, dueDate: true, paymentInfo: false },
      },
    },
  },
];

function buildPreviewInvoice(template: InvoiceTemplate): Invoice {
  const today = '2026-03-10';
  const dueDate = '2026-03-24';

  return {
    id: template.id,
    type: template.template_data.type || 'invoice',
    invoiceNumber: 'INV-2048',
    date: today,
    dueDate,
    sender: {
      name: template.template_data.sender?.name || 'SmartBill',
      email: template.template_data.sender?.email || '',
      address: template.template_data.sender?.address || '',
      phone: template.template_data.sender?.phone,
      logo: template.template_data.sender?.logo,
      signature: template.template_data.sender?.signature,
      disclaimerText: template.template_data.sender?.disclaimerText,
      customFields: template.template_data.sender?.customFields,
    },
    client: {
      name: template.template_data.client?.name || 'Client Company',
      email: template.template_data.client?.email || '',
      address: template.template_data.client?.address || '',
      phone: template.template_data.client?.phone,
      customFields: template.template_data.client?.customFields,
    },
    paymentInfo: template.template_data.paymentInfo,
    items: template.template_data.items || [],
    taxRate: template.template_data.taxRate || 0,
    currency: template.template_data.currency || 'USD',
    notes: template.template_data.notes || '',
    status: 'Draft',
    template: template.template_data.template || 'minimalist',
    isHeaderReversed: template.template_data.isHeaderReversed ?? true,
    visibility: {
      date: true,
      dueDate: true,
      paymentInfo: template.template_data.visibility?.paymentInfo ?? false,
      ...template.template_data.visibility,
    },
    columnConfig: template.template_data.columnConfig,
    customStrings: template.template_data.customStrings,
  };
}

function TemplatePreviewCard({ item }: { item: { template: InvoiceTemplate; category: string } }) {
  const previewInvoice = buildPreviewInvoice(item.template);
  const total = previewInvoice.items.reduce((sum, row) => sum + Number(row.quantity) * Number(row.rate), 0);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
          {item.category}
        </span>
        <span className="text-xs font-bold text-slate-400">Used {item.template.usage_count || 0} times</span>
      </div>

      <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950">{item.template.name}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">{item.template.description}</p>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 p-3">
        <ScalableInvoiceContainer baseWidth={794} className="pointer-events-none">
          <div className="w-[794px]">
            <InvoicePreview
              invoice={previewInvoice}
              template={previewInvoice.template || 'minimalist'}
              isHeaderReversed={previewInvoice.isHeaderReversed}
              lang="en"
            />
          </div>
        </ScalableInvoiceContainer>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Typical total</div>
          <div className="mt-1 text-lg font-black text-slate-950">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: previewInvoice.currency }).format(total)}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span>Minimalist template</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </article>
  );
}

export function TemplatesGallery() {
  return (
    <section id="templates" className="bg-slate-50 py-14 md:py-20" data-purpose="templates">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
            <i className="fas fa-clone"></i>
            Real template previews built from SmartBill invoice data
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Start from realistic invoice templates instead of abstract placeholder cards.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            These previews now use real SmartBill invoice structures — sender, client, items, totals, payment info, currency, and due date — so the section looks like an actual product template gallery.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {TEMPLATE_ITEMS.map((item) => (
            <TemplatePreviewCard key={item.template.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

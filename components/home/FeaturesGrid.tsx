import React from 'react';

export function FeaturesGrid() {
  const features = [
    { icon: 'fa-save', title: 'Auto-save drafts', desc: 'Invoice edits save automatically so you do not lose work while switching between clients and documents.' },
    { icon: 'fa-file-pdf', title: 'PDF export', desc: 'Download clean PDF invoices that are ready to send, print, or archive.' },
    { icon: 'fa-layer-group', title: 'Reusable templates', desc: 'Turn a good invoice setup into a repeatable template for similar projects.' },
    { icon: 'fa-wallet', title: 'Payment sections', desc: 'Add transfer instructions, QR images, and notes so clients know exactly how to pay.' },
    { icon: 'fa-globe', title: 'Multi-currency support', desc: 'Bill clients in different currencies without rebuilding your document structure.' },
    { icon: 'fa-brush', title: 'Brand customization', desc: 'Include your logo, invoice text, and visual style for more professional delivery.' },
    { icon: 'fa-clock-rotate-left', title: 'Invoice records', desc: 'Keep a searchable list of invoices, statuses, and recent activity in one dashboard.' },
    { icon: 'fa-chart-line', title: 'Revenue overview', desc: 'Track billing trends from the dashboard homepage and spot overdue amounts faster.' },
    { icon: 'fa-share-nodes', title: 'Share workflow', desc: 'Prepare invoices for sending, sharing, and follow-up with less manual formatting work.' },
  ];

  return (
    <section className="bg-slate-50 py-14 md:py-20" data-purpose="features-grid">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Core product capabilities that deserve SEO emphasis</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Your current project is strongest around invoice creation, template reuse, payment info, export, and records. So the homepage should talk about those directly instead of generic SaaS claims.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

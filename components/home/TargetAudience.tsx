import React from 'react';

export function TargetAudience() {
  const audience = [
    {
      title: 'Freelancers',
      desc: 'Create fast, professional invoices for client projects without juggling spreadsheets and design files.',
      icon: 'fa-user-tie',
    },
    {
      title: 'Agencies & studios',
      desc: 'Reuse branded templates for recurring retainers, campaigns, and project-based billing.',
      icon: 'fa-building',
    },
    {
      title: 'Small businesses',
      desc: 'Keep invoice records organized, track drafts, and export polished PDFs for bookkeeping and client delivery.',
      icon: 'fa-shop',
    },
  ];

  return (
    <section id="audience" className="bg-white py-14 md:py-20" data-purpose="audience-segments">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
            <i className="fas fa-users"></i>
            Who SmartBill is for
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            SmartBill fits service businesses that need accurate, presentable invoices without heavy accounting software.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            If your workflow is quote the work, send the invoice, collect payment, and keep a clean record, this homepage and product positioning should lean into exactly that.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {audience.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';

export function Features() {
  return (
    <section id="features" className="bg-white py-14 md:py-20" data-purpose="feature-sections">
      <div className="space-y-20 px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid items-center gap-12 xl:grid-cols-[1fr_0.96fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
              <i className="fas fa-credit-card"></i>
              Payment-ready invoices
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Put payment details, notes, and client context into one clean invoice.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              SmartBill helps you avoid back-and-forth. Add bank details, payment QR images, billing notes, and custom fields directly inside the invoice your client receives.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                'Keep transfer details inside the same document',
                'Attach QR screenshots and custom payment fields',
                'Reduce payment friction with clearer invoice context',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <i className="fas fa-check text-xs"></i>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment block</div>
                  <div className="mt-1 text-lg font-black text-slate-950">Everything a client needs to pay</div>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Ready</div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bank transfer</div>
                  <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
                    <div className="rounded-xl bg-white px-3 py-2">Bank: DBS Business</div>
                    <div className="rounded-xl bg-white px-3 py-2">Account: SmartBill Studio</div>
                    <div className="rounded-xl bg-white px-3 py-2">Ref: INV-2048</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">QR payment</div>
                  <div className="mt-3 grid h-28 place-items-center rounded-2xl bg-slate-950 text-white">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span
                          key={index}
                          className={`h-3 w-3 rounded-[2px] ${index % 2 === 0 || index % 7 === 0 ? 'bg-white' : 'bg-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
                  Notes: Please include invoice number in your transfer memo for faster reconciliation.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-12 xl:grid-cols-[0.96fr_1fr]">
          <div className="order-2 lg:order-1 rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <div className="rounded-[22px] bg-white/5 p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Template workflow</div>
                  <div className="mt-1 text-lg font-black">Reuse your invoice structure</div>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">Live preview</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['Branding', 'Line items', 'Payment info'].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/5 px-4 py-5 text-center text-sm font-bold text-white/90">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Editor</div>
                    <div className="mt-1 text-base font-black">Change only what matters</div>
                  </div>
                  <i className="fas fa-pen-to-square text-slate-400"></i>
                </div>
                <div className="mt-4 space-y-3">
                  {['Client details', 'Dates and totals', 'Notes and delivery'].map((row, index) => (
                    <div key={row} className="rounded-xl bg-slate-100 px-3 py-3">
                      <div className="text-sm font-semibold text-slate-700">{row}</div>
                      <div className="mt-2 h-2 rounded-full bg-slate-300" style={{ width: `${90 - index * 15}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
              <i className="fas fa-layer-group"></i>
              Reusable templates
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Build once, reuse often, and keep every invoice on brand.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Save working invoice setups as templates, create new drafts from them, and edit with a live preview. This is especially useful when you bill similar services every week.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Structured editor',
                  desc: 'Update sender, client, line items, taxes, notes, and payment sections in one place.',
                  icon: 'fa-pen-ruler',
                },
                {
                  title: 'Instant preview',
                  desc: 'See the invoice layout and totals as you edit so you catch mistakes early.',
                  icon: 'fa-eye',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

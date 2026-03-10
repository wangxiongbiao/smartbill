import React from 'react';

export function SocialProof() {
  const points = [
    'Invoice editor with live preview',
    'Reusable templates for repeat billing',
    'PDF export and sharing workflow',
    'Payment details, QR, and branding support',
  ];

  return (
    <section className="border-y border-slate-200 bg-white py-5" data-purpose="trust-badges">
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14">
        <p className="text-center text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
          Built around the workflow invoice-heavy businesses actually use
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {points.map((point) => (
            <div key={point} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <i className="fas fa-circle-check text-emerald-500"></i>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

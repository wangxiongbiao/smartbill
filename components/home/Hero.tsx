'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { createClient } from '@/lib/supabase/client';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-black tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

export function Hero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isGoogleLoading, handleGoogleLogin } = useGoogleAuth({
    nextPath: '/invoices/new',
    onSuccess: (target) => router.push(target || '/invoices/new'),
  });

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsLoggedIn(!!data.session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsLoggedIn(!!session?.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function handleCTA() {
    if (isLoggedIn) {
      router.push('/invoices/new');
      return;
    }
    handleGoogleLogin();
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_55%,#f8fafc_100%)]" data-purpose="hero">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_28%)]" />
      <div className="grid gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-24 lg:pt-24 2xl:px-14">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Invoice generator for real client work
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Create clean invoices, reuse templates, and export polished PDFs with SmartBill.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            SmartBill is built for freelancers, contractors, agencies, and small businesses that need faster billing.
            Add your logo, client details, payment instructions, and line items in one focused workflow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleCTA}
              disabled={isGoogleLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
            >
              <i className={`fas ${isGoogleLoading ? 'fa-circle-notch fa-spin' : 'fa-plus'}`}></i>
              {isLoggedIn ? 'Create new invoice' : 'Start free with Google'}
            </button>
            <button
              onClick={() => router.push('/templates')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              <i className="fas fa-layer-group"></i>
              Browse templates
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Use case" value="Invoices + templates" />
            <MetricCard label="Output" value="Share-ready PDF" />
            <MetricCard label="Workflow" value="Draft → edit → export" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">SmartBill preview</div>
                <div className="mt-1 text-lg font-black text-slate-950">Invoice #INV-2048</div>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Auto-saved</div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Editor</div>
                    <div className="mt-1 text-base font-black text-slate-900">Billing details</div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {['Client name', 'Invoice number', 'Payment info'].map((label, index) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</div>
                      <div className="mt-2 h-2.5 rounded-full bg-slate-200" style={{ width: `${88 - index * 10}%` }} />
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-wand-magic-sparkles"></i>
                    Reuse template, keep branding, edit only what changed.
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-slate-950 p-5 text-white">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Invoice PDF</div>
                    <div className="mt-2 text-2xl font-black">SmartBill Studio</div>
                    <div className="mt-1 text-sm text-white/70">Brand-forward billing for service businesses</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Due</div>
                    <div className="mt-1 text-sm font-black">2026-03-24</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Bill to</div>
                    <div className="mt-2 font-semibold leading-6">Acme Creative Ltd.<br />finance@acme.co</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Payment</div>
                    <div className="mt-2 font-semibold leading-6">Bank transfer<br />QR available</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ['Website design sprint', '$1,600'],
                    ['Invoice layout setup', '$480'],
                    ['Client revisions', '$220'],
                  ].map(([item, amount]) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
                      <span className="font-medium text-white/85">{item}</span>
                      <span className="font-black">{amount}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-blue-500/20 px-4 py-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/70">Total due</div>
                    <div className="mt-1 text-3xl font-black">$2,300</div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950">PDF export ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { useMarketingAuth } from '@/components/marketing/MarketingAuthProvider';
import { useMarketingLanguage } from '@/components/marketing/MarketingLanguageProvider';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_20px_44px_-34px_rgba(37,99,235,0.16)]">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">{label}</div>
      <div className="mt-2 text-xl font-black tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

export function Hero() {
  const { isLoggedIn, isGoogleLoading, openProtectedRoute } = useMarketingAuth();
  const { lang } = useMarketingLanguage();

  const copy = lang === 'zh-TW'
    ? {
        title: '用 SmartBill 建立乾淨專業的發票，重用模板，並匯出精緻 PDF。',
        subtitle: 'SmartBill 適合自由工作者、承包商、工作室與小型企業。把 logo、客戶資料、付款資訊與明細集中在同一個順手流程裡。',
        primaryLoggedIn: '建立新發票',
        primaryLoggedOut: '免費開始',
        secondary: '瀏覽模板',
        metric1Label: '使用場景',
        metric1Value: '發票 + 模板',
        metric2Label: '輸出',
        metric2Value: '可分享 PDF',
        metric3Label: '流程',
        metric3Value: '草稿 → 編輯 → 匯出',
      }
    : {
        title: 'Create clean invoices, reuse templates, and export polished PDFs with SmartBill.',
        subtitle: 'SmartBill is built for freelancers, contractors, agencies, and small businesses that need faster billing. Add your logo, client details, payment instructions, and line items in one focused workflow.',
        primaryLoggedIn: 'Create new invoice',
        primaryLoggedOut: 'Start free',
        secondary: 'Browse templates',
        metric1Label: 'Use case',
        metric1Value: 'Invoices + templates',
        metric2Label: 'Output',
        metric2Value: 'Share-ready PDF',
        metric3Label: 'Workflow',
        metric3Value: 'Draft → edit → export',
      };

  function handleCTA() {
    openProtectedRoute('/invoices/new');
  }

  return (
    <section className="relative overflow-hidden bg-white" data-purpose="hero">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_top_left,rgba(219,234,254,0.9),transparent_28%),radial-gradient(circle_at_center,rgba(125,211,252,0.12),transparent_40%)]" />
      <div className="grid gap-12 px-4 pb-10 pt-2 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-24 lg:pt-16 2xl:px-14">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleCTA}
              disabled={isGoogleLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70 shadow-[0_18px_35px_-24px_rgba(37,99,235,0.5)]"
            >
              <i className={`fas ${isGoogleLoading ? 'fa-circle-notch fa-spin' : 'fa-plus'}`}></i>
              {isLoggedIn ? copy.primaryLoggedIn : copy.primaryLoggedOut}
            </button>
            <button
              onClick={() => openProtectedRoute('/templates')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <i className="fas fa-layer-group"></i>
              {copy.secondary}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label={copy.metric1Label} value={copy.metric1Value} />
            <MetricCard label={copy.metric2Label} value={copy.metric2Value} />
            <MetricCard label={copy.metric3Label} value={copy.metric3Value} />
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-white p-4 shadow-[0_28px_90px_-46px_rgba(37,99,235,0.2)] sm:p-6">
            <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-blue-500">SmartBill preview</div>
                <div className="mt-1 text-lg font-black text-slate-950">Invoice #INV-2048</div>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Auto-saved</div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[28px] border border-blue-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Editor</div>
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
                    <div key={label} className="rounded-2xl bg-blue-50 p-3">
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">{label}</div>
                      <div className="mt-2 h-2.5 rounded-full bg-blue-200" style={{ width: `${88 - index * 10}%` }} />
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

              <div className="rounded-[28px] bg-[linear-gradient(145deg,#1d4ed8_0%,#3b82f6_54%,#93c5fd_100%)] p-5 text-white shadow-[0_28px_56px_-34px_rgba(37,99,235,0.46)]">
                <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">Invoice PDF</div>
                    <div className="mt-2 text-2xl font-black">SmartBill Studio</div>
                    <div className="mt-1 text-sm text-white/80">Brand-forward billing for service businesses</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">Due</div>
                    <div className="mt-1 text-sm font-black">2026-03-24</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Bill to</div>
                    <div className="mt-2 font-semibold leading-6">Acme Creative Ltd.<br />finance@acme.co</div>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Payment</div>
                    <div className="mt-2 font-semibold leading-6">Bank transfer<br />QR available</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ['Website design sprint', '$1,600'],
                    ['Invoice layout setup', '$480'],
                    ['Client revisions', '$220'],
                  ].map(([item, amount]) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-white/12 px-4 py-3 text-sm backdrop-blur-sm">
                      <span className="font-medium text-white/90">{item}</span>
                      <span className="font-black">{amount}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/18 px-4 py-4 backdrop-blur-sm">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Total due</div>
                    <div className="mt-1 text-3xl font-black">$2,300</div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-xs font-black text-blue-700">PDF export ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

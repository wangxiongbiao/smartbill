import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white" data-purpose="footer">
      <div className="px-4 py-14 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950">
                <i className="fas fa-file-invoice"></i>
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">SmartBill</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Invoice workflow</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              SmartBill helps freelancers and small businesses create professional invoices, reuse templates, organize records, and export polished PDFs with less manual work.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/45">Product</h4>
            <ul className="mt-5 space-y-3 text-sm font-medium text-white/70">
              <li><Link className="transition-colors hover:text-white" href="/dashboard">Dashboard</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/invoices/new">Create invoice</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/templates">Templates</Link></li>
              <li><a className="transition-colors hover:text-white" href="#features">Features</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/45">Use cases</h4>
            <ul className="mt-5 space-y-3 text-sm font-medium text-white/70">
              <li>Freelance invoicing</li>
              <li>Agency retainers</li>
              <li>Consulting billing</li>
              <li>Small business invoices</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/45">Contact</h4>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <i className="fas fa-envelope mt-1 text-white/45"></i>
                <div>
                  <div className="font-semibold text-white">smartbillpro@gmail.com</div>
                  <div className="mt-1 text-white/55">For product feedback, support, and business inquiries.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SmartBill. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Invoice generator</span>
            <span>Templates</span>
            <span>PDF export</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

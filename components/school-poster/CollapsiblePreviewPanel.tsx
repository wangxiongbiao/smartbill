"use client";

import React, { useState } from 'react';

interface CollapsiblePreviewPanelProps {
  title: string;
  subtitle: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsiblePreviewPanel({
  title,
  subtitle,
  icon,
  defaultOpen = true,
  children,
}: CollapsiblePreviewPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <i className={`${icon} text-sm`}></i>
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-sm text-slate-400`}></i>
      </button>

      {isOpen && <div className="border-t border-slate-200 p-4">{children}</div>}
    </section>
  );
}

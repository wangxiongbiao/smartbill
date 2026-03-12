import React from 'react';
import SaveStatusIndicator from '@/components/SaveStatusIndicator';
import { translations } from '@/i18n';
import type { Invoice, Language, ViewType } from '@/types';

export function getHeaderBreadcrumbs({
  activeView,
  invoice,
  lang,
  saveStatus,
  lastSavedTime,
  onBack,
}: {
  activeView: ViewType;
  invoice?: Invoice;
  lang: Language;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedTime?: Date;
  onBack?: () => void;
}) {
  const t = translations[lang] || translations.en;
  const crumbs: React.ReactNode[] = [
    <span key="home" className="text-slate-400 font-bold tracking-widest text-xs">SmartBill Pro</span>
  ];

  if (activeView === 'records') {
    crumbs.push(
      <i key="sep1" className="fas fa-chevron-right text-[0.625rem] text-slate-300"></i>,
      <span key="records" className="text-slate-800 font-bold tracking-widest text-xs">{t.breadcrumbRecords}</span>
    );
  } else if (activeView === 'editor' && invoice) {
    crumbs.push(
      <i key="sep1" className="fas fa-chevron-right text-[0.625rem] text-slate-300"></i>,
      <span key="records" className="text-slate-400 font-bold tracking-widest text-xs cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack}>{t.breadcrumbRecords}</span>,
      <i key="sep2" className="fas fa-chevron-right text-[0.625rem] text-slate-300"></i>,
      <div key="current" className="flex items-center gap-2">
        <span className="text-slate-900 font-bold text-sm">{t.editing}: {invoice.invoiceNumber}</span>
        <SaveStatusIndicator status={saveStatus} lang={lang} lastSavedTime={lastSavedTime} />
      </div>
    );
  } else if (activeView === 'profile') {
    crumbs.push(
      <i key="sep1" className="fas fa-chevron-right text-[0.625rem] text-slate-300"></i>,
      <span key="profile" className="text-slate-900 font-black tracking-widest text-xs">{t.breadcrumbProfile}</span>
    );
  } else if (activeView === 'templates' || activeView === 'template-detail') {
    crumbs.push(
      <i key="sep1" className="fas fa-chevron-right text-[0.625rem] text-slate-300"></i>,
      <span key="templates" className="text-slate-900 font-black tracking-widest text-xs">{t.breadcrumbTemplates}</span>
    );
  }

  return crumbs;
}

export function isEditorActionView(activeView: ViewType) {
  return activeView === 'editor';
}

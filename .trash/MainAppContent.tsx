"use client";

import React from 'react';
import AuthView from '@/components/AuthView';
import AboutView from '@/components/AboutView';
import HelpView from '@/components/HelpView';
import HomeView from '@/components/HomeView';
import RecordsView from '@/components/RecordsView';
import ProfileView from '@/components/ProfileView';
import TemplatesView from '@/components/TemplatesView';
import type { Invoice, InvoiceTemplate, Language, User, ViewType } from '@/types';

interface MainAppContentProps {
  activeView: ViewType;
  user: User | null;
  records: Invoice[];
  lang: Language;
  prevView: ViewType;
  isDeletingId?: string | null;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onBack: (view: ViewType) => void;
  onOpenRecords: () => void;
  onOpenTemplates: () => void;
  onOpenAI: () => void;
  onExportLatest: () => void;
  onCreateInvoice: () => Promise<void>;
  onOpenInvoice: (record: Invoice) => void;
  onDuplicateInvoice: (record: Invoice) => Promise<void>;
  onDeleteInvoice: (id: string) => void;
  onExportInvoice: (record: Invoice) => void;
  onUseTemplate: (template: InvoiceTemplate) => Promise<void>;
  onOpenTemplateDetail: (template: InvoiceTemplate) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export default function MainAppContent(props: MainAppContentProps) {
  switch (props.activeView) {
    case 'home':
      return (
        <HomeView
          records={props.records}
          onCreateEmpty={props.onCreateInvoice}
          onOpenRecords={props.onOpenRecords}
          onOpenTemplates={props.onOpenTemplates}
          onOpenAI={props.onOpenAI}
          onExportLatest={props.onExportLatest}
          lang={props.lang}
        />
      );
    case 'records':
      if (!props.user) return <AuthView lang={props.lang} targetView="records" showToast={props.showToast} />;
      return (
        <RecordsView
          records={props.records}
          lang={props.lang}
          isDeletingId={props.isDeletingId}
          onEdit={props.onOpenInvoice}
          onDuplicate={props.onDuplicateInvoice}
          onDelete={props.onDeleteInvoice}
          onExport={props.onExportInvoice}
          onNewDoc={props.onCreateInvoice}
        />
      );
    case 'profile':
      if (!props.user) return <AuthView lang={props.lang} targetView="profile" showToast={props.showToast} />;
      return (
        <ProfileView
          recordsCount={props.records.length}
          user={props.user}
          onLogout={props.onLogout}
          onUpdateUser={props.onUpdateUser}
          lang={props.lang}
          showToast={props.showToast}
        />
      );
    case 'templates':
      if (!props.user) return <AuthView lang={props.lang} targetView="templates" showToast={props.showToast} />;
      return (
        <TemplatesView
          lang={props.lang}
          templates={[]}
          loading={true}
          onUseTemplate={props.onUseTemplate}
          onViewDetail={props.onOpenTemplateDetail}
          onNewDoc={props.onCreateInvoice}
        />
      );
    case 'about':
      return <AboutView lang={props.lang} onBack={() => props.onBack(props.prevView)} onCreateInvoice={props.onCreateInvoice} />;
    case 'help':
      return <HelpView lang={props.lang} onBack={() => props.onBack(props.prevView)} />;
    default:
      return null;
  }
}

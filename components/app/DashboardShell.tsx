import React from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import type { Invoice, Language, User, ViewType } from '@/types';

interface DashboardShellProps {
  user: User | null;
  lang: Language;
  activeView: ViewType;
  invoice: Invoice;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedTime?: Date;
  isExporting: boolean;
  onSetView: (view: ViewType) => void;
  onSetLang: (lang: Language) => void;
  onLogout: () => void;
  onNewInvoice: () => void;
  onExportPdf: () => void;
  onSaveTemplate: () => void;
  onShare: () => void;
  onSendEmail: () => void;
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean };
  onCloseToast: () => void;
  printArea: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardShell(props: DashboardShellProps) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <DashboardSidebar
        user={props.user}
        activeView={props.activeView}
        setView={props.onSetView}
        lang={props.lang}
        setLang={props.onSetLang}
        onLogout={props.onLogout}
        onNewInvoice={props.onNewInvoice}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative h-screen overflow-y-auto">
        <DashboardHeader
          user={props.user}
          lang={props.lang}
          activeView={props.activeView}
          invoice={props.invoice}
          saveStatus={props.saveStatus}
          lastSavedTime={props.lastSavedTime}
          isExporting={props.isExporting}
          onExportPdf={props.onExportPdf}
          onSaveTemplate={props.onSaveTemplate}
          onShare={props.onShare}
          onSendEmail={props.onSendEmail}
          onLangChange={props.onSetLang}
          onBack={() => props.onSetView('records')}
        />

        <main className="flex-1">{props.children}</main>
        {props.printArea}
        <div className="md:hidden">
          <BottomNav activeView={props.activeView} setView={props.onSetView} lang={props.lang} />
        </div>
        <Toast message={props.toast.message} type={props.toast.type} isVisible={props.toast.isVisible} onClose={props.onCloseToast} />
      </div>
    </div>
  );
}

import React from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import Toast from '@/components/Toast';
import UIDebugOverlay from '@/components/UIDebugOverlay';
import type { DashboardShellProps } from '@/components/app/DashboardShellProps';

export default function DashboardShell(props: DashboardShellProps) {
  return (
    <div className="min-h-screen flex bg-slate-50" data-ui-shell>
      <DashboardSidebar
        user={props.user}
        activeView={props.activeView}
        setView={props.onSetView}
        lang={props.lang}
        onLogout={props.onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative h-screen overflow-y-auto" data-ui-content>
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

        <main className="flex-1" data-ui-main>{props.children}</main>
        {props.printArea}
        <div className="md:hidden">
          <BottomNav activeView={props.activeView} setView={props.onSetView} lang={props.lang} />
        </div>
        <LogoutConfirmDialog
          isOpen={props.isLogoutConfirmOpen}
          onClose={props.onCloseLogoutConfirm}
          onConfirm={props.onConfirmLogout}
          isProcessing={props.isLoggingOut}
          lang={props.lang}
        />
        <Toast message={props.toast.message} type={props.toast.type} isVisible={props.toast.isVisible} onClose={props.onCloseToast} />
        <UIDebugOverlay />
      </div>
    </div>
  );
}

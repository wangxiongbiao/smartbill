"use client";

import React, { useState } from 'react';
import { translations } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useInvoiceWorkspace } from '@/hooks/useInvoiceWorkspace';
import { useMainAppController } from '@/hooks/useMainAppController';
import { useEditorUiState } from '@/hooks/useEditorUiState';
import { useInvoicePdfExport } from '@/hooks/useInvoicePdfExport';
import DashboardShell from '@/components/app/DashboardShell';
import LoginScreen from '@/components/app/LoginScreen';
import MainAppLoadingScreen from '@/components/app/MainAppLoadingScreen';
import MainAppLogoutScreen from '@/components/app/MainAppLogoutScreen';
import MainAppRouteContent from '@/components/app/MainAppRouteContent';
import InvoicePreview from '@/components/InvoicePreview';
import type { Language, ViewType } from '@/types';

interface MainAppProps {
  initialView?: ViewType;
  templateId?: string | null;
  invoiceId?: string | null;
  autoCreateInvoice?: boolean;
}

export default function MainApp({
  initialView = 'home',
  templateId = null,
  invoiceId = null,
  autoCreateInvoice = false,
}: MainAppProps) {
  const [lang, setLang] = useState<Language>('en');
  const editorUi = useEditorUiState();
  const { toast, showToast, hideToast } = useToast();
  const auth = useAuthSession();
  const workspace = useInvoiceWorkspace({
    user: auth.user,
    records: auth.records,
    setRecords: auth.setRecords,
    activeView: auth.activeView,
    setActiveView: auth.setActiveView,
    lang,
    showToast
  });

  const printAreaRef = React.useRef<HTMLDivElement>(null);

  const controller = useMainAppController({
    initialView,
    templateId,
    invoiceId,
    autoCreateInvoice,
    auth: {
      isInitialized: auth.isInitialized,
      activeView: auth.activeView,
      setActiveView: auth.setActiveView,
      records: auth.records,
      user: auth.user ? { id: auth.user.id } : null,
    },
    workspace: {
      invoice: workspace.invoice,
      actions: {
        setInvoice: workspace.actions.setInvoice,
        setTemplate: workspace.actions.setTemplate,
        setIsHeaderReversed: workspace.actions.setIsHeaderReversed,
        setIsExporting: workspace.actions.setIsExporting,
        createInvoice: workspace.actions.createInvoice,
        duplicateInvoice: workspace.actions.duplicateInvoice,
        useTemplate: workspace.actions.useTemplate,
        saveCurrentInvoice: workspace.actions.saveCurrentInvoice,
      },
    },
    showToast,
    createInvoiceFailedText: translations[lang].createInvoiceFailed || '创建发票失败，请重试',
    newInvoiceCreatedText: translations[lang].newInvoiceCreated || '新发票创建成功！',
  });

  const pdfExport = useInvoicePdfExport({
    invoice: workspace.invoice,
    template: workspace.template,
    isHeaderReversed: workspace.isHeaderReversed,
    lang,
    isExporting: workspace.isExporting,
    setIsExporting: workspace.actions.setIsExporting,
    printAreaRef,
  });

  if (!auth.isInitialized) return <MainAppLoadingScreen />;
  if (auth.isLoggingOut) return <MainAppLogoutScreen />;
  if (auth.activeView === 'login') return <LoginScreen lang={lang} targetView="records" showToast={showToast} />;

  return (
    <DashboardShell
      user={auth.user}
      lang={lang}
      activeView={auth.activeView}
      invoice={workspace.invoice}
      saveStatus={workspace.saveStatus}
      lastSavedTime={workspace.lastSavedTime}
      isExporting={workspace.isExporting}
      onSetView={controller.setView}
      onSetLang={setLang}
      onLogout={auth.logout}
      onNewInvoice={controller.editorActions.createInvoice}
      onExportPdf={pdfExport.handleExportPdf}
      onSaveTemplate={editorUi.openSaveTemplateDialog}
      onShare={editorUi.openShareDialog}
      onSendEmail={editorUi.openEmailDialog}
      toast={toast}
      onCloseToast={hideToast}
      printArea={<div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]"><div ref={printAreaRef} style={{ width: '210mm' }}><InvoicePreview invoice={workspace.invoice} template={workspace.template} isHeaderReversed={workspace.isHeaderReversed} isForPdf={true} lang={lang} /></div></div>}
    >
      <MainAppRouteContent
        activeView={auth.activeView}
        activeTemplateId={controller.activeTemplateId}
        lang={lang}
        user={auth.user}
        records={auth.records}
        prevView={controller.prevView}
        invoice={workspace.invoice}
        template={workspace.template}
        isHeaderReversed={workspace.isHeaderReversed}
        isExporting={workspace.isExporting}
        isDeletingId={workspace.isDeletingId}
        isAIChatOpen={editorUi.isAIChatOpen}
        isShareDialogOpen={editorUi.isShareDialogOpen}
        isEmailDialogOpen={editorUi.isEmailDialogOpen}
        isSaveTemplateDialogOpen={editorUi.isSaveTemplateDialogOpen}
        isNewInvoiceConfirmOpen={editorUi.isNewInvoiceConfirmOpen}
        isCreatingNewInvoice={controller.isCreatingNewInvoice}
        showToast={showToast}
        onBack={controller.setView}
        onOpenRecords={() => controller.setView('records')}
        onOpenTemplates={() => controller.setView('templates')}
        onOpenAI={editorUi.openAIChat}
        onExportLatest={() => {
          if (auth.records[0]) {
            workspace.actions.setInvoice(auth.records[0]);
            setTimeout(pdfExport.handleExportPdf, 200);
          }
        }}
        onCreateInvoice={controller.editorActions.createInvoice}
        onOpenInvoice={controller.editorActions.openInvoice}
        onDuplicateInvoice={controller.editorActions.duplicateInvoice}
        onDeleteInvoice={workspace.actions.removeInvoice}
        onExportInvoice={(record) => {
          workspace.actions.setInvoice(record);
          setTimeout(pdfExport.handleExportPdf, 200);
        }}
        onUseTemplate={controller.editorActions.useTemplate}
        onOpenTemplateDetail={controller.editorActions.openTemplateDetail}
        onCloseTemplateDetail={controller.editorActions.closeTemplateDetail}
        onLogout={auth.logout}
        onUpdateUser={auth.setUser}
        onUpdateInvoice={workspace.actions.updateInvoice}
        onToggleAIChat={editorUi.toggleAIChat}
        onCloseAIChat={editorUi.closeAIChat}
        onCloseShareDialog={editorUi.closeShareDialog}
        onCloseEmailDialog={editorUi.closeEmailDialog}
        onCloseSaveTemplateDialog={editorUi.closeSaveTemplateDialog}
        onCloseNewInvoiceConfirm={editorUi.closeNewInvoiceConfirm}
        onSaveTemplate={workspace.actions.saveAsTemplate}
        onConfirmCreateInvoice={async () => {
          await controller.editorActions.confirmCreateInvoice();
          editorUi.closeNewInvoiceConfirm();
        }}
        onExportPdf={pdfExport.handleExportPdf}
      />
    </DashboardShell>
  );
}

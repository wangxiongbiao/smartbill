"use client";

import React from 'react';
import MainAppContent from '@/components/app/MainAppContent';
import InvoiceEditorWorkspace from '@/components/app/InvoiceEditorWorkspace';
import TemplateDetailScreen from '@/components/app/TemplateDetailScreen';
import type { Invoice, InvoiceTemplate, Language, TemplateType, User, ViewType } from '@/types';

interface MainAppRouteContentProps {
  activeView: ViewType;
  activeTemplateId: string | null;
  lang: Language;
  user: User | null;
  records: Invoice[];
  prevView: ViewType;
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  isExporting: boolean;
  isDeletingId?: string | null;
  isAIChatOpen: boolean;
  isShareDialogOpen: boolean;
  isEmailDialogOpen: boolean;
  isSaveTemplateDialogOpen: boolean;
  isNewInvoiceConfirmOpen: boolean;
  isCreatingNewInvoice: boolean;
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
  onCloseTemplateDetail: () => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onUpdateInvoice: (updates: Partial<Invoice>) => void;
  onToggleAIChat: () => void;
  onCloseAIChat: () => void;
  onCloseShareDialog: () => void;
  onCloseEmailDialog: () => void;
  onCloseSaveTemplateDialog: () => void;
  onCloseNewInvoiceConfirm: () => void;
  onSaveTemplate: (name: string, description: string) => Promise<void>;
  onConfirmCreateInvoice: () => Promise<void>;
  onExportPdf: () => void;
}

export default function MainAppRouteContent(props: MainAppRouteContentProps) {
  if (props.activeView === 'template-detail') {
    if (!props.activeTemplateId) return null;
    return (
      <TemplateDetailScreen
        templateId={props.activeTemplateId}
        template={null}
        loading={true}
        lang={props.lang}
        onUseTemplate={props.onUseTemplate}
        onBack={props.onCloseTemplateDetail}
        onDelete={async () => undefined}
        showToast={props.showToast}
      />
    );
  }

  if (props.activeView === 'editor') {
    return (
      <InvoiceEditorWorkspace
        invoice={props.invoice}
        template={props.template}
        isHeaderReversed={props.isHeaderReversed}
        lang={props.lang}
        userId={props.user?.id}
        isExporting={props.isExporting}
        isAIChatOpen={props.isAIChatOpen}
        isShareDialogOpen={props.isShareDialogOpen}
        isEmailDialogOpen={props.isEmailDialogOpen}
        isSaveTemplateDialogOpen={props.isSaveTemplateDialogOpen}
        isNewInvoiceConfirmOpen={props.isNewInvoiceConfirmOpen}
        isCreatingNewInvoice={props.isCreatingNewInvoice}
        showToast={props.showToast}
        onUpdateInvoice={props.onUpdateInvoice}
        onToggleAIChat={props.onToggleAIChat}
        onCloseAIChat={props.onCloseAIChat}
        onCloseShareDialog={props.onCloseShareDialog}
        onCloseEmailDialog={props.onCloseEmailDialog}
        onCloseSaveTemplateDialog={props.onCloseSaveTemplateDialog}
        onCloseNewInvoiceConfirm={props.onCloseNewInvoiceConfirm}
        onSaveTemplate={props.onSaveTemplate}
        onConfirmCreateInvoice={props.onConfirmCreateInvoice}
        onExportPdf={props.onExportPdf}
      />
    );
  }

  return (
    <MainAppContent
      activeView={props.activeView}
      user={props.user}
      records={props.records}
      lang={props.lang}
      prevView={props.prevView}
      isDeletingId={props.isDeletingId}
      showToast={props.showToast}
      onBack={props.onBack}
      onOpenRecords={props.onOpenRecords}
      onOpenTemplates={props.onOpenTemplates}
      onOpenAI={props.onOpenAI}
      onExportLatest={props.onExportLatest}
      onCreateInvoice={props.onCreateInvoice}
      onOpenInvoice={props.onOpenInvoice}
      onDuplicateInvoice={props.onDuplicateInvoice}
      onDeleteInvoice={props.onDeleteInvoice}
      onExportInvoice={props.onExportInvoice}
      onUseTemplate={props.onUseTemplate}
      onOpenTemplateDetail={props.onOpenTemplateDetail}
      onLogout={props.onLogout}
      onUpdateUser={props.onUpdateUser}
    />
  );
}

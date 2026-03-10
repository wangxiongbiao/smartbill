"use client";

import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import InvoiceEditorWorkspace from '@/components/app/InvoiceEditorWorkspace';

export default function EditorRoute() {
  const app = useAppShell();

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={4} />;

  return (
    <InvoiceEditorWorkspace
      invoice={app.invoice}
      template={app.template}
      isHeaderReversed={app.isHeaderReversed}
      lang={app.lang}
      userId={app.user?.id}
      isExporting={app.isExporting}
      isAIChatOpen={app.isAIChatOpen}
      isShareDialogOpen={app.isShareDialogOpen}
      isEmailDialogOpen={app.isEmailDialogOpen}
      isSaveTemplateDialogOpen={app.isSaveTemplateDialogOpen}
      isNewInvoiceConfirmOpen={app.isNewInvoiceConfirmOpen}
      isCreatingNewInvoice={false}
      showToast={app.showToast}
      onUpdateInvoice={app.updateInvoice}
      onToggleAIChat={app.toggleAIChat}
      onCloseAIChat={app.closeAIChat}
      onCloseShareDialog={app.closeShareDialog}
      onCloseEmailDialog={app.closeEmailDialog}
      onCloseSaveTemplateDialog={app.closeSaveTemplateDialog}
      onCloseNewInvoiceConfirm={app.closeNewInvoiceConfirm}
      onSaveTemplate={app.saveAsTemplate}
      onConfirmCreateInvoice={app.confirmCreateInvoice}
      onExportPdf={app.exportPdf}
    />
  );
}

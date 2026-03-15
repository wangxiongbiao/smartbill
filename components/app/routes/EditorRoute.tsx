"use client";

import { usePathname } from 'next/navigation';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import InvoiceEditorWorkspace from '@/components/app/InvoiceEditorWorkspace';

function getInvoiceIdFromPath(pathname: string) {
  const match = pathname.match(/^\/invoices\/([^/]+)$/);
  if (!match || match[1] === 'new') return null;
  return decodeURIComponent(match[1]);
}

export default function EditorRoute() {
  const app = useAppShell();
  const pathname = usePathname();
  const invoiceIdFromPath = getInvoiceIdFromPath(pathname);
  const hasRouteInvoiceRecord = invoiceIdFromPath
    ? app.records.some((record) => record.id === invoiceIdFromPath)
    : false;
  const isHydratingExistingInvoice = Boolean(invoiceIdFromPath)
    && app.invoice.id !== invoiceIdFromPath
    && (app.recordsLoading || hasRouteInvoiceRecord);

  if (app.isBootstrapping || !app.user || isHydratingExistingInvoice) {
    return <ContentSkeleton blocks={4} />;
  }

  return (
    <InvoiceEditorWorkspace
      invoice={app.invoice}
      records={app.records}
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
      onBack={() => window.history.length > 1 ? window.history.back() : app.setView('records')}
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

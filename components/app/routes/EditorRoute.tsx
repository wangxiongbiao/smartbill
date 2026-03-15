"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createTemplate, getTemplateById } from '@/lib/api/template';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import InvoiceEditorWorkspace from '@/components/app/InvoiceEditorWorkspace';
import AppShellPrintArea from '@/components/app/AppShellPrintArea';
import { useEditorUiState } from '@/hooks/useEditorUiState';
import { useInvoiceWorkspace } from '@/hooks/useInvoiceWorkspace';
import { useInvoicePdfExport } from '@/hooks/useInvoicePdfExport';
import { useInvoiceRecordsStore } from '@/hooks/useInvoiceRecordsStore';
import { createInvoiceDraft } from '@/lib/invoice-drafts';

function getInvoiceIdFromPath(pathname: string) {
  const match = pathname.match(/^\/invoices\/([^/]+)$/);
  if (!match || match[1] === 'new') return null;
  return decodeURIComponent(match[1]);
}

export default function EditorRoute() {
  const app = useAppShell();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = app.user?.id ?? null;
  const invoiceIdFromPath = getInvoiceIdFromPath(pathname);
  const launchTemplateId = searchParams.get('template');
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const editorUi = useEditorUiState();
  const recordsStore = useInvoiceRecordsStore({ userId });
  const printAreaRef = useRef<HTMLDivElement>(null);
  const bootstrapKeyRef = useRef<string | null>(null);

  const workspace = useInvoiceWorkspace({
    user: app.user,
    defaultSender: {
      name: app.user?.name || '',
      email: app.user?.email || '',
      phone: '',
      address: '',
    },
    records: recordsStore.records,
    setRecords: recordsStore.setRecords,
    activeView: 'editor',
    setActiveView: () => undefined,
    lang: app.lang,
    showToast: app.showToast,
  });

  const pdfExport = useInvoicePdfExport({
    invoice: workspace.invoice,
    template: workspace.template,
    isHeaderReversed: workspace.isHeaderReversed,
    lang: app.lang,
    isExporting: workspace.isExporting,
    setIsExporting: workspace.actions.setIsExporting,
    printAreaRef,
  });

  const existingRecord = useMemo(
    () => (invoiceIdFromPath ? recordsStore.records.find((record) => record.id === invoiceIdFromPath) ?? null : null),
    [invoiceIdFromPath, recordsStore.records]
  );

  useEffect(() => {
    if (!userId) return;
    recordsStore.syncRecordsForUser(userId).catch((error) => {
      console.error('Failed to sync invoice records:', error);
    });
  }, [recordsStore.syncRecordsForUser, userId]);

  useEffect(() => {
    const bootstrapKey = [userId ?? 'guest', pathname, launchTemplateId ?? '', existingRecord?.id ?? ''].join('::');
    if (bootstrapKeyRef.current === bootstrapKey) {
      return;
    }

    let cancelled = false;

    const finish = () => {
      if (!cancelled) {
        setWorkspaceReady(true);
        bootstrapKeyRef.current = bootstrapKey;
      }
    };

    const bootstrapEditor = async () => {
      if (app.isBootstrapping || !app.user) return;

      setWorkspaceReady(false);

      if (invoiceIdFromPath) {
        if (existingRecord) {
          workspace.actions.setInvoice(existingRecord, { skipAutoSave: true });
          finish();
          return;
        }

        if (!recordsStore.recordsLoading) {
          finish();
        }
        return;
      }

      const preset = launchTemplateId
        ? (await getTemplateById(launchTemplateId)).template?.template_data
        : undefined;
      const nextInvoice = createInvoiceDraft({ lang: app.lang, user: app.user, preset });

      workspace.actions.setInvoice(nextInvoice, { skipAutoSave: true });

      if (userId) {
        const { saveInvoiceRecord } = await import('@/lib/api/invoice');
        await saveInvoiceRecord(nextInvoice);
        recordsStore.setRecords((prev) => prev.some((record) => record.id === nextInvoice.id)
          ? prev.map((record) => record.id === nextInvoice.id ? nextInvoice : record)
          : [nextInvoice, ...prev]);
      } else {
        recordsStore.setRecords((prev) => [nextInvoice, ...prev]);
      }

      finish();
      router.replace(`/invoices/${nextInvoice.id}`);
    };

    bootstrapEditor().catch((error) => {
      console.error('Failed to bootstrap editor route:', error);
      finish();
    });

    return () => {
      cancelled = true;
    };
  }, [app.isBootstrapping, app.lang, app.user, existingRecord, invoiceIdFromPath, launchTemplateId, pathname, recordsStore.recordsLoading, recordsStore.setRecords, router, userId, workspace.actions]);

  useEffect(() => {
    workspace.actions.scheduleAutoSave(workspace.invoice);
  }, [workspace.actions, workspace.invoice]);

  useEffect(() => {
    app.setEditorState({
      invoice: workspace.invoice,
      saveStatus: workspace.saveStatus,
      lastSavedTime: workspace.lastSavedTime,
      isExporting: workspace.isExporting,
      onExportPdf: pdfExport.handleExportPdf,
      onSaveTemplate: editorUi.openSaveTemplateDialog,
      onShare: editorUi.openShareDialog,
      onSendEmail: editorUi.openEmailDialog,
      onBack: () => window.history.length > 1 ? window.history.back() : app.setView('records'),
      printArea: (
        <AppShellPrintArea
          invoice={workspace.invoice}
          template={workspace.template}
          isHeaderReversed={workspace.isHeaderReversed}
          lang={app.lang}
          printAreaRef={printAreaRef}
        />
      ),
    });

    return () => {
      app.setEditorState(null);
    };
  }, [app, app.lang, editorUi.openEmailDialog, editorUi.openSaveTemplateDialog, editorUi.openShareDialog, pdfExport.handleExportPdf, workspace.invoice, workspace.isExporting, workspace.isHeaderReversed, workspace.lastSavedTime, workspace.saveStatus, workspace.template]);

  const isHydratingExistingInvoice = useMemo(() => {
    if (!invoiceIdFromPath) return false;
    if (workspace.invoice.id === invoiceIdFromPath) return false;
    return recordsStore.recordsLoading || !!existingRecord;
  }, [existingRecord, invoiceIdFromPath, recordsStore.recordsLoading, workspace.invoice.id]);

  if (app.isBootstrapping || !app.user || !workspaceReady || isHydratingExistingInvoice) {
    return <ContentSkeleton blocks={4} />;
  }

  return (
    <InvoiceEditorWorkspace
      invoice={workspace.invoice}
      records={recordsStore.records}
      template={workspace.template}
      isHeaderReversed={workspace.isHeaderReversed}
      lang={app.lang}
      userId={app.user?.id}
      isExporting={workspace.isExporting}
      isAIChatOpen={editorUi.isAIChatOpen}
      isShareDialogOpen={editorUi.isShareDialogOpen}
      isEmailDialogOpen={editorUi.isEmailDialogOpen}
      isSaveTemplateDialogOpen={editorUi.isSaveTemplateDialogOpen}
      isNewInvoiceConfirmOpen={editorUi.isNewInvoiceConfirmOpen}
      isCreatingNewInvoice={false}
      showToast={app.showToast}
      onUpdateInvoice={workspace.actions.updateInvoice}
      onBack={() => window.history.length > 1 ? window.history.back() : app.setView('records')}
      onToggleAIChat={editorUi.toggleAIChat}
      onCloseAIChat={editorUi.closeAIChat}
      onCloseShareDialog={editorUi.closeShareDialog}
      onCloseEmailDialog={editorUi.closeEmailDialog}
      onCloseSaveTemplateDialog={editorUi.closeSaveTemplateDialog}
      onCloseNewInvoiceConfirm={editorUi.closeNewInvoiceConfirm}
      onSaveTemplate={async (name, description, templateType) => {
        await createTemplate(name, description, templateType, workspace.invoice);
        app.showToast('Template saved successfully!', 'success');
      }}
      onConfirmCreateInvoice={async () => {
        router.push('/invoices/new');
      }}
      onExportPdf={pdfExport.handleExportPdf}
    />
  );
}

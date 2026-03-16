"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { Invoice } from '@/types';

function getInvoiceIdFromPath(pathname: string) {
  const match = pathname.match(/^\/invoices\/([^/]+)$/);
  if (!match || match[1] === 'new') return null;
  return decodeURIComponent(match[1]);
}

export default function EditorRoute() {
  const app = useAppShell();
  const {
    isBootstrapping,
    user,
    lang,
    showToast,
    setEditorState,
    setView,
  } = app;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = user?.id ?? null;
  const invoiceIdFromPath = getInvoiceIdFromPath(pathname);
  const launchTemplateId = searchParams.get('template');
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [recordsHydrated, setRecordsHydrated] = useState(false);
  const editorUi = useEditorUiState();
  const recordsStore = useInvoiceRecordsStore({ userId });
  const printAreaRef = useRef<HTMLDivElement>(null);
  const bootstrapKeyRef = useRef<string | null>(null);
  const bootstrapPendingKeyRef = useRef<string | null>(null);
  const setInvoiceRef = useRef<((nextInvoice: Invoice, options?: { skipAutoSave?: boolean }) => void) | null>(null);
  const noopSetActiveView = useCallback(() => undefined, []);
  const defaultSender = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  }), [user?.email, user?.name]);

  const workspace = useInvoiceWorkspace({
    user,
    defaultSender,
    records: recordsStore.records,
    setRecords: recordsStore.setRecords,
    activeView: 'editor',
    setActiveView: noopSetActiveView,
    lang,
    showToast,
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

  useEffect(() => {
    setInvoiceRef.current = workspace.actions.setInvoice;
  }, [workspace.actions.setInvoice]);

  const existingRecord = useMemo(
    () => (invoiceIdFromPath ? recordsStore.records.find((record) => String(record.id) === invoiceIdFromPath) ?? null : null),
    [invoiceIdFromPath, recordsStore.records]
  );

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setRecordsHydrated(true);
      return;
    }

    setRecordsHydrated(false);
    recordsStore.syncRecordsForUser(userId).catch((error) => {
      console.error('Failed to sync invoice records:', error);
    }).finally(() => {
      if (!cancelled) {
        setRecordsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [recordsStore.syncRecordsForUser, userId]);

  useEffect(() => {
    if (isBootstrapping || !user) return;
    if (invoiceIdFromPath && !recordsHydrated) return;

    const bootstrapKey = [userId ?? 'guest', pathname, launchTemplateId ?? '', existingRecord?.id ?? ''].join('::');
    if (bootstrapKeyRef.current === bootstrapKey || bootstrapPendingKeyRef.current === bootstrapKey) {
      return;
    }

    let cancelled = false;
    bootstrapPendingKeyRef.current = bootstrapKey;

    const finish = () => {
      if (bootstrapPendingKeyRef.current === bootstrapKey) {
        bootstrapPendingKeyRef.current = null;
      }
      if (!cancelled) {
        setWorkspaceReady(true);
        bootstrapKeyRef.current = bootstrapKey;
      }
    };

    const bootstrapEditor = async () => {
      setWorkspaceReady(false);

      if (invoiceIdFromPath) {
        if (existingRecord) {
          setInvoiceRef.current?.(existingRecord, { skipAutoSave: true });
          finish();
          return;
        }

        try {
          const refreshedRecords = await recordsStore.refreshRecords({ force: true });
          const refreshedRecord = refreshedRecords.find((record) => String(record.id) === invoiceIdFromPath);
          if (refreshedRecord) {
            setInvoiceRef.current?.(refreshedRecord, { skipAutoSave: true });
            finish();
            return;
          }
        } catch (error) {
          console.error('Failed to force refresh invoice records:', error);
        }

        showToast('未找到该发票，已返回列表', 'warning');
        finish();
        router.replace('/invoices');
        return;
      }

      const preset = launchTemplateId
        ? (await getTemplateById(launchTemplateId)).template?.template_data
        : undefined;
      const nextInvoice = createInvoiceDraft({ lang, user, preset });

      setInvoiceRef.current?.(nextInvoice, { skipAutoSave: true });

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
      if (bootstrapPendingKeyRef.current === bootstrapKey) {
        bootstrapPendingKeyRef.current = null;
      }
      finish();
    });

    return () => {
      cancelled = true;
    };
  }, [existingRecord, invoiceIdFromPath, isBootstrapping, lang, launchTemplateId, pathname, recordsHydrated, recordsStore.refreshRecords, recordsStore.setRecords, router, showToast, user, userId]);

  useEffect(() => {
    return () => {
      workspace.actions.flushAutoSave().catch(() => undefined);
    };
  }, [workspace.actions.flushAutoSave]);

  const handleBack = useCallback(() => {
    workspace.actions.flushAutoSave().catch(() => undefined);
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    setView('records');
  }, [setView, workspace.actions.flushAutoSave]);

  useEffect(() => {
    setEditorState({
      invoice: workspace.invoice,
      saveStatus: workspace.saveStatus,
      lastSavedTime: workspace.lastSavedTime,
      isExporting: workspace.isExporting,
      onExportPdf: pdfExport.handleExportPdf,
      onSaveTemplate: editorUi.openSaveTemplateDialog,
      onShare: editorUi.openShareDialog,
      onSendEmail: editorUi.openEmailDialog,
      onBack: handleBack,
      printArea: (
        <AppShellPrintArea
          invoice={workspace.invoice}
          template={workspace.template}
          isHeaderReversed={workspace.isHeaderReversed}
          lang={lang}
          printAreaRef={printAreaRef}
        />
      ),
    });

    return () => {
      setEditorState(null);
    };
  }, [editorUi.openEmailDialog, editorUi.openSaveTemplateDialog, editorUi.openShareDialog, handleBack, lang, pdfExport.handleExportPdf, setEditorState, workspace.invoice, workspace.isExporting, workspace.isHeaderReversed, workspace.lastSavedTime, workspace.saveStatus, workspace.template]);

  const isHydratingExistingInvoice = useMemo(() => {
    if (!invoiceIdFromPath) return false;
    if (String(workspace.invoice.id) === invoiceIdFromPath) return false;
    if (!recordsHydrated) return true;
    return !!existingRecord;
  }, [existingRecord, invoiceIdFromPath, recordsHydrated, workspace.invoice.id]);

  if (isBootstrapping || !user || !workspaceReady || isHydratingExistingInvoice) {
    return <ContentSkeleton blocks={4} />;
  }

  return (
    <InvoiceEditorWorkspace
      invoice={workspace.invoice}
      records={recordsStore.records}
      template={workspace.template}
      isHeaderReversed={workspace.isHeaderReversed}
      lang={lang}
      userId={user?.id}
      isExporting={workspace.isExporting}
      isAIChatOpen={editorUi.isAIChatOpen}
      isShareDialogOpen={editorUi.isShareDialogOpen}
      isEmailDialogOpen={editorUi.isEmailDialogOpen}
      isSaveTemplateDialogOpen={editorUi.isSaveTemplateDialogOpen}
      isNewInvoiceConfirmOpen={editorUi.isNewInvoiceConfirmOpen}
      isCreatingNewInvoice={false}
      showToast={showToast}
      onUpdateInvoice={workspace.actions.updateInvoice}
      onBack={handleBack}
      onToggleAIChat={editorUi.toggleAIChat}
      onCloseAIChat={editorUi.closeAIChat}
      onCloseShareDialog={editorUi.closeShareDialog}
      onCloseEmailDialog={editorUi.closeEmailDialog}
      onCloseSaveTemplateDialog={editorUi.closeSaveTemplateDialog}
      onCloseNewInvoiceConfirm={editorUi.closeNewInvoiceConfirm}
      onSaveTemplate={async (name, description, templateType) => {
        await createTemplate(name, description, templateType, workspace.invoice);
        showToast('Template saved successfully!', 'success');
      }}
      onConfirmCreateInvoice={async () => {
        await workspace.actions.flushAutoSave().catch(() => undefined);
        router.push('/invoices/new');
      }}
      onExportPdf={pdfExport.handleExportPdf}
    />
  );
}

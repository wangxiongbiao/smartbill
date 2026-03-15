"use client";

import { useEffect, useRef, useState } from 'react';
import { deleteInvoiceRecord, saveInvoiceRecord } from '@/lib/api/invoice';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import RecordsView from '@/components/RecordsView';
import { useInvoiceRecordsStore } from '@/hooks/useInvoiceRecordsStore';
import { useInvoicePdfExport } from '@/hooks/useInvoicePdfExport';
import AppShellPrintArea from '@/components/app/AppShellPrintArea';
import { duplicateInvoiceDraft, upsertLocalInvoiceRecord } from '@/lib/invoice-drafts';
import { INITIAL_INVOICE } from '@/hooks/useInvoiceWorkspace';

export default function RecordsRoute() {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const recordsStore = useInvoiceRecordsStore({ userId });
  const [exportInvoice, setExportInvoice] = useState(INITIAL_INVOICE);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [recordsViewState, setRecordsViewState] = useState({ searchQuery: '', selectedMonth: 'all' as const, currentPage: 1, scrollTop: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const pdfExport = useInvoicePdfExport({
    invoice: exportInvoice,
    template: exportInvoice.template || 'minimalist',
    isHeaderReversed: exportInvoice.isHeaderReversed ?? true,
    lang: app.lang,
    isExporting,
    setIsExporting,
    printAreaRef,
  });

  useEffect(() => {
    if (!userId) {
      recordsStore.hydrateLocalRecords();
      return;
    }

    recordsStore.syncRecordsForUser(userId).catch((error) => {
      console.error('Failed to sync invoice records:', error);
    });
  }, [recordsStore.hydrateLocalRecords, recordsStore.syncRecordsForUser, userId]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={5} />;
  if (recordsStore.recordsLoading && recordsStore.records.length === 0) return <ContentSkeleton blocks={5} />;

  return (
    <>
      <RecordsView
        records={recordsStore.records}
        viewState={recordsViewState}
        onViewStateChange={setRecordsViewState}
        lang={app.lang}
        isDeletingId={null}
        onEdit={(record) => app.navigateToView('editor', { invoiceId: record.id })}
        onDuplicate={async (record) => {
          const nextInvoice = duplicateInvoiceDraft(record);
          if (userId) {
            await saveInvoiceRecord(nextInvoice);
            recordsStore.setRecords((prev) => [nextInvoice, ...prev.filter((item) => item.id !== nextInvoice.id)]);
          } else {
            upsertLocalInvoiceRecord(nextInvoice);
            recordsStore.setRecords((prev) => [nextInvoice, ...prev.filter((item) => item.id !== nextInvoice.id)]);
          }
          app.navigateToView('editor', { invoiceId: nextInvoice.id });
        }}
        onDelete={async (id) => {
          await deleteInvoiceRecord(id);
          recordsStore.setRecords((prev) => prev.filter((record) => record.id !== id));
        }}
        onUpdateStatus={async (id, status) => {
          const target = recordsStore.records.find((record) => record.id === id);
          if (!target) return;
          const nextInvoice = { ...target, status };
          await saveInvoiceRecord(nextInvoice);
          recordsStore.setRecords((prev) => prev.map((record) => record.id === id ? nextInvoice : record));
        }}
        onExport={(record) => {
          setExportInvoice(record);
          setTimeout(() => pdfExport.handleExportPdf(), 50);
        }}
        onNewDoc={() => app.navigateToView('editor')}
      />
      <AppShellPrintArea
        invoice={exportInvoice}
        template={exportInvoice.template || 'minimalist'}
        isHeaderReversed={exportInvoice.isHeaderReversed ?? true}
        lang={app.lang}
        printAreaRef={printAreaRef}
      />
    </>
  );
}

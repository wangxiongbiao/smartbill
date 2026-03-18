"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import HomeView from '@/components/HomeView';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import { useAppShell } from '@/components/app/AppShellClient';
import AppShellPrintArea from '@/components/app/AppShellPrintArea';
import { useInvoiceRecordsStore } from '@/hooks/useInvoiceRecordsStore';
import { useInvoicePdfExport } from '@/hooks/useInvoicePdfExport';
import { INITIAL_INVOICE } from '@/hooks/useInvoiceWorkspace';

export default function HomeRoute() {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const recordsStore = useInvoiceRecordsStore({ userId });
  const printAreaRef = useRef<HTMLDivElement>(null);
  const startedExportInvoiceIdRef = useRef<string | null>(null);
  const [exportInvoice, setExportInvoice] = useState(INITIAL_INVOICE);
  const [pendingExportInvoiceId, setPendingExportInvoiceId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!userId) {
      recordsStore.hydrateLocalRecords();
      return;
    }

    recordsStore.syncRecordsForUser(userId).catch((error) => {
      console.error('Failed to sync invoice records:', error);
    });
  }, [recordsStore.hydrateLocalRecords, recordsStore.syncRecordsForUser, userId]);

  const pdfExport = useInvoicePdfExport({
    invoice: exportInvoice,
    template: exportInvoice.template || 'minimalist',
    isHeaderReversed: exportInvoice.isHeaderReversed ?? true,
    lang: app.lang,
    isExporting,
    setIsExporting,
    printAreaRef,
  });

  const latestInvoice = useMemo(() => recordsStore.records[0] || null, [recordsStore.records]);

  useEffect(() => {
    if (!pendingExportInvoiceId || exportInvoice.id !== pendingExportInvoiceId || isExporting) return;
    if (startedExportInvoiceIdRef.current === pendingExportInvoiceId) return;

    startedExportInvoiceIdRef.current = pendingExportInvoiceId;

    const runExport = async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      try {
        await pdfExport.handleExportPdf();
      } finally {
        setPendingExportInvoiceId((current) => (current === pendingExportInvoiceId ? null : current));
        if (startedExportInvoiceIdRef.current === pendingExportInvoiceId) {
          startedExportInvoiceIdRef.current = null;
        }
      }
    };

    void runExport();
  }, [exportInvoice.id, isExporting, pdfExport.handleExportPdf, pendingExportInvoiceId]);

  if (app.isBootstrapping) return <ContentSkeleton blocks={4} />;
  if (recordsStore.recordsLoading && recordsStore.records.length === 0) return <ContentSkeleton blocks={4} />;

  return (
    <>
      <HomeView
        records={recordsStore.records}
        lang={app.lang}
        onCreateEmpty={() => app.navigateToView('editor')}
        onOpenRecords={() => app.setView('records')}
        onOpenTemplates={() => app.setView('templates')}
        onOpenAI={() => app.navigateToView('editor')}
        onExportLatest={() => {
          if (!latestInvoice) return;
          setExportInvoice(latestInvoice);
          setPendingExportInvoiceId(latestInvoice.id);
        }}
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

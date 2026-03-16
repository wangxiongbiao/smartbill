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
import { usePaginatedInvoiceRecords } from '@/hooks/usePaginatedInvoiceRecords';
import { RECORDS_PAGE_SIZE } from '@/lib/pagination';
import type { RecordsViewState } from '@/components/app/app-shell.types';

const RECORDS_VIEW_STATE_KEY = 'smartbill-records-view-state';
const PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const;
const DEFAULT_PAGE_SIZE = RECORDS_PAGE_SIZE;

const INITIAL_RECORDS_VIEW_STATE: RecordsViewState = {
  searchQuery: '',
  selectedMonth: 'all',
  currentPage: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  scrollTop: 0,
  shellScrollTop: 0,
};

function parseStoredRecordsViewState(): RecordsViewState {
  if (typeof window === 'undefined') return INITIAL_RECORDS_VIEW_STATE;

  try {
    const raw = window.sessionStorage.getItem(RECORDS_VIEW_STATE_KEY);
    if (!raw) return INITIAL_RECORDS_VIEW_STATE;

    const parsed = JSON.parse(raw);
    return {
      searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : INITIAL_RECORDS_VIEW_STATE.searchQuery,
      selectedMonth:
        parsed.selectedMonth === 'all' || (typeof parsed.selectedMonth === 'number' && parsed.selectedMonth >= 1 && parsed.selectedMonth <= 12)
          ? parsed.selectedMonth
          : INITIAL_RECORDS_VIEW_STATE.selectedMonth,
      currentPage:
        typeof parsed.currentPage === 'number' && parsed.currentPage > 0
          ? parsed.currentPage
          : INITIAL_RECORDS_VIEW_STATE.currentPage,
      pageSize:
        typeof parsed.pageSize === 'number' && PAGE_SIZE_OPTIONS.includes(parsed.pageSize as (typeof PAGE_SIZE_OPTIONS)[number])
          ? parsed.pageSize
          : INITIAL_RECORDS_VIEW_STATE.pageSize,
      scrollTop:
        typeof parsed.scrollTop === 'number' && parsed.scrollTop >= 0
          ? parsed.scrollTop
          : INITIAL_RECORDS_VIEW_STATE.scrollTop,
      shellScrollTop:
        typeof parsed.shellScrollTop === 'number' && parsed.shellScrollTop >= 0
          ? parsed.shellScrollTop
          : INITIAL_RECORDS_VIEW_STATE.shellScrollTop,
    };
  } catch {
    return INITIAL_RECORDS_VIEW_STATE;
  }
}

export default function RecordsRoute() {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const recordsStore = useInvoiceRecordsStore({ userId });
  const guestHydratedRef = useRef(false);
  const shellScrollRafRef = useRef<number | null>(null);
  const shellScrollCommitTimerRef = useRef<number | null>(null);
  const pendingShellScrollTopRef = useRef(0);
  const [recordsViewState, setRecordsViewState] = useState<RecordsViewState>(INITIAL_RECORDS_VIEW_STATE);
  const [isViewStateReady, setIsViewStateReady] = useState(false);
  const paginatedRecords = usePaginatedInvoiceRecords({
    userId: isViewStateReady ? userId : null,
    page: recordsViewState.currentPage,
    pageSize: recordsViewState.pageSize,
    searchQuery: recordsViewState.searchQuery,
    selectedMonth: recordsViewState.selectedMonth,
  });
  const [exportInvoice, setExportInvoice] = useState(INITIAL_INVOICE);
  const printAreaRef = useRef<HTMLDivElement>(null);
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
    setRecordsViewState(parseStoredRecordsViewState());
    setIsViewStateReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isViewStateReady) return;

    try {
      window.sessionStorage.setItem(RECORDS_VIEW_STATE_KEY, JSON.stringify(recordsViewState));
    } catch {}
  }, [isViewStateReady, recordsViewState]);

  useEffect(() => {
    if (!isViewStateReady) return;

    const shellContent = document.querySelector<HTMLElement>('[data-ui-content]');
    if (!shellContent) return;

    const handleScroll = () => {
      pendingShellScrollTopRef.current = shellContent.scrollTop;

      if (shellScrollRafRef.current !== null) return;
      shellScrollRafRef.current = window.requestAnimationFrame(() => {
        shellScrollRafRef.current = null;
        if (shellScrollCommitTimerRef.current !== null) {
          window.clearTimeout(shellScrollCommitTimerRef.current);
        }
        shellScrollCommitTimerRef.current = window.setTimeout(() => {
          shellScrollCommitTimerRef.current = null;
          const nextShellScrollTop = pendingShellScrollTopRef.current;
          setRecordsViewState((prev) => (
            prev.shellScrollTop === nextShellScrollTop
              ? prev
              : { ...prev, shellScrollTop: nextShellScrollTop }
          ));
        }, 120);
      });
    };

    shellContent.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      shellContent.removeEventListener('scroll', handleScroll);
      if (shellScrollRafRef.current !== null) {
        window.cancelAnimationFrame(shellScrollRafRef.current);
        shellScrollRafRef.current = null;
      }
      if (shellScrollCommitTimerRef.current !== null) {
        window.clearTimeout(shellScrollCommitTimerRef.current);
        shellScrollCommitTimerRef.current = null;
      }
    };
  }, [isViewStateReady]);

  useEffect(() => {
    if (!isViewStateReady) return;

    const shellContent = document.querySelector<HTMLElement>('[data-ui-content]');
    if (!shellContent) return;

    requestAnimationFrame(() => {
      if (Math.abs(shellContent.scrollTop - recordsViewState.shellScrollTop) < 1) return;
      shellContent.scrollTop = recordsViewState.shellScrollTop;
    });
  }, [isViewStateReady, recordsViewState.shellScrollTop]);

  const persistRecordsViewState = () => {
    if (typeof window === 'undefined') return;

    const shellContent = document.querySelector<HTMLElement>('[data-ui-content]');
    const nextState: RecordsViewState = {
      ...recordsViewState,
      shellScrollTop: shellContent?.scrollTop ?? recordsViewState.shellScrollTop,
    };

    try {
      window.sessionStorage.setItem(RECORDS_VIEW_STATE_KEY, JSON.stringify(nextState));
    } catch {}
  };

  useEffect(() => {
    if (!isViewStateReady) return;

    if (userId) {
      guestHydratedRef.current = false;
      return;
    }

    if (guestHydratedRef.current) return;
    guestHydratedRef.current = true;
    recordsStore.hydrateLocalRecords();
  }, [isViewStateReady, recordsStore.hydrateLocalRecords, userId]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={5} />;
  if (!isViewStateReady) return <ContentSkeleton blocks={5} />;
  if (userId && (!paginatedRecords.hasLoaded || (paginatedRecords.loading && paginatedRecords.records.length === 0))) return <ContentSkeleton blocks={5} />;
  if (!userId && recordsStore.recordsLoading && recordsStore.records.length === 0) return <ContentSkeleton blocks={5} />;

  return (
    <>
      <RecordsView
        records={userId ? paginatedRecords.records : recordsStore.records}
        totalCount={userId ? paginatedRecords.totalCount : undefined}
        paginationMode={userId ? 'server' : 'client'}
        isPageLoading={!!userId && paginatedRecords.loading && paginatedRecords.records.length > 0}
        viewState={recordsViewState}
        onViewStateChange={setRecordsViewState}
        lang={app.lang}
        isDeletingId={null}
        onEdit={(record) => {
          persistRecordsViewState();
          app.navigateToView('editor', { invoiceId: record.id });
        }}
        onDuplicate={async (record) => {
          persistRecordsViewState();
          const nextInvoice = duplicateInvoiceDraft(record);
          if (userId) {
            await saveInvoiceRecord(nextInvoice);
            paginatedRecords.refresh();
          } else {
            upsertLocalInvoiceRecord(nextInvoice);
            recordsStore.setRecords((prev) => [nextInvoice, ...prev.filter((item) => item.id !== nextInvoice.id)]);
          }
          app.navigateToView('editor', { invoiceId: nextInvoice.id });
        }}
        onDelete={async (id) => {
          await deleteInvoiceRecord(id);
          if (userId) paginatedRecords.refresh();
          else recordsStore.setRecords((prev) => prev.filter((record) => record.id !== id));
        }}
        onDeleteMany={async (ids) => {
          if (ids.length === 0) return;

          const results = await Promise.allSettled(ids.map((id) => deleteInvoiceRecord(id)));
          const successIds = ids.filter((_, index) => results[index].status === 'fulfilled');
          const failedCount = ids.length - successIds.length;

          if (successIds.length > 0) {
            if (userId) {
              paginatedRecords.refresh();
            } else {
              const successIdSet = new Set(successIds);
              recordsStore.setRecords((prev) => prev.filter((record) => !successIdSet.has(record.id)));
            }
          }

          if (failedCount > 0) {
            throw new Error(`Failed to delete ${failedCount} invoice(s).`);
          }
        }}
        onUpdateStatus={async (id, status) => {
          const sourceRecords = userId ? paginatedRecords.records : recordsStore.records;
          const target = sourceRecords.find((record) => record.id === id);
          if (!target) return;
          const nextInvoice = { ...target, status };
          await saveInvoiceRecord(nextInvoice);
          if (userId) {
            paginatedRecords.setRecords((prev) => prev.map((record) => record.id === id ? nextInvoice : record));
          } else {
            recordsStore.setRecords((prev) => prev.map((record) => record.id === id ? nextInvoice : record));
          }
        }}
        onExport={(record) => {
          setExportInvoice(record);
          setTimeout(() => pdfExport.handleExportPdf(), 50);
        }}
        onNewDoc={() => {
          persistRecordsViewState();
          app.navigateToView('editor');
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

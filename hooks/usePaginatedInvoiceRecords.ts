"use client";

import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { listInvoicesPage } from '@/lib/api/invoice';
import type { Invoice } from '@/types';

interface UsePaginatedInvoiceRecordsParams {
  userId?: string | null;
  page: number;
  pageSize: number;
  searchQuery: string;
  selectedMonth: 'all' | number;
}

export function usePaginatedInvoiceRecords(params: UsePaginatedInvoiceRecordsParams) {
  const { userId, page, pageSize, searchQuery, selectedMonth } = params;
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [records, setRecords] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setRecords([]);
      setTotalCount(0);
      setLoading(false);
      setHasLoaded(false);
      return;
    }

    setLoading(true);

    listInvoicesPage(userId, {
      page,
      pageSize,
      search: deferredSearchQuery,
      month: selectedMonth,
    }).then((response) => {
      if (cancelled) return;
      setRecords(response.invoices.map((invoice) => ({
        ...invoice,
        id: String(invoice.id),
      })));
      setTotalCount(response.totalCount);
      setHasLoaded(true);
    }).catch((error) => {
      if (cancelled) return;
      console.error('Failed to load invoice page:', error);
      setRecords([]);
      setTotalCount(0);
      setHasLoaded(true);
    }).finally(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [deferredSearchQuery, page, pageSize, refreshNonce, selectedMonth, userId]);

  const refresh = useCallback(() => {
    setRefreshNonce((value) => value + 1);
  }, []);

  return {
    records,
    setRecords,
    totalCount,
    loading,
    hasLoaded,
    refresh,
  };
}

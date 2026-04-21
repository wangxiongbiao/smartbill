"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { listInvoices } from '@/lib/api/invoice';
import { normalizeInvoiceStatus } from '@/lib/invoice-status';
import type { Invoice } from '@/types';

interface UseInvoiceRecordsStoreParams {
  userId?: string | null;
}

export function useInvoiceRecordsStore({ userId }: UseInvoiceRecordsStoreParams) {
  const [records, setRecords] = useState<Invoice[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const recordsRef = useRef<Invoice[]>([]);
  const lastLoadedUserRef = useRef<string | null>(null);
  const inFlightRefreshRef = useRef<Promise<Invoice[]> | null>(null);

  const normalizeInvoices = useCallback((invoices: Invoice[]) => (
    invoices.map((invoice) => ({
      ...invoice,
      id: String(invoice.id),
      status: normalizeInvoiceStatus(invoice.status),
    }))
  ), []);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    if (!userId) {
      lastLoadedUserRef.current = null;
      inFlightRefreshRef.current = null;
      setRecords([]);
      setRecordsLoading(false);
      return;
    }

    if (lastLoadedUserRef.current && lastLoadedUserRef.current !== userId) {
      lastLoadedUserRef.current = null;
      inFlightRefreshRef.current = null;
      setRecords([]);
      setRecordsLoading(false);
    }
  }, [userId]);

  const refreshRecords = useCallback(async (options?: { force?: boolean }) => {
    if (!userId) return [] as Invoice[];

    if (!options?.force) {
      if (inFlightRefreshRef.current) return inFlightRefreshRef.current;
      if (lastLoadedUserRef.current === userId && recordsRef.current.length > 0) {
        return recordsRef.current;
      }
    }

    const request = (async () => {
      setRecordsLoading(true);
      try {
        const { invoices } = await listInvoices();
        const normalized = normalizeInvoices(invoices);
        setRecords(normalized);
        lastLoadedUserRef.current = userId;
        return normalized;
      } finally {
        setRecordsLoading(false);
        inFlightRefreshRef.current = null;
      }
    })();

    inFlightRefreshRef.current = request;
    return request;
  }, [normalizeInvoices, userId]);

  const resetRecords = useCallback(() => {
    lastLoadedUserRef.current = null;
    inFlightRefreshRef.current = null;
    setRecords([]);
    setRecordsLoading(false);
  }, []);

  return {
    records,
    setRecords,
    recordsLoading,
    refreshRecords,
    resetRecords,
  };
}

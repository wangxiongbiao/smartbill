"use client";

import { useCallback, useEffect, useState } from 'react';
import { batchSaveInvoiceRecords, listInvoices } from '@/lib/api/invoice';
import type { Invoice } from '@/types';

interface UseInvoiceRecordsStoreParams {
  userId?: string | null;
}

export function useInvoiceRecordsStore({ userId }: UseInvoiceRecordsStoreParams) {
  const [records, setRecords] = useState<Invoice[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const hydrateLocalRecords = useCallback(() => {
    const savedRecords = localStorage.getItem('invoice_records_v2');
    if (!savedRecords) return [] as Invoice[];
    try {
      const parsed = JSON.parse(savedRecords);
      setRecords(parsed);
      return parsed;
    } catch {
      console.warn('[InvoiceRecords] Failed to parse local invoice records');
      return [] as Invoice[];
    }
  }, []);

  const refreshRecords = useCallback(async () => {
    if (!userId) return;
    setRecordsLoading(true);
    try {
      const { invoices } = await listInvoices(userId);
      setRecords(invoices);
    } finally {
      setRecordsLoading(false);
    }
  }, [userId]);

  const syncRecordsForUser = useCallback(async (authUserId: string) => {
    setRecordsLoading(true);
    try {
      const { invoices } = await listInvoices(authUserId);

      if (invoices.length > 0) {
        setRecords(invoices);
        return;
      }

      const localRecords = JSON.parse(localStorage.getItem('invoice_records_v2') || '[]');
      if (localRecords.length > 0) {
        try {
          await batchSaveInvoiceRecords(localRecords);
          const refreshed = await listInvoices(authUserId);
          setRecords(refreshed.invoices);
        } catch (error) {
          console.error('[InvoiceRecords] Batch sync failed:', error);
          setRecords(localRecords);
        }
      } else {
        setRecords([]);
      }
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  const resetRecords = useCallback(() => {
    setRecords([]);
    setRecordsLoading(false);
    localStorage.removeItem('invoice_records_v2');
  }, []);

  useEffect(() => {
    localStorage.setItem('invoice_records_v2', JSON.stringify(records));
  }, [records]);

  return {
    records,
    setRecords,
    recordsLoading,
    hydrateLocalRecords,
    refreshRecords,
    syncRecordsForUser,
    resetRecords,
  };
}

"use client";

import { useCallback, useEffect, useState } from 'react';
import { batchSaveInvoiceRecords, listInvoices } from '@/lib/api/invoice';
import { normalizeInvoiceStatus } from '@/lib/invoice-status';
import type { Invoice } from '@/types';

interface UseInvoiceRecordsStoreParams {
  userId?: string | null;
}

export function useInvoiceRecordsStore({ userId }: UseInvoiceRecordsStoreParams) {
  const [records, setRecords] = useState<Invoice[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const normalizeInvoices = useCallback((invoices: Invoice[]) => (
    invoices.map((invoice) => ({ ...invoice, status: normalizeInvoiceStatus(invoice.status) }))
  ), []);

  const hydrateLocalRecords = useCallback(() => {
    const savedRecords = localStorage.getItem('invoice_records_v2');
    if (!savedRecords) return [] as Invoice[];
    try {
      const parsed = JSON.parse(savedRecords);
      const normalized = normalizeInvoices(parsed);
      setRecords(normalized);
      return normalized;
    } catch {
      console.warn('[InvoiceRecords] Failed to parse local invoice records');
      return [] as Invoice[];
    }
  }, [normalizeInvoices]);

  const refreshRecords = useCallback(async () => {
    if (!userId) return;
    setRecordsLoading(true);
    try {
      const { invoices } = await listInvoices(userId);
      setRecords(normalizeInvoices(invoices));
    } finally {
      setRecordsLoading(false);
    }
  }, [normalizeInvoices, userId]);

  const syncRecordsForUser = useCallback(async (authUserId: string) => {
    setRecordsLoading(true);
    try {
      const { invoices } = await listInvoices(authUserId);
      const normalizedInvoices = normalizeInvoices(invoices);

      if (normalizedInvoices.length > 0) {
        setRecords(normalizedInvoices);
        return;
      }

      const localRecords = normalizeInvoices(JSON.parse(localStorage.getItem('invoice_records_v2') || '[]'));
      if (localRecords.length > 0) {
        try {
          await batchSaveInvoiceRecords(localRecords);
          const refreshed = await listInvoices(authUserId);
          setRecords(normalizeInvoices(refreshed.invoices));
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
  }, [normalizeInvoices]);

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

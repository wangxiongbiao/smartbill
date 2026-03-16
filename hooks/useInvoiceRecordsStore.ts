"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { batchSaveInvoiceRecords, listInvoices } from '@/lib/api/invoice';
import { normalizeInvoiceStatus } from '@/lib/invoice-status';
import type { Invoice } from '@/types';

interface UseInvoiceRecordsStoreParams {
  userId?: string | null;
}

const LOCAL_STORAGE_KEY = 'invoice_records_v2';

export function useInvoiceRecordsStore({ userId }: UseInvoiceRecordsStoreParams) {
  const [records, setRecords] = useState<Invoice[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const lastLoadedUserRef = useRef<string | null>(null);
  const inFlightRefreshRef = useRef<Promise<Invoice[]> | null>(null);
  const inFlightSyncRef = useRef<Promise<void> | null>(null);

  const normalizeInvoices = useCallback((invoices: Invoice[]) => (
    invoices.map((invoice) => ({ ...invoice, status: normalizeInvoiceStatus(invoice.status) }))
  ), []);

  const writeLocalRecords = useCallback((nextRecords: Invoice[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextRecords));
    } catch (error) {
      console.warn('[InvoiceRecords] Failed to persist local invoice records:', error);
    }
  }, []);

  const clearLocalRecords = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.warn('[InvoiceRecords] Failed to clear local invoice records:', error);
    }
  }, []);

  const readLocalRecords = useCallback(() => {
    try {
      const savedRecords = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!savedRecords) return [] as Invoice[];

      const parsed = JSON.parse(savedRecords);
      return normalizeInvoices(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.warn('[InvoiceRecords] Failed to read local invoice records:', error);
      return [] as Invoice[];
    }
  }, [normalizeInvoices]);

  const hydrateLocalRecords = useCallback(() => {
    const normalized = readLocalRecords();
    setRecords(normalized);
    return normalized;
  }, [readLocalRecords]);

  const refreshRecords = useCallback(async (options?: { force?: boolean }) => {
    if (!userId) return [] as Invoice[];

    if (!options?.force) {
      if (inFlightRefreshRef.current) return inFlightRefreshRef.current;
      if (lastLoadedUserRef.current === userId && records.length > 0) {
        return records;
      }
    }

    const request = (async () => {
      setRecordsLoading(true);
      try {
        const { invoices } = await listInvoices(userId);
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
  }, [normalizeInvoices, records, userId]);

  const syncRecordsForUser = useCallback(async (authUserId: string, options?: { force?: boolean }) => {
    if (!options?.force && lastLoadedUserRef.current === authUserId && records.length > 0) {
      return;
    }

    if (inFlightSyncRef.current) return inFlightSyncRef.current;

    const request = (async () => {
      setRecordsLoading(true);
      try {
        const { invoices } = await listInvoices(authUserId);
        const normalizedInvoices = normalizeInvoices(invoices);

        if (normalizedInvoices.length > 0) {
          setRecords(normalizedInvoices);
          lastLoadedUserRef.current = authUserId;
          return;
        }

        const localRecords = readLocalRecords();
        if (localRecords.length > 0) {
          try {
            await batchSaveInvoiceRecords(localRecords);
            const refreshedInvoices = await refreshRecords({ force: true });
            if (refreshedInvoices.length === 0) {
              setRecords(localRecords);
              lastLoadedUserRef.current = authUserId;
            }
          } catch (error) {
            console.error('[InvoiceRecords] Batch sync failed:', error);
            setRecords(localRecords);
            lastLoadedUserRef.current = authUserId;
          }
        } else {
          setRecords([]);
          lastLoadedUserRef.current = authUserId;
        }
      } finally {
        setRecordsLoading(false);
        inFlightSyncRef.current = null;
      }
    })();

    inFlightSyncRef.current = request;
    return request;
  }, [normalizeInvoices, readLocalRecords, records.length, refreshRecords]);

  const resetRecords = useCallback(() => {
    lastLoadedUserRef.current = null;
    inFlightRefreshRef.current = null;
    inFlightSyncRef.current = null;
    setRecords([]);
    setRecordsLoading(false);
    clearLocalRecords();
  }, [clearLocalRecords]);

  useEffect(() => {
    writeLocalRecords(records);
  }, [records, writeLocalRecords]);

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

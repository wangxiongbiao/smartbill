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

  const readLocalRecords = useCallback(() => {
    const savedRecords = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedRecords) return [] as Invoice[];

    try {
      const parsed = JSON.parse(savedRecords);
      return normalizeInvoices(Array.isArray(parsed) ? parsed : []);
    } catch {
      console.warn('[InvoiceRecords] Failed to parse local invoice records');
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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
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

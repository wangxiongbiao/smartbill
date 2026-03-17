"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deleteSchoolPosterRecord, listSchoolPosters, saveSchoolPosterRecord } from '@/lib/api/school-poster';
import { cloneSchoolPoster, createDefaultSchoolPoster, normalizeSchoolPoster } from '@/lib/school-posters';
import type { SchoolPoster } from '@/types';

interface UseSchoolPostersParams {
  userId?: string | null;
}

function sortByUpdatedAt(records: SchoolPoster[]) {
  return [...records].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function useSchoolPosters({ userId }: UseSchoolPostersParams) {
  const [records, setRecords] = useState<SchoolPoster[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const recordsRef = useRef<SchoolPoster[]>([]);
  const lastLoadedUserRef = useRef<string | null>(null);
  const inFlightRefreshRef = useRef<Promise<SchoolPoster[]> | null>(null);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  const commitRecords = useCallback((nextRecords: SchoolPoster[]) => {
    const sorted = sortByUpdatedAt(nextRecords.map(normalizeSchoolPoster));
    setRecords(sorted);
    return sorted;
  }, []);

  const refreshRecords = useCallback(async (options?: { force?: boolean }) => {
    if (!userId) {
      setRecords([]);
      setIsHydrated(true);
      return [] as SchoolPoster[];
    }

    if (!options?.force) {
      if (inFlightRefreshRef.current) return inFlightRefreshRef.current;
      if (lastLoadedUserRef.current === userId && recordsRef.current.length > 0) {
        return recordsRef.current;
      }
    }

    const request = (async () => {
      setRecordsLoading(true);
      try {
        const { posters } = await listSchoolPosters(userId);
        const normalized = commitRecords(posters);
        lastLoadedUserRef.current = userId;
        setIsHydrated(true);
        return normalized;
      } finally {
        setRecordsLoading(false);
        inFlightRefreshRef.current = null;
      }
    })();

    inFlightRefreshRef.current = request;
    return request;
  }, [commitRecords, userId]);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setRecords([]);
      setRecordsLoading(false);
      setIsHydrated(true);
      lastLoadedUserRef.current = null;
      inFlightRefreshRef.current = null;
      return;
    }

    setIsHydrated(false);
    refreshRecords({ force: true }).catch((error) => {
      console.error('[SchoolPosters] Failed to load records:', error);
      if (!cancelled) {
        setRecords([]);
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [refreshRecords, userId]);

  const createPoster = useCallback(async () => {
    const next = createDefaultSchoolPoster();
    const { poster } = await saveSchoolPosterRecord(next);
    commitRecords([poster, ...recordsRef.current]);
    return poster;
  }, [commitRecords]);

  const savePoster = useCallback(async (record: SchoolPoster) => {
    const updated = normalizeSchoolPoster({ ...record, updatedAt: new Date().toISOString() });
    const { poster } = await saveSchoolPosterRecord(updated);
    const exists = recordsRef.current.some((item) => item.id === poster.id);
    const next = exists
      ? recordsRef.current.map((item) => (item.id === poster.id ? poster : item))
      : [poster, ...recordsRef.current];
    commitRecords(next);
    return poster;
  }, [commitRecords]);

  const deletePoster = useCallback(async (id: string) => {
    await deleteSchoolPosterRecord(id);
    commitRecords(recordsRef.current.filter((item) => item.id !== id));
  }, [commitRecords]);

  const duplicatePoster = useCallback(async (record: SchoolPoster) => {
    const duplicate = cloneSchoolPoster(record);
    const { poster } = await saveSchoolPosterRecord(duplicate);
    commitRecords([poster, ...recordsRef.current]);
    return poster;
  }, [commitRecords]);

  const getPoster = useCallback((id: string) => records.find((item) => item.id === id) || null, [records]);

  const hydratedRecords = useMemo(() => sortByUpdatedAt(records), [records]);

  return {
    records: hydratedRecords,
    setRecords,
    recordsLoading,
    isHydrated,
    refreshRecords,
    createPoster,
    savePoster,
    deletePoster,
    duplicatePoster,
    getPoster,
  };
}

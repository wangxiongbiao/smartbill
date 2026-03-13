"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cloneSchoolPoster, createDefaultSchoolPoster, getSchoolPosterStorageKey, normalizeSchoolPoster, readSchoolPosters, writeSchoolPosters } from '@/lib/school-posters';
import type { SchoolPoster } from '@/types';

interface UseSchoolPostersParams {
  userId?: string | null;
}

function sortByUpdatedAt(records: SchoolPoster[]) {
  return [...records].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function useSchoolPosters({ userId }: UseSchoolPostersParams) {
  const storageKey = useMemo(() => getSchoolPosterStorageKey(userId), [userId]);
  const [records, setRecords] = useState<SchoolPoster[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const commitRecords = useCallback((nextRecords: SchoolPoster[]) => {
    const sorted = sortByUpdatedAt(nextRecords.map(normalizeSchoolPoster));
    setRecords(sorted);
    writeSchoolPosters(storageKey, sorted);
    return sorted;
  }, [storageKey]);

  useEffect(() => {
    setRecords(sortByUpdatedAt(readSchoolPosters(storageKey)));
    setIsHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    writeSchoolPosters(storageKey, sortByUpdatedAt(records));
  }, [isHydrated, records, storageKey]);

  const createPoster = useCallback(() => {
    const next = createDefaultSchoolPoster();
    commitRecords([next, ...records]);
    return next;
  }, [commitRecords, records]);

  const savePoster = useCallback((record: SchoolPoster) => {
    const updated = normalizeSchoolPoster({ ...record, updatedAt: new Date().toISOString() });
    const exists = records.some((item) => item.id === updated.id);
    const next = exists
      ? records.map((item) => (item.id === updated.id ? updated : item))
      : [updated, ...records];
    commitRecords(next);
    return updated;
  }, [commitRecords, records]);

  const deletePoster = useCallback((id: string) => {
    commitRecords(records.filter((item) => item.id !== id));
  }, [commitRecords, records]);

  const duplicatePoster = useCallback((record: SchoolPoster) => {
    const duplicate = cloneSchoolPoster(record);
    commitRecords([duplicate, ...records]);
    return duplicate;
  }, [commitRecords, records]);

  const getPoster = useCallback((id: string) => records.find((item) => item.id === id) || null, [records]);

  return {
    records,
    isHydrated,
    createPoster,
    savePoster,
    deletePoster,
    duplicatePoster,
    getPoster,
  };
}

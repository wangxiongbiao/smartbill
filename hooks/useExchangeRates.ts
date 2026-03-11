'use client';

import { useEffect, useMemo, useState } from 'react';
import { getExchangeRates } from '@/lib/api/exchange-rates';
import type { ExchangeRatesSnapshot } from '@/lib/exchange-rates';

const snapshotCache = new Map<string, ExchangeRatesSnapshot>();
const requestCache = new Map<string, Promise<ExchangeRatesSnapshot>>();

export function useExchangeRates({
  baseCurrency,
  symbols,
  enabled,
}: {
  baseCurrency: string;
  symbols: string[];
  enabled: boolean;
}) {
  const normalizedSymbols = useMemo(
    () => Array.from(new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))).sort(),
    [symbols]
  );
  const cacheKey = useMemo(
    () => `${baseCurrency.trim().toUpperCase()}:${normalizedSymbols.join(',')}`,
    [baseCurrency, normalizedSymbols]
  );

  const [snapshot, setSnapshot] = useState<ExchangeRatesSnapshot | null>(snapshotCache.get(cacheKey) || null);
  const [loading, setLoading] = useState(enabled && !snapshot);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSnapshot(null);
      setLoading(false);
      setError(null);
      return;
    }

    const cachedSnapshot = snapshotCache.get(cacheKey);
    setSnapshot(cachedSnapshot || null);
    if (cachedSnapshot) {
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const pendingRequest = requestCache.get(cacheKey) || getExchangeRates(baseCurrency, normalizedSymbols);
    requestCache.set(cacheKey, pendingRequest);

    pendingRequest
      .then((nextSnapshot) => {
        snapshotCache.set(cacheKey, nextSnapshot);
        if (cancelled) return;
        setSnapshot(nextSnapshot);
        setLoading(false);
      })
      .catch((nextError: Error) => {
        if (cancelled) return;
        setLoading(false);
        setError(nextError.message || 'Failed to load exchange rates');
      })
      .finally(() => {
        requestCache.delete(cacheKey);
      });

    return () => {
      cancelled = true;
    };
  }, [baseCurrency, cacheKey, enabled, normalizedSymbols]);

  return {
    snapshot,
    loading,
    error,
  };
}

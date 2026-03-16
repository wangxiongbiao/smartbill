"use client";

import { useEffect, useState } from 'react';
import { getTemplatesCount } from '@/lib/api/template';

export function useTemplateCount(userId?: string | null) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    getTemplatesCount(userId).then((response) => {
      if (cancelled) return;
      setCount(response.totalCount);
    }).catch((error) => {
      if (cancelled) return;
      console.error('Failed to load template count:', error);
      setCount(0);
    }).finally(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    count,
    loading,
  };
}

"use client";

import { useCallback, useEffect, useState } from 'react';
import { listTemplatesPage } from '@/lib/api/template';
import type { InvoiceTemplate, TemplateCategory } from '@/types';

interface UsePaginatedTemplatesParams {
  userId?: string | null;
  page: number;
  pageSize: number;
  templateType: TemplateCategory;
}

export function usePaginatedTemplates(params: UsePaginatedTemplatesParams) {
  const { userId, page, pageSize, templateType } = params;
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [overallCount, setOverallCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setTemplates([]);
      setTotalCount(0);
      setOverallCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    listTemplatesPage({
      page,
      pageSize,
      templateType,
    }).then((response) => {
      if (cancelled) return;
      setTemplates(response.templates);
      setTotalCount(response.totalCount);
      setOverallCount(response.overallCount ?? response.totalCount);
    }).catch((error) => {
      if (cancelled) return;
      console.error('Failed to load template page:', error);
      setTemplates([]);
      setTotalCount(0);
      setOverallCount(0);
    }).finally(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, refreshNonce, templateType, userId]);

  const refresh = useCallback(() => {
    setRefreshNonce((value) => value + 1);
  }, []);

  return {
    templates,
    setTemplates,
    totalCount,
    overallCount,
    loading,
    refresh,
  };
}

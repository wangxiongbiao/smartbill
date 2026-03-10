"use client";

import { useCallback, useMemo, useState } from 'react';
import { bumpTemplateUsage, getTemplateById, listTemplates, removeTemplate } from '@/lib/api/template';
import type { InvoiceTemplate } from '@/types';

interface UseTemplateStoreParams {
  userId?: string | null;
  pathname: string;
  onDeletedCurrent?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useTemplateStore(params: UseTemplateStoreParams) {
  const { userId, pathname, onDeletedCurrent, showToast } = params;
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [templateMap, setTemplateMap] = useState<Record<string, InvoiceTemplate>>({});
  const [templateDetailLoading, setTemplateDetailLoading] = useState(false);

  const refreshTemplates = useCallback(async () => {
    if (!userId) return;
    setTemplatesLoading(true);
    try {
      const data = await listTemplates(userId);
      setTemplates(data.templates);
      setTemplateMap(prev => {
        const next = { ...prev };
        for (const item of data.templates) next[item.id] = item;
        return next;
      });
      setTemplatesLoaded(true);
    } finally {
      setTemplatesLoading(false);
    }
  }, [userId]);

  const ensureTemplatesLoaded = useCallback(async () => {
    if (!userId || templatesLoaded || templatesLoading) return;
    await refreshTemplates();
  }, [refreshTemplates, templatesLoaded, templatesLoading, userId]);

  const ensureTemplateLoaded = useCallback(async (id: string) => {
    if (!userId) return null;
    if (templateMap[id]) return templateMap[id];

    setTemplateDetailLoading(true);
    try {
      const data = await getTemplateById(id);
      if (data.template) {
        setTemplateMap(prev => ({ ...prev, [id]: data.template! }));
        setTemplates(prev => prev.some(item => item.id === id) ? prev : [data.template!, ...prev]);
      }
      return data.template;
    } finally {
      setTemplateDetailLoading(false);
    }
  }, [templateMap, userId]);

  const getTemplateFromCache = useCallback((id: string) => {
    return templateMap[id] || templates.find(item => item.id === id) || null;
  }, [templateMap, templates]);

  const openTemplateDetailCache = useCallback((templateRecord: InvoiceTemplate) => {
    setTemplateMap(prev => ({ ...prev, [templateRecord.id]: templateRecord }));
  }, []);

  const deleteTemplateById = useCallback(async (id: string) => {
    await removeTemplate(id);
    setTemplateMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setTemplates(prev => prev.filter(item => item.id !== id));
    showToast?.('Template deleted', 'success');
    if (pathname === `/templates/${id}`) {
      onDeletedCurrent?.();
    }
  }, [onDeletedCurrent, pathname, showToast]);

  const bumpTemplateUsageAndRefresh = useCallback(async (id: string) => {
    await bumpTemplateUsage(id);
    await refreshTemplates();
  }, [refreshTemplates]);

  const resetTemplates = useCallback(() => {
    setTemplates([]);
    setTemplateMap({});
    setTemplatesLoaded(false);
    setTemplatesLoading(false);
    setTemplateDetailLoading(false);
  }, []);

  return useMemo(() => ({
    templates,
    templatesLoading,
    templateDetailLoading,
    refreshTemplates,
    ensureTemplatesLoaded,
    getTemplateFromCache,
    ensureTemplateLoaded,
    deleteTemplateById,
    bumpTemplateUsageAndRefresh,
    openTemplateDetailCache,
    resetTemplates,
  }), [
    bumpTemplateUsageAndRefresh,
    deleteTemplateById,
    ensureTemplateLoaded,
    ensureTemplatesLoaded,
    getTemplateFromCache,
    openTemplateDetailCache,
    refreshTemplates,
    resetTemplates,
    templateDetailLoading,
    templates,
    templatesLoading,
  ]);
}

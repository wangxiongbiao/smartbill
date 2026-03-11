"use client";

import { useCallback } from 'react';
import { bumpTemplateUsage, createTemplate } from '@/lib/api/template';
import { translations } from '@/i18n';
import type { Invoice, InvoiceTemplate, Language, ViewType } from '@/types';

interface UseAppActionsParams {
  userId?: string | null;
  lang: Language;
  records: Invoice[];
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  navigateToView: (view: ViewType, options?: { templateId?: string; invoiceId?: string }) => void;
  refreshTemplates: () => Promise<void>;
  resetTemplates: () => void;
  resetRecords: () => void;
  logoutCore: (onAfter?: () => void) => Promise<void>;
  afterLogout: () => void;
  openTemplateDetailCache: (template: InvoiceTemplate) => void;
  workspace: {
    invoice: Invoice;
    actions: {
      setInvoice: (invoice: Invoice) => void;
      setTemplate: (template: Invoice['template']) => void;
      setIsHeaderReversed: (value: boolean) => void;
      createInvoice: () => Promise<Invoice>;
      duplicateInvoice: (record: Invoice) => Promise<Invoice>;
      useTemplate: (template: InvoiceTemplate) => Promise<Invoice>;
      saveCurrentInvoice: () => Promise<void>;
      removeInvoice: (id: string) => Promise<void>;
      updateInvoice: (updates: Partial<Invoice>) => void;
    };
  };
  exportPdfNow: () => void;
}

export function useAppActions(params: UseAppActionsParams) {
  const {
    userId,
    lang,
    records,
    showToast,
    navigateToView,
    refreshTemplates,
    resetTemplates,
    resetRecords,
    logoutCore,
    afterLogout,
    openTemplateDetailCache,
    workspace,
    exportPdfNow,
  } = params;

  const openInvoice = useCallback((record: Invoice) => {
    workspace.actions.setInvoice(record);
    if (record.template) workspace.actions.setTemplate(record.template);
    workspace.actions.setIsHeaderReversed(record.isHeaderReversed ?? true);
    navigateToView('editor', { invoiceId: record.id });
  }, [navigateToView, workspace.actions]);

  const createInvoice = useCallback(async () => {
    const nextInvoice = await workspace.actions.createInvoice();
    navigateToView('editor', { invoiceId: nextInvoice.id });
  }, [navigateToView, workspace.actions]);

  const duplicateInvoice = useCallback(async (record: Invoice) => {
    const nextInvoice = await workspace.actions.duplicateInvoice(record);
    navigateToView('editor', { invoiceId: nextInvoice.id });
  }, [navigateToView, workspace.actions]);

  const useTemplateAndCreateInvoice = useCallback(async (templateRecord: InvoiceTemplate) => {
    const nextInvoice = await workspace.actions.useTemplate(templateRecord);
    navigateToView('editor', { invoiceId: nextInvoice.id });

    void bumpTemplateUsage(templateRecord.id)
      .then(() => refreshTemplates())
      .catch((error) => {
        console.error('Failed to bump template usage:', error);
      });
  }, [navigateToView, refreshTemplates, workspace.actions]);

  const openTemplateDetail = useCallback((templateRecord: InvoiceTemplate) => {
    openTemplateDetailCache(templateRecord);
    navigateToView('template-detail', { templateId: templateRecord.id });
  }, [navigateToView, openTemplateDetailCache]);

  const closeTemplateDetail = useCallback(() => {
    navigateToView('templates');
  }, [navigateToView]);

  const saveAsTemplate = useCallback(async (name: string, description: string) => {
    if (!userId) {
      showToast('Please login to save templates', 'warning');
      return;
    }

    await createTemplate(name, description, workspace.invoice);
    await refreshTemplates();
    showToast(translations[lang].templateSaved || 'Template saved successfully!', 'success');
  }, [lang, refreshTemplates, showToast, userId, workspace.invoice]);

  const confirmCreateInvoice = useCallback(async () => {
    try {
      if (userId && workspace.invoice.id) await workspace.actions.saveCurrentInvoice();
      const nextInvoice = await workspace.actions.createInvoice();
      navigateToView('editor', { invoiceId: nextInvoice.id });
      showToast(translations[lang].newInvoiceCreated || '新发票创建成功！', 'success');
    } catch (error) {
      console.error(error);
      showToast(translations[lang].createInvoiceFailed || '创建发票失败，请重试', 'error');
    }
  }, [lang, navigateToView, showToast, userId, workspace.actions, workspace.invoice.id]);

  const exportInvoice = useCallback((record: Invoice) => {
    workspace.actions.setInvoice(record);
    setTimeout(exportPdfNow, 200);
  }, [exportPdfNow, workspace.actions]);

  const exportLatest = useCallback(() => {
    if (!records[0]) return;
    workspace.actions.setInvoice(records[0]);
    setTimeout(exportPdfNow, 200);
  }, [exportPdfNow, records, workspace.actions]);

  const logout = useCallback(async () => {
    resetTemplates();
    resetRecords();
    await logoutCore(afterLogout);
  }, [afterLogout, logoutCore, resetRecords, resetTemplates]);

  return {
    openInvoice,
    createInvoice,
    duplicateInvoice,
    useTemplateAndCreateInvoice,
    openTemplateDetail,
    closeTemplateDetail,
    saveAsTemplate,
    confirmCreateInvoice,
    exportInvoice,
    exportLatest,
    logout,
    deleteInvoice: workspace.actions.removeInvoice,
    updateInvoice: workspace.actions.updateInvoice,
  };
}

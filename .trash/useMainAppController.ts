"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTE_BY_VIEW } from '@/lib/routes';
import type { Invoice, InvoiceTemplate, ViewType } from '@/types';

interface UseMainAppControllerParams {
  initialView: ViewType;
  templateId: string | null;
  invoiceId: string | null;
  autoCreateInvoice: boolean;
  auth: {
    isInitialized: boolean;
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
    records: Invoice[];
    user: { id: string } | null;
  };
  workspace: {
    invoice: Invoice;
    actions: {
      setInvoice: (invoice: Invoice) => void;
      setTemplate: (template: Invoice['template']) => void;
      setIsHeaderReversed: (value: boolean) => void;
      setIsExporting: (value: boolean) => void;
      createInvoice: () => Promise<Invoice>;
      duplicateInvoice: (record: Invoice) => Promise<Invoice>;
      useTemplate: (template: InvoiceTemplate) => Promise<Invoice>;
      saveCurrentInvoice: () => Promise<void>;
    };
  };
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  createInvoiceFailedText: string;
  newInvoiceCreatedText: string;
}

export function useMainAppController(params: UseMainAppControllerParams) {
  const {
    initialView,
    templateId,
    invoiceId,
    autoCreateInvoice,
    auth,
    workspace,
    showToast,
    createInvoiceFailedText,
    newInvoiceCreatedText,
  } = params;

  const router = useRouter();
  const [prevView, setPrevView] = useState<ViewType>('records');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(templateId);
  const [isCreatingNewInvoice, setIsCreatingNewInvoice] = useState(false);

  useEffect(() => {
    auth.setActiveView(templateId ? 'template-detail' : initialView);
  }, [auth, initialView, templateId]);

  useEffect(() => {
    setActiveTemplateId(templateId);
  }, [templateId]);

  useEffect(() => {
    if (!invoiceId || auth.records.length === 0) return;
    const targetInvoice = auth.records.find((record) => record.id === invoiceId);
    if (!targetInvoice) return;

    workspace.actions.setInvoice(targetInvoice);
    if (targetInvoice.template) workspace.actions.setTemplate(targetInvoice.template);
    workspace.actions.setIsHeaderReversed(targetInvoice.isHeaderReversed ?? true);
    auth.setActiveView('editor');
  }, [invoiceId, auth, workspace.actions]);

  useEffect(() => {
    if (!autoCreateInvoice || initialView !== 'editor' || invoiceId) return;
    if (!auth.isInitialized || auth.activeView !== 'editor') return;
    if (workspace.invoice.id) return;

    workspace.actions.createInvoice()
      .then((nextInvoice) => {
        router.replace(`/invoices/${nextInvoice.id}`);
      })
      .catch((error) => {
        console.error('Failed to create invoice from route:', error);
      });
  }, [autoCreateInvoice, initialView, invoiceId, auth.isInitialized, auth.activeView, workspace.invoice.id, workspace.actions, router]);

  const navigateToView = useCallback((view: ViewType, options?: { templateId?: string; invoiceId?: string }) => {
    const targetPath = options?.templateId
      ? `/templates/${options.templateId}`
      : options?.invoiceId
        ? `/invoices/${options.invoiceId}`
        : ROUTE_BY_VIEW[view];

    if (!targetPath) return;
    router.push(targetPath);
  }, [router]);

  const setView = useCallback((view: ViewType) => {
    setPrevView(auth.activeView);
    auth.setActiveView(view);
    if (view === 'template-detail' && activeTemplateId) {
      navigateToView(view, { templateId: activeTemplateId });
      return;
    }
    navigateToView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTemplateId, auth, navigateToView]);

  const editorActions = useMemo(() => ({
    openInvoice: (record: Invoice) => {
      workspace.actions.setInvoice(record);
      if (record.template) workspace.actions.setTemplate(record.template);
      workspace.actions.setIsHeaderReversed(record.isHeaderReversed ?? true);
      auth.setActiveView('editor');
      navigateToView('editor', { invoiceId: record.id });
    },
    createInvoice: async () => {
      const nextInvoice = await workspace.actions.createInvoice();
      navigateToView('editor', { invoiceId: nextInvoice.id });
    },
    duplicateInvoice: async (record: Invoice) => {
      const nextInvoice = await workspace.actions.duplicateInvoice(record);
      navigateToView('editor', { invoiceId: nextInvoice.id });
    },
    useTemplate: async (template: InvoiceTemplate) => {
      const nextInvoice = await workspace.actions.useTemplate(template);
      navigateToView('editor', { invoiceId: nextInvoice.id });
    },
    openTemplateDetail: (template: InvoiceTemplate) => {
      setActiveTemplateId(template.id);
      auth.setActiveView('template-detail');
      navigateToView('template-detail', { templateId: template.id });
    },
    closeTemplateDetail: () => {
      setActiveTemplateId(null);
      auth.setActiveView('templates');
      navigateToView('templates');
    },
    confirmCreateInvoice: async () => {
      setIsCreatingNewInvoice(true);
      try {
        if (auth.user?.id && workspace.invoice.id) await workspace.actions.saveCurrentInvoice();
        const nextInvoice = await workspace.actions.createInvoice();
        navigateToView('editor', { invoiceId: nextInvoice.id });
        showToast(newInvoiceCreatedText, 'success');
      } catch (error) {
        console.error(error);
        showToast(createInvoiceFailedText, 'error');
      } finally {
        setIsCreatingNewInvoice(false);
      }
    }
  }), [auth, createInvoiceFailedText, navigateToView, newInvoiceCreatedText, showToast, workspace.actions, workspace.invoice.id]);

  return {
    prevView,
    activeTemplateId,
    isCreatingNewInvoice,
    setView,
    navigateToView,
    editorActions,
  };
}

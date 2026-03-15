'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { translations } from '@/i18n';
import { deleteInvoiceRecord, saveInvoiceRecord } from '@/lib/api/invoice';
import { createTemplate } from '@/lib/api/template';
import { getDefaultCurrencyForLanguage } from '@/lib/language';
import type { Invoice, InvoiceTemplate, Language, TemplateCategory, TemplateType, User, ViewType } from '@/types';

export const INITIAL_INVOICE: Invoice = {
  id: '',
  type: 'invoice',
  invoiceNumber: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  sender: {
    name: '',
    email: '',
    address: '',
    disclaimerText: 'This is a computer generated document and no signature is required.\n此为电脑生成文件，无需签名。'
  },
  client: { name: '', email: '', address: '' },
  items: [{ id: 'item-1', description: 'Example Service Item', quantity: 1, rate: 0 }],
  taxRate: 0,
  currency: 'CNY',
  notes: '感谢您的支持！',
  status: 'Pending',
  visibility: { date: true, dueDate: false }
};

function applyWorkspacePresentation(targetInvoice: Invoice, nextTemplate: TemplateType, nextIsHeaderReversed: boolean) {
  if (targetInvoice.template === nextTemplate && targetInvoice.isHeaderReversed === nextIsHeaderReversed) {
    return targetInvoice;
  }

  return {
    ...targetInvoice,
    template: nextTemplate,
    isHeaderReversed: nextIsHeaderReversed,
  };
}

export function useInvoiceWorkspace(params: {
  user: User | null;
  defaultSender: Pick<Invoice['sender'], 'name' | 'email' | 'phone' | 'address'>;
  records: Invoice[];
  setRecords: React.Dispatch<React.SetStateAction<Invoice[]>>;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  lang: Language;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}) {
  const { user, defaultSender, records, setRecords, activeView, setActiveView, lang, showToast } = params;
  const [invoice, setInvoiceState] = useState<Invoice>(INITIAL_INVOICE);
  const [template, setTemplateState] = useState<TemplateType>('minimalist');
  const [isHeaderReversed, setIsHeaderReversedState] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waitForFirstEditRef = useRef(false);
  const skipNextAutoSaveRef = useRef(false);

  const upsertRecordLocally = useCallback((targetInvoice: Invoice) => {
    setRecords(prev => {
      const exists = prev.some(record => record.id === targetInvoice.id);
      if (exists) return prev.map(record => record.id === targetInvoice.id ? targetInvoice : record);
      return [targetInvoice, ...prev];
    });
  }, [setRecords]);

  const setInvoice = useCallback((nextInvoice: Invoice | ((prev: Invoice) => Invoice), options?: { skipAutoSave?: boolean }) => {
    if (options?.skipAutoSave) {
      skipNextAutoSaveRef.current = true;
    }

    setInvoiceState(prev => {
      const resolvedInvoice = typeof nextInvoice === 'function'
        ? (nextInvoice as (current: Invoice) => Invoice)(prev)
        : nextInvoice;
      const nextTemplate = resolvedInvoice.template || template;
      const nextHeaderReversed = resolvedInvoice.isHeaderReversed ?? isHeaderReversed;

      if (template !== nextTemplate) {
        setTemplateState(nextTemplate);
      }
      if (isHeaderReversed !== nextHeaderReversed) {
        setIsHeaderReversedState(nextHeaderReversed);
      }

      return applyWorkspacePresentation(resolvedInvoice, nextTemplate, nextHeaderReversed);
    });
  }, [isHeaderReversed, template]);

  const updateInvoice = useCallback((updates: Partial<Invoice>) => {
    waitForFirstEditRef.current = false;
    setInvoiceState(prev => ({ ...prev, ...updates }));
  }, []);

  const setTemplate = useCallback((nextTemplate: TemplateType) => {
    setTemplateState(nextTemplate);
    setInvoiceState(prev => applyWorkspacePresentation(prev, nextTemplate, isHeaderReversed));
  }, [isHeaderReversed]);

  const setIsHeaderReversed = useCallback((nextIsHeaderReversed: boolean) => {
    setIsHeaderReversedState(nextIsHeaderReversed);
    setInvoiceState(prev => applyWorkspacePresentation(prev, template, nextIsHeaderReversed));
  }, [template]);

  const persistInvoice = useCallback(async (targetInvoice: Invoice) => {
    if (!user?.id || !targetInvoice.id) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    setSaveStatus('saving');
    try {
      await saveInvoiceRecord(targetInvoice);
      upsertRecordLocally(targetInvoice);
      setSaveStatus('saved');
      setLastSavedTime(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [upsertRecordLocally, user?.id]);

  const buildSenderDraft = useCallback((senderOverride?: Partial<Invoice['sender']>) => ({
    ...INITIAL_INVOICE.sender,
    ...(senderOverride || {}),
    ...(user?.id ? defaultSender : {}),
  }), [defaultSender, user?.id]);

  const createInvoice = useCallback(async (preset?: Partial<Invoice>) => {
    const newId = Date.now().toString();
    const defaultCurrency = getDefaultCurrencyForLanguage(lang);
    const nextInvoice: Invoice = {
      ...INITIAL_INVOICE,
      currency: defaultCurrency,
      items: [{ id: 'item-1', description: translations[lang].itemDescriptionExample || 'Example Service Item', quantity: 1, rate: 0 }],
      ...preset,
      client: { ...INITIAL_INVOICE.client },
      sender: buildSenderDraft(preset?.sender),
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`
    };

    waitForFirstEditRef.current = !!user?.id;
    setInvoice(nextInvoice, { skipAutoSave: true });
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!user?.id) {
      upsertRecordLocally(nextInvoice);
    }

    return nextInvoice;
  }, [buildSenderDraft, lang, setActiveView, setInvoice, upsertRecordLocally, user?.id]);

  const saveCurrentInvoice = useCallback(async () => {
    if (user?.id) {
      await persistInvoice(invoice);
      return;
    }

    upsertRecordLocally(invoice);
    showToast('账单已本地保存（登录后可同步云端）', 'success');
  }, [invoice, persistInvoice, showToast, upsertRecordLocally, user?.id]);

  const refreshRecords = useCallback(async () => undefined, []);

  const removeInvoice = useCallback(async (invoiceId: string) => {
    if (user?.id) {
      setIsDeletingId(invoiceId);
      try {
        await deleteInvoiceRecord(invoiceId);
        setRecords(prev => prev.filter(record => record.id !== invoiceId));
      } finally {
        setIsDeletingId(null);
      }
      return;
    }

    setRecords(prev => prev.filter(record => record.id !== invoiceId));
  }, [setRecords, user?.id]);

  const updateInvoiceStatus = useCallback(async (invoiceId: string, nextStatus: Invoice['status']) => {
    const targetInvoice = records.find((record) => record.id === invoiceId);
    if (!targetInvoice) return;

    const nextInvoice = {
      ...targetInvoice,
      status: nextStatus,
    };

    setRecords((prev) => prev.map((record) => (record.id === invoiceId ? nextInvoice : record)));
    setInvoiceState((prev) => (prev.id === invoiceId ? nextInvoice : prev));

    if (!user?.id) return;

    try {
      await saveInvoiceRecord(nextInvoice);
    } catch (error) {
      setRecords((prev) => prev.map((record) => (record.id === invoiceId ? targetInvoice : record)));
      setInvoiceState((prev) => (prev.id === invoiceId ? targetInvoice : prev));
      throw error;
    }
  }, [records, setRecords, user?.id]);

  const useTemplate = useCallback(async (templateRecord: InvoiceTemplate) => {
    const newId = Date.now().toString();
    const nextInvoice: Invoice = {
      ...INITIAL_INVOICE,
      ...templateRecord.template_data,
      sender: buildSenderDraft(templateRecord.template_data.sender),
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: { name: '', email: '', address: '' },
      status: 'Pending'
    };

    waitForFirstEditRef.current = !!user?.id;
    setInvoice(nextInvoice, { skipAutoSave: true });
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!user?.id) {
      upsertRecordLocally(nextInvoice);
    }

    return nextInvoice;
  }, [buildSenderDraft, setActiveView, setInvoice, upsertRecordLocally, user?.id]);

  const duplicateInvoice = useCallback(async (sourceInvoice: Invoice) => {
    const newId = Date.now().toString();
    const duplicatedInvoice: Invoice = {
      ...sourceInvoice,
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: sourceInvoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      items: sourceInvoice.items.map((item, index) => ({
        ...item,
        id: `${newId}-item-${index + 1}`
      }))
    };

    waitForFirstEditRef.current = !!user?.id;
    setInvoice(duplicatedInvoice, { skipAutoSave: true });
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    upsertRecordLocally(duplicatedInvoice);
    showToast(user?.id ? '发票副本已创建，编辑后会自动保存' : '发票已复制到本地', 'success');
    return duplicatedInvoice;
  }, [setActiveView, setInvoice, showToast, upsertRecordLocally, user?.id]);

  const saveAsTemplate = useCallback(async (name: string, description: string, templateType: TemplateCategory) => {
    if (!user?.id) {
      showToast('Please login to save templates', 'warning');
      return;
    }

    await createTemplate(name, description, templateType, invoice);
    showToast(translations[lang].templateSaved || 'Template saved successfully!', 'success');
  }, [invoice, lang, showToast, user?.id]);

  const scheduleAutoSave = useCallback((targetInvoice: Invoice) => {
    if (!user?.id || !targetInvoice.id || activeView !== 'editor') return;
    if (waitForFirstEditRef.current) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      persistInvoice(targetInvoice).catch(() => undefined);
    }, 3000);
  }, [activeView, persistInvoice, user?.id]);

  const actions = useMemo(() => ({
    createInvoice,
    saveCurrentInvoice,
    saveAsTemplate,
    useTemplate,
    duplicateInvoice,
    removeInvoice,
    updateInvoiceStatus,
    refreshRecords,
    setInvoice,
    updateInvoice,
    setTemplate,
    setIsHeaderReversed,
    setIsExporting,
    scheduleAutoSave,
  }), [createInvoice, duplicateInvoice, refreshRecords, removeInvoice, saveAsTemplate, saveCurrentInvoice, scheduleAutoSave, setInvoice, setIsHeaderReversed, setTemplate, updateInvoice, updateInvoiceStatus, useTemplate]);

  return {
    invoice,
    template,
    isHeaderReversed,
    isExporting,
    saveStatus,
    lastSavedTime,
    isDeletingId,
    actions
  };
}

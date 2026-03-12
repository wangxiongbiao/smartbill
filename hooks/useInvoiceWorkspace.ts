'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { translations } from '@/i18n';
import { batchSaveInvoiceRecords, deleteInvoiceRecord, listInvoices, saveInvoiceRecord } from '@/lib/api/invoice';
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
  status: 'Draft',
  visibility: { date: true, dueDate: false }
};

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
  const [invoice, setInvoice] = useState<Invoice>(INITIAL_INVOICE);
  const [template, setTemplate] = useState<TemplateType>('minimalist');
  const [isHeaderReversed, setIsHeaderReversed] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waitForFirstEditRef = useRef(false);

  const upsertRecordLocally = useCallback((targetInvoice: Invoice) => {
    setRecords(prev => {
      const exists = prev.some(record => record.id === targetInvoice.id);
      if (exists) return prev.map(record => record.id === targetInvoice.id ? targetInvoice : record);
      return [targetInvoice, ...prev];
    });
  }, [setRecords]);

  const updateInvoice = useCallback((updates: Partial<Invoice>) => {
    waitForFirstEditRef.current = false;
    setInvoice(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    setInvoice(prev => {
      if (prev.template === template && prev.isHeaderReversed === isHeaderReversed) return prev;
      return { ...prev, template, isHeaderReversed };
    });
  }, [template, isHeaderReversed]);

  const refreshRecords = useCallback(async () => {
    if (!user?.id) return;
    const { invoices } = await listInvoices(user.id);
    setRecords(invoices);
  }, [user?.id, setRecords]);

  const persistInvoice = useCallback(async (targetInvoice: Invoice) => {
    if (!user?.id || !targetInvoice.id) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    setSaveStatus('saving');
    try {
      await saveInvoiceRecord(targetInvoice);
      upsertRecordLocally(targetInvoice);
      await refreshRecords();
      setSaveStatus('saved');
      setLastSavedTime(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [refreshRecords, upsertRecordLocally, user?.id]);

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
    setInvoice(nextInvoice);
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!user?.id) {
      upsertRecordLocally(nextInvoice);
    }

    return nextInvoice;
  }, [buildSenderDraft, lang, setActiveView, upsertRecordLocally, user?.id]);

  const saveCurrentInvoice = useCallback(async () => {
    if (user?.id) {
      await persistInvoice(invoice);
      return;
    }

    upsertRecordLocally(invoice);
    showToast('账单已本地保存（登录后可同步云端）', 'success');
  }, [invoice, persistInvoice, showToast, upsertRecordLocally, user?.id]);

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
    setInvoice((prev) => (prev.id === invoiceId ? nextInvoice : prev));

    if (!user?.id) return;

    try {
      await saveInvoiceRecord(nextInvoice);
    } catch (error) {
      setRecords((prev) => prev.map((record) => (record.id === invoiceId ? targetInvoice : record)));
      setInvoice((prev) => (prev.id === invoiceId ? targetInvoice : prev));
      throw error;
    }
  }, [records, saveInvoiceRecord, setRecords, user?.id]);

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
      status: 'Draft'
    };

    waitForFirstEditRef.current = !!user?.id;
    setInvoice(nextInvoice);
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!user?.id) {
      upsertRecordLocally(nextInvoice);
    }

    return nextInvoice;
  }, [buildSenderDraft, setActiveView, upsertRecordLocally, user?.id]);

  const duplicateInvoice = useCallback(async (sourceInvoice: Invoice) => {
    const newId = Date.now().toString();
    const duplicatedInvoice: Invoice = {
      ...sourceInvoice,
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: sourceInvoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Draft',
      items: sourceInvoice.items.map((item, index) => ({
        ...item,
        id: `${newId}-item-${index + 1}`
      }))
    };

    waitForFirstEditRef.current = !!user?.id;
    setInvoice(duplicatedInvoice);
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    upsertRecordLocally(duplicatedInvoice);
    showToast(user?.id ? '发票副本已创建，编辑后会自动保存' : '发票已复制到本地', 'success');
    return duplicatedInvoice;
  }, [setActiveView, showToast, upsertRecordLocally, user?.id]);

  const saveAsTemplate = useCallback(async (name: string, description: string, templateType: TemplateCategory) => {
    if (!user?.id) {
      showToast('Please login to save templates', 'warning');
      return;
    }

    await createTemplate(name, description, templateType, invoice);
    showToast(translations[lang].templateSaved || 'Template saved successfully!', 'success');
  }, [invoice, lang, showToast, user?.id]);

  useEffect(() => {
    if (!user?.id || !invoice.id || activeView !== 'editor') return;
    if (waitForFirstEditRef.current) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      persistInvoice(invoice).catch(() => undefined);
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [activeView, invoice, persistInvoice, user?.id]);

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
    setIsExporting
  }), [createInvoice, duplicateInvoice, refreshRecords, removeInvoice, saveAsTemplate, saveCurrentInvoice, updateInvoice, updateInvoiceStatus, useTemplate]);

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

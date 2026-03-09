'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { translations } from '@/i18n';
import { batchSaveInvoiceRecords, deleteInvoiceRecord, listInvoices, saveInvoiceRecord } from '@/lib/api/invoice';
import { createTemplate } from '@/lib/api/template';
import type { Invoice, InvoiceTemplate, Language, TemplateType, User, ViewType } from '@/types';

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
  records: Invoice[];
  setRecords: React.Dispatch<React.SetStateAction<Invoice[]>>;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  lang: Language;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}) {
  const { user, records, setRecords, activeView, setActiveView, lang, showToast } = params;
  const [invoice, setInvoice] = useState<Invoice>(INITIAL_INVOICE);
  const [template, setTemplate] = useState<TemplateType>('minimalist');
  const [isHeaderReversed, setIsHeaderReversed] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateInvoice = useCallback((updates: Partial<Invoice>) => {
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
      setSaveStatus('saved');
      setLastSavedTime(new Date());
      await refreshRecords();
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [refreshRecords, user?.id]);

  const createInvoice = useCallback(async (preset?: Partial<Invoice>) => {
    const newId = Date.now().toString();
    const defaultCurrency = lang === 'zh-TW' ? 'TWD' : 'USD';
    const nextInvoice: Invoice = {
      ...INITIAL_INVOICE,
      currency: defaultCurrency,
      items: [{ id: 'item-1', description: translations[lang].itemDescriptionExample || 'Example Service Item', quantity: 1, rate: 0 }],
      ...preset,
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`
    };

    setInvoice(nextInvoice);
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (user?.id) await persistInvoice(nextInvoice);
    return nextInvoice;
  }, [lang, persistInvoice, setActiveView, user?.id]);

  const saveCurrentInvoice = useCallback(async () => {
    if (user?.id) {
      await persistInvoice(invoice);
      return;
    }

    setRecords(prev => {
      const exists = prev.find(record => record.id === invoice.id);
      const nextRecords = exists ? prev.map(record => record.id === invoice.id ? invoice : record) : [invoice, ...prev];
      localStorage.setItem('invoice_records_v2', JSON.stringify(nextRecords));
      return nextRecords;
    });
    showToast('账单已本地保存（登录后可同步云端）', 'success');
  }, [invoice, persistInvoice, setRecords, showToast, user?.id]);

  const removeInvoice = useCallback(async (invoiceId: string) => {
    if (user?.id) {
      setIsDeletingId(invoiceId);
      try {
        await deleteInvoiceRecord(invoiceId);
        await refreshRecords();
      } finally {
        setIsDeletingId(null);
      }
      return;
    }

    setRecords(prev => prev.filter(record => record.id !== invoiceId));
  }, [refreshRecords, setRecords, user?.id]);

  const useTemplate = useCallback(async (templateRecord: InvoiceTemplate) => {
    const newId = Date.now().toString();
    const nextInvoice: Invoice = {
      ...INITIAL_INVOICE,
      ...templateRecord.template_data,
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: { name: '', email: '', address: '' },
      status: 'Draft'
    };

    setInvoice(nextInvoice);
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (user?.id) await persistInvoice(nextInvoice);
  }, [persistInvoice, setActiveView, user?.id]);

  const saveAsTemplate = useCallback(async (name: string, description: string) => {
    if (!user?.id) {
      showToast('Please login to save templates', 'warning');
      return;
    }

    await createTemplate(name, description, invoice);
    showToast(translations[lang].templateSaved || 'Template saved successfully!', 'success');
  }, [invoice, lang, showToast, user?.id]);

  useEffect(() => {
    if (!user?.id || !invoice.id || activeView !== 'editor') return;
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
    removeInvoice,
    refreshRecords,
    setInvoice,
    updateInvoice,
    setTemplate,
    setIsHeaderReversed,
    setIsExporting
  }), [createInvoice, refreshRecords, removeInvoice, saveAsTemplate, saveCurrentInvoice, updateInvoice, useTemplate]);

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

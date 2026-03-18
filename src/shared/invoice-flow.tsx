import React, { createContext, useContext, useMemo, useState } from 'react';

import { createEmptyInvoice } from '@/shared/invoice';
import type { Invoice, InvoiceTemplateRecord, TemplateCategory } from '@/shared/types';

type SaveTemplateInput = {
  name: string;
  description?: string;
  templateType: TemplateCategory;
  invoice: Invoice;
};

type InvoiceFlowContextValue = {
  draftInvoice: Invoice;
  createdInvoices: Invoice[];
  deletedInvoiceIds: string[];
  savedTemplates: InvoiceTemplateRecord[];
  removeInvoice: (id: string) => void;
  resetDraftInvoice: () => Invoice;
  saveTemplate: (input: SaveTemplateInput) => InvoiceTemplateRecord;
  setDraftInvoice: (invoice: Invoice) => void;
  updateDraftInvoice: (updates: Partial<Invoice>) => void;
  submitDraftInvoice: () => Invoice;
};

const InvoiceFlowContext = createContext<InvoiceFlowContextValue | null>(null);

export function InvoiceFlowProvider({ children }: { children: React.ReactNode }) {
  const [draftInvoice, setDraftInvoiceState] = useState<Invoice>(() => createEmptyInvoice());
  const [createdInvoices, setCreatedInvoices] = useState<Invoice[]>([]);
  const [deletedInvoiceIds, setDeletedInvoiceIds] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<InvoiceTemplateRecord[]>([]);

  const resetDraftInvoice = () => {
    const nextDraft = createEmptyInvoice();
    setDraftInvoiceState(nextDraft);
    return nextDraft;
  };

  const setDraftInvoice = (invoice: Invoice) => {
    setDraftInvoiceState(invoice);
  };

  const updateDraftInvoice = (updates: Partial<Invoice>) => {
    setDraftInvoiceState((current) => ({ ...current, ...updates }));
  };

  const submitDraftInvoice = () => {
    const finalizedInvoice: Invoice = {
      ...draftInvoice,
      status: draftInvoice.status || 'Pending',
    };

    setCreatedInvoices((current) => [finalizedInvoice, ...current]);
    setDraftInvoiceState(createEmptyInvoice());

    return finalizedInvoice;
  };

  const removeInvoice = (id: string) => {
    setCreatedInvoices((current) => current.filter((invoice) => invoice.id !== id));
    setDeletedInvoiceIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  const saveTemplate = ({ description, invoice, name, templateType }: SaveTemplateInput) => {
    const now = new Date().toISOString();
    const nextTemplate: InvoiceTemplateRecord = {
      id: `template-${Date.now()}`,
      name,
      description,
      templateType,
      templateData: {
        ...invoice,
      },
      sourceInvoiceId: invoice.id,
      createdAt: now,
      updatedAt: now,
    };

    setSavedTemplates((current) => [nextTemplate, ...current]);

    return nextTemplate;
  };

  const value = useMemo(
    () => ({
      draftInvoice,
      createdInvoices,
      deletedInvoiceIds,
      savedTemplates,
      removeInvoice,
      resetDraftInvoice,
      saveTemplate,
      setDraftInvoice,
      updateDraftInvoice,
      submitDraftInvoice,
    }),
    [createdInvoices, deletedInvoiceIds, draftInvoice, savedTemplates]
  );

  return <InvoiceFlowContext.Provider value={value}>{children}</InvoiceFlowContext.Provider>;
}

export function useInvoiceFlow() {
  const context = useContext(InvoiceFlowContext);

  if (!context) {
    throw new Error('useInvoiceFlow must be used inside InvoiceFlowProvider');
  }

  return context;
}

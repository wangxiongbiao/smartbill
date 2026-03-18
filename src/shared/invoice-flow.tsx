import React, { createContext, useContext, useMemo, useState } from 'react';

import { createEmptyInvoice } from '@/shared/invoice';
import type { Invoice } from '@/shared/types';

type InvoiceFlowContextValue = {
  draftInvoice: Invoice;
  createdInvoices: Invoice[];
  resetDraftInvoice: () => Invoice;
  setDraftInvoice: (invoice: Invoice) => void;
  updateDraftInvoice: (updates: Partial<Invoice>) => void;
  submitDraftInvoice: () => Invoice;
};

const InvoiceFlowContext = createContext<InvoiceFlowContextValue | null>(null);

export function InvoiceFlowProvider({ children }: { children: React.ReactNode }) {
  const [draftInvoice, setDraftInvoiceState] = useState<Invoice>(() => createEmptyInvoice());
  const [createdInvoices, setCreatedInvoices] = useState<Invoice[]>([]);

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

  const value = useMemo(
    () => ({
      draftInvoice,
      createdInvoices,
      resetDraftInvoice,
      setDraftInvoice,
      updateDraftInvoice,
      submitDraftInvoice,
    }),
    [createdInvoices, draftInvoice]
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

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/shared/auth/AuthProvider';
import { createEmptyInvoice } from '@/shared/invoice';
import {
  deleteInvoiceRemote,
  fetchBillingProfiles,
  fetchInvoices,
  fetchProfile,
  fetchTemplates,
  saveInvoiceRemote,
  saveTemplateRemote,
} from '@/shared/mobile-api';
import type { BillingProfile, Invoice, InvoiceTemplateRecord, TemplateCategory } from '@/shared/types';

type SaveTemplateInput = {
  name: string;
  description?: string;
  templateType: TemplateCategory;
  invoice: Invoice;
};

type InvoiceFlowContextValue = {
  billingProfiles: BillingProfile[];
  draftInvoice: Invoice;
  createdInvoices: Invoice[];
  deletedInvoiceIds: string[];
  isSyncing: boolean;
  savedTemplates: InvoiceTemplateRecord[];
  remoteProfileName: string | null;
  refreshRemoteData: () => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
  resetDraftInvoice: () => Invoice;
  saveTemplate: (input: SaveTemplateInput) => Promise<InvoiceTemplateRecord>;
  setDraftInvoice: (invoice: Invoice) => void;
  syncError: string | null;
  updateDraftInvoice: (updates: Partial<Invoice>) => void;
  submitDraftInvoice: () => Promise<Invoice>;
};

const InvoiceFlowContext = createContext<InvoiceFlowContextValue | null>(null);

export function InvoiceFlowProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [draftInvoice, setDraftInvoiceState] = useState<Invoice>(() => createEmptyInvoice());
  const [createdInvoices, setCreatedInvoices] = useState<Invoice[]>([]);
  const [deletedInvoiceIds, setDeletedInvoiceIds] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<InvoiceTemplateRecord[]>([]);
  const [billingProfiles, setBillingProfiles] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [remoteProfileName, setRemoteProfileName] = useState<string | null>(null);

  const refreshRemoteData = useCallback(async () => {
    if (!accessToken || !isAuthenticated) {
      setCreatedInvoices([]);
      setDeletedInvoiceIds([]);
      setSavedTemplates([]);
      setBillingProfiles([]);
      setRemoteProfileName(null);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const [invoices, templates, profiles, profile] = await Promise.all([
        fetchInvoices(accessToken),
        fetchTemplates(accessToken),
        fetchBillingProfiles(accessToken).catch(() => []),
        fetchProfile(accessToken).catch(() => null),
      ]);

      setCreatedInvoices(invoices);
      setDeletedInvoiceIds([]);
      setSavedTemplates(templates);
      setBillingProfiles(profiles);
      setRemoteProfileName(profile?.full_name ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync workspace data.';
      setSyncError(message);
      console.error('[InvoiceFlow] Failed to refresh remote data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    void refreshRemoteData();
  }, [refreshRemoteData]);

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

  const submitDraftInvoice = async () => {
    const finalizedInvoice: Invoice = {
      ...draftInvoice,
      status: draftInvoice.status || 'Pending',
    };

    setCreatedInvoices((current) => [finalizedInvoice, ...current]);
    setDraftInvoiceState(createEmptyInvoice());

    if (accessToken) {
      try {
        await saveInvoiceRemote(accessToken, finalizedInvoice);
        const refreshedProfiles = await fetchBillingProfiles(accessToken).catch(() => billingProfiles);
        setBillingProfiles(refreshedProfiles);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save invoice.';
        setSyncError(message);
        console.error('[InvoiceFlow] Failed to save invoice remotely:', error);
      }
    }

    return finalizedInvoice;
  };

  const removeInvoice = async (id: string) => {
    setCreatedInvoices((current) => current.filter((invoice) => invoice.id !== id));
    setDeletedInvoiceIds((current) => (current.includes(id) ? current : [...current, id]));

    if (accessToken) {
      try {
        await deleteInvoiceRemote(accessToken, id);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete invoice.';
        setSyncError(message);
        console.error('[InvoiceFlow] Failed to delete invoice remotely:', error);
      }
    }
  };

  const saveTemplate = async ({ description, invoice, name, templateType }: SaveTemplateInput) => {
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

    if (accessToken) {
      try {
        const remoteTemplate = await saveTemplateRemote(accessToken, {
          name,
          description,
          templateType,
          templateData: invoice,
        });
        setSavedTemplates((current) => [
          remoteTemplate,
          ...current.filter((template) => template.id !== nextTemplate.id),
        ]);
        return remoteTemplate;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save template.';
        setSyncError(message);
        console.error('[InvoiceFlow] Failed to save template remotely:', error);
      }
    }

    return nextTemplate;
  };

  const value = useMemo(
    () => ({
      billingProfiles,
      draftInvoice,
      createdInvoices,
      deletedInvoiceIds,
      isSyncing,
      remoteProfileName,
      refreshRemoteData,
      savedTemplates,
      removeInvoice,
      resetDraftInvoice,
      saveTemplate,
      setDraftInvoice,
      syncError,
      updateDraftInvoice,
      submitDraftInvoice,
    }),
    [
      billingProfiles,
      createdInvoices,
      deletedInvoiceIds,
      draftInvoice,
      isSyncing,
      remoteProfileName,
      refreshRemoteData,
      savedTemplates,
      syncError,
    ]
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

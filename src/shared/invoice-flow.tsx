import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/shared/auth/AuthProvider';
import {
  deriveBillingProfilesFromInvoices,
  getBillingProfileLookupKey,
} from '@/shared/billing-profiles';
import { createEmptyInvoice } from '@/shared/invoice';
import {
  bumpTemplateUsageRemote,
  deleteInvoiceRemote,
  deleteTemplateRemote,
  fetchBillingProfiles,
  fetchInvoices,
  fetchProfile,
  fetchTemplates,
  saveBillingProfileRemote,
  saveInvoiceRemote,
  saveTemplateRemote,
} from '@/shared/mobile-api';
import {
  cloneInvoiceRecord,
  createDraftInvoiceFromTemplate,
} from '@/shared/mobile-hub';
import type { BillingProfile, Invoice, InvoiceTemplateRecord, Sender, TemplateCategory } from '@/shared/types';

type SaveTemplateInput = {
  name: string;
  description?: string;
  templateType: TemplateCategory;
  invoice: Invoice;
};

type EditorMode = 'new' | 'edit';
type SaveStatus = 'idle' | 'creating' | 'saving' | 'saved' | 'error';

type InvoiceFlowContextValue = {
  billingProfiles: BillingProfile[];
  createdInvoices: Invoice[];
  defaultSender: Pick<Sender, 'name' | 'email' | 'phone' | 'address'>;
  deletedInvoiceIds: string[];
  draftInvoice: Invoice;
  editorError: string | null;
  editorMode: EditorMode;
  isEditorActive: boolean;
  isSyncing: boolean;
  lastSavedAt: string | null;
  refreshRemoteData: () => Promise<void>;
  remoteProfileName: string | null;
  removeInvoice: (id: string) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  resetDraftInvoice: () => Invoice;
  saveDefaultSenderProfile: (
    profile: Partial<Pick<Sender, 'name' | 'email' | 'phone' | 'address'>>
  ) => Promise<BillingProfile | null>;
  saveStatus: SaveStatus;
  saveTemplate: (input: SaveTemplateInput) => Promise<InvoiceTemplateRecord>;
  savedTemplates: InvoiceTemplateRecord[];
  setDraftInvoice: (invoice: Invoice) => void;
  submitDraftInvoice: () => Promise<Invoice>;
  syncError: string | null;
  updateDraftInvoice: (updates: Partial<Invoice>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  useTemplate: (template: InvoiceTemplateRecord) => Promise<Invoice>;
};

const InvoiceFlowContext = createContext<InvoiceFlowContextValue | null>(null);

function mergeBillingProfiles(
  remoteProfiles: BillingProfile[],
  invoices: Invoice[]
) {
  const merged = new Map<string, BillingProfile>();

  remoteProfiles.forEach((profile) => {
    merged.set(getBillingProfileLookupKey(profile.kind, profile), profile);
  });

  deriveBillingProfilesFromInvoices(invoices).forEach((profile) => {
    const key = getBillingProfileLookupKey(profile.kind, profile);
    if (!merged.has(key)) {
      merged.set(key, profile);
    }
  });

  return [...merged.values()];
}

function upsertInvoiceRecord(records: Invoice[], nextInvoice: Invoice) {
  const nextId = String(nextInvoice.id);
  const existingIndex = records.findIndex((record) => String(record.id) === nextId);

  if (existingIndex === -1) {
    return [nextInvoice, ...records];
  }

  return records.map((record, index) => (index === existingIndex ? nextInvoice : record));
}

export function InvoiceFlowProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated, user } = useAuth();
  const [draftInvoice, setDraftInvoiceState] = useState<Invoice>(() => createEmptyInvoice());
  const [editorMode, setEditorMode] = useState<EditorMode>('new');
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [createdInvoices, setCreatedInvoices] = useState<Invoice[]>([]);
  const [deletedInvoiceIds, setDeletedInvoiceIds] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<InvoiceTemplateRecord[]>([]);
  const [storedBillingProfiles, setStoredBillingProfiles] = useState<BillingProfile[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [remoteProfileName, setRemoteProfileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutoSaveRef = useRef(false);
  const hasPendingChangesRef = useRef(false);
  const latestInvoiceRef = useRef<Invoice>(draftInvoice);
  const queuedPersistInvoiceRef = useRef<Invoice | null>(null);
  const persistLoopPromiseRef = useRef<Promise<void> | null>(null);

  const upsertInvoiceLocally = useCallback((nextInvoice: Invoice) => {
    setDeletedInvoiceIds((current) => current.filter((id) => id !== String(nextInvoice.id)));
    setCreatedInvoices((current) => upsertInvoiceRecord(current, nextInvoice));
  }, []);

  useEffect(() => {
    latestInvoiceRef.current = draftInvoice;
  }, [draftInvoice]);

  const billingProfiles = useMemo(
    () => mergeBillingProfiles(storedBillingProfiles, createdInvoices),
    [createdInvoices, storedBillingProfiles]
  );

  const defaultSenderProfile = useMemo(
    () =>
      storedBillingProfiles.find(
        (profile) => profile.kind === 'sender' && profile.isDefault
      ) || null,
    [storedBillingProfiles]
  );

  const defaultSender = useMemo(
    () => ({
      name: defaultSenderProfile?.name || remoteProfileName || user?.name || '',
      email: defaultSenderProfile?.email || user?.email || '',
      phone: defaultSenderProfile?.phone || '',
      address: defaultSenderProfile?.address || '',
    }),
    [
      defaultSenderProfile?.address,
      defaultSenderProfile?.email,
      defaultSenderProfile?.name,
      defaultSenderProfile?.phone,
      remoteProfileName,
      user?.email,
      user?.name,
    ]
  );

  const refreshRemoteData = useCallback(async () => {
    if (!accessToken || !isAuthenticated) {
      setCreatedInvoices([]);
      setDeletedInvoiceIds([]);
      setSavedTemplates([]);
      setStoredBillingProfiles([]);
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
      setStoredBillingProfiles(profiles);
      setRemoteProfileName(profile?.full_name ?? null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to sync workspace data.';
      setSyncError(message);
      console.error('[InvoiceFlow] Failed to refresh remote data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    void refreshRemoteData();
  }, [refreshRemoteData]);

  const persistInvoice = useCallback(
    (targetInvoice: Invoice) => {
      const nextInvoice = cloneInvoiceRecord(targetInvoice);

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      queuedPersistInvoiceRef.current = nextInvoice;

      if (persistLoopPromiseRef.current) {
        return persistLoopPromiseRef.current;
      }

      persistLoopPromiseRef.current = (async () => {
        try {
          while (queuedPersistInvoiceRef.current) {
            const pendingInvoice = queuedPersistInvoiceRef.current;
            queuedPersistInvoiceRef.current = null;

            setSaveStatus('saving');

            if (accessToken) {
              await saveInvoiceRemote(accessToken, pendingInvoice);
            }

            upsertInvoiceLocally(pendingInvoice);
            setSaveStatus('saved');
            setLastSavedAt(new Date().toISOString());
            setEditorError(null);
            setSyncError(null);
          }

          hasPendingChangesRef.current = false;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to save invoice.';
          setEditorError(message);
          setSyncError(message);
          setSaveStatus('error');
          console.error('[InvoiceFlow] Failed to persist invoice:', error);
          throw error;
        } finally {
          persistLoopPromiseRef.current = null;
        }
      })();

      return persistLoopPromiseRef.current;
    },
    [accessToken, upsertInvoiceLocally]
  );

  const scheduleAutoSave = useCallback(
    (targetInvoice: Invoice) => {
      if (!isEditorActive) {
        return;
      }

      if (skipNextAutoSaveRef.current) {
        skipNextAutoSaveRef.current = false;
        return;
      }

      hasPendingChangesRef.current = true;

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        void persistInvoice(targetInvoice).catch(() => undefined);
      }, 1500);
    },
    [isEditorActive, persistInvoice]
  );

  useEffect(() => {
    scheduleAutoSave(draftInvoice);
  }, [draftInvoice, scheduleAutoSave]);

  const buildNewInvoice = useCallback(() => {
    const baseInvoice = createEmptyInvoice();

    return {
      ...baseInvoice,
      sender: {
        ...baseInvoice.sender,
        ...defaultSender,
      },
    };
  }, [defaultSender]);

  const resetDraftInvoice = useCallback(() => {
    const nextDraft = buildNewInvoice();

    skipNextAutoSaveRef.current = true;
    setEditorMode('new');
    setIsEditorActive(true);
    setEditorError(null);
    setLastSavedAt(null);
    setSaveStatus('creating');
    setDraftInvoiceState(nextDraft);
    latestInvoiceRef.current = nextDraft;
    upsertInvoiceLocally(nextDraft);
    void persistInvoice(nextDraft).catch(() => undefined);

    return nextDraft;
  }, [buildNewInvoice, persistInvoice, upsertInvoiceLocally]);

  const setDraftInvoice = useCallback(
    (invoice: Invoice) => {
      const nextInvoice = cloneInvoiceRecord(invoice);

      skipNextAutoSaveRef.current = true;
      setEditorMode('edit');
      setIsEditorActive(true);
      setEditorError(null);
      setSaveStatus('idle');
      setDraftInvoiceState(nextInvoice);
      latestInvoiceRef.current = nextInvoice;
      upsertInvoiceLocally(nextInvoice);
    },
    [upsertInvoiceLocally]
  );

  const updateDraftInvoice = useCallback(
    (updates: Partial<Invoice>) => {
      setDraftInvoiceState((current) => {
        const nextInvoice = {
          ...current,
          ...updates,
        };

        latestInvoiceRef.current = nextInvoice;
        upsertInvoiceLocally(nextInvoice);
        return nextInvoice;
      });
      setEditorError(null);
    },
    [upsertInvoiceLocally]
  );

  const submitDraftInvoice = useCallback(async () => {
    if (!isEditorActive) {
      setIsEditorActive(true);
    }

    const currentInvoice = latestInvoiceRef.current;

    if (hasPendingChangesRef.current || saveStatus === 'creating') {
      await persistInvoice(currentInvoice);
    } else if (persistLoopPromiseRef.current) {
      await persistLoopPromiseRef.current;
    }

    return currentInvoice;
  }, [isEditorActive, persistInvoice, saveStatus]);

  const removeInvoice = useCallback(
    async (id: string) => {
      const targetId = String(id);
      const previousInvoices = createdInvoices;

      setCreatedInvoices((current) =>
        current.filter((invoice) => String(invoice.id) !== targetId)
      );
      setDeletedInvoiceIds((current) =>
        current.includes(targetId) ? current : [...current, targetId]
      );

      if (String(latestInvoiceRef.current.id) === targetId) {
        setIsEditorActive(false);
        setSaveStatus('idle');
        setEditorError(null);
        setDraftInvoiceState(createEmptyInvoice());
      }

      if (accessToken) {
        try {
          await deleteInvoiceRemote(accessToken, targetId);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to delete invoice.';
          setSyncError(message);
          setCreatedInvoices(previousInvoices);
          setDeletedInvoiceIds((current) => current.filter((item) => item !== targetId));
          console.error('[InvoiceFlow] Failed to delete invoice remotely:', error);
          throw error;
        }
      }
    },
    [accessToken, createdInvoices]
  );

  const updateInvoiceStatus = useCallback(
    async (id: string, status: Invoice['status']) => {
      const targetId = String(id);
      const previousInvoices = createdInvoices;
      const targetInvoice = previousInvoices.find(
        (invoice) => String(invoice.id) === targetId
      );

      if (!targetInvoice) {
        return;
      }

      const nextInvoice: Invoice = {
        ...targetInvoice,
        status,
      };

      upsertInvoiceLocally(nextInvoice);

      if (String(latestInvoiceRef.current.id) === targetId) {
        skipNextAutoSaveRef.current = true;
        latestInvoiceRef.current = nextInvoice;
        setDraftInvoiceState(nextInvoice);
      }

      if (!accessToken) {
        return;
      }

      try {
        await saveInvoiceRemote(accessToken, nextInvoice);
      } catch (error) {
        setCreatedInvoices(previousInvoices);
        if (String(latestInvoiceRef.current.id) === targetId) {
          skipNextAutoSaveRef.current = true;
          latestInvoiceRef.current = targetInvoice;
          setDraftInvoiceState(targetInvoice);
        }
        const message =
          error instanceof Error ? error.message : 'Failed to update invoice status.';
        setSyncError(message);
        throw error;
      }
    },
    [accessToken, createdInvoices, upsertInvoiceLocally]
  );

  const useTemplate = useCallback(
    async (template: InvoiceTemplateRecord) => {
      const nextDraft = createDraftInvoiceFromTemplate(template, defaultSender);

      skipNextAutoSaveRef.current = true;
      setEditorMode('new');
      setIsEditorActive(true);
      setEditorError(null);
      setLastSavedAt(null);
      setSaveStatus('creating');
      setDraftInvoiceState(nextDraft);
      latestInvoiceRef.current = nextDraft;
      upsertInvoiceLocally(nextDraft);
      setSavedTemplates((current) =>
        current.map((item) =>
          item.id === template.id
            ? { ...item, usageCount: (item.usageCount || 0) + 1 }
            : item
        )
      );

      if (accessToken) {
        try {
          await bumpTemplateUsageRemote(accessToken, template.id);
        } catch (error) {
          console.error('[InvoiceFlow] Failed to bump template usage:', error);
        }
      }

      await persistInvoice(nextDraft).catch(() => undefined);
      return nextDraft;
    },
    [accessToken, defaultSender, persistInvoice, upsertInvoiceLocally]
  );

  const saveTemplate = useCallback(
    async ({ description, invoice, name, templateType }: SaveTemplateInput) => {
      const now = new Date().toISOString();
      const nextTemplate: InvoiceTemplateRecord = {
        id: `template-${Date.now()}`,
        name,
        description,
        templateType,
        templateData: cloneInvoiceRecord(invoice),
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
            ...current.filter((templateItem) => templateItem.id !== nextTemplate.id),
          ]);
          return remoteTemplate;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to save template.';
          setSyncError(message);
          console.error('[InvoiceFlow] Failed to save template remotely:', error);
        }
      }

      return nextTemplate;
    },
    [accessToken]
  );

  const removeTemplate = useCallback(
    async (id: string) => {
      const targetId = String(id);
      const previousTemplates = savedTemplates;

      setSavedTemplates((current) =>
        current.filter((templateItem) => String(templateItem.id) !== targetId)
      );

      if (!accessToken) {
        return;
      }

      try {
        await deleteTemplateRemote(accessToken, targetId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete template.';
        setSyncError(message);
        setSavedTemplates(previousTemplates);
        throw error;
      }
    },
    [accessToken, savedTemplates]
  );

  const saveDefaultSenderProfile = useCallback(
    async (
      profile: Partial<Pick<Sender, 'name' | 'email' | 'phone' | 'address'>>
    ) => {
      if (!accessToken) {
        return null;
      }

      try {
        const savedProfile = await saveBillingProfileRemote(
          accessToken,
          'sender',
          {
            name: profile.name?.trim() || '',
            email: profile.email?.trim() || '',
            phone: profile.phone?.trim() || '',
            address: profile.address?.trim() || '',
          },
          true
        );

        const refreshedProfiles = await fetchBillingProfiles(accessToken).catch(
          () => storedBillingProfiles
        );
        setStoredBillingProfiles(refreshedProfiles);
        return savedProfile;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to save the default sender profile.';
        setSyncError(message);
        throw error;
      }
    },
    [accessToken, storedBillingProfiles]
  );

  const value = useMemo(
    () => ({
      billingProfiles,
      createdInvoices,
      defaultSender,
      deletedInvoiceIds,
      draftInvoice,
      editorError,
      editorMode,
      isEditorActive,
      isSyncing,
      lastSavedAt,
      refreshRemoteData,
      remoteProfileName,
      removeInvoice,
      removeTemplate,
      resetDraftInvoice,
      saveDefaultSenderProfile,
      saveStatus,
      saveTemplate,
      savedTemplates,
      setDraftInvoice,
      submitDraftInvoice,
      syncError,
      updateDraftInvoice,
      updateInvoiceStatus,
      useTemplate,
    }),
    [
      billingProfiles,
      createdInvoices,
      defaultSender,
      deletedInvoiceIds,
      draftInvoice,
      editorError,
      editorMode,
      isEditorActive,
      isSyncing,
      lastSavedAt,
      refreshRemoteData,
      remoteProfileName,
      removeInvoice,
      removeTemplate,
      resetDraftInvoice,
      saveDefaultSenderProfile,
      saveStatus,
      saveTemplate,
      savedTemplates,
      setDraftInvoice,
      submitDraftInvoice,
      syncError,
      updateDraftInvoice,
      updateInvoiceStatus,
      useTemplate,
    ]
  );

  return (
    <InvoiceFlowContext.Provider value={value}>
      {children}
    </InvoiceFlowContext.Provider>
  );
}

export function useInvoiceFlow() {
  const context = useContext(InvoiceFlowContext);

  if (!context) {
    throw new Error('useInvoiceFlow must be used inside InvoiceFlowProvider');
  }

  return context;
}

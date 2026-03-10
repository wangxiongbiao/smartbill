"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardShell from '@/components/app/DashboardShell';
import InvoicePreview from '@/components/InvoicePreview';
import { useToast } from '@/hooks/useToast';
import { useEditorUiState } from '@/hooks/useEditorUiState';
import { useInvoiceWorkspace } from '@/hooks/useInvoiceWorkspace';
import { useInvoicePdfExport } from '@/hooks/useInvoicePdfExport';
import { usePersistentAuthSession } from '@/hooks/usePersistentAuthSession';
import { useInvoiceRecordsStore } from '@/hooks/useInvoiceRecordsStore';
import { useTemplateStore } from '@/hooks/useTemplateStore';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppActions } from '@/hooks/useAppActions';
import { getViewFromPath } from '@/lib/routes';
import type { Invoice, InvoiceTemplate, Language, TemplateType, User, ViewType } from '@/types';

type ToastLevel = 'success' | 'error' | 'warning' | 'info';
const PRIVATE_VIEWS: ViewType[] = ['records', 'profile', 'editor', 'templates', 'template-detail'];

interface AppShellContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  activeView: ViewType;
  prevView: ViewType;
  isBootstrapping: boolean;
  isLoggingOut: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  records: Invoice[];
  recordsLoading: boolean;
  templates: InvoiceTemplate[];
  templatesLoading: boolean;
  templateDetailLoading: boolean;
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  isExporting: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedTime?: Date;
  isDeletingId: string | null;
  toast: { message: string; type: ToastLevel; isVisible: boolean };
  showToast: (message: string, type: ToastLevel) => void;
  hideToast: () => void;
  isAIChatOpen: boolean;
  isShareDialogOpen: boolean;
  isEmailDialogOpen: boolean;
  isSaveTemplateDialogOpen: boolean;
  isNewInvoiceConfirmOpen: boolean;
  openAIChat: () => void;
  closeAIChat: () => void;
  toggleAIChat: () => void;
  openShareDialog: () => void;
  closeShareDialog: () => void;
  openEmailDialog: () => void;
  closeEmailDialog: () => void;
  openSaveTemplateDialog: () => void;
  closeSaveTemplateDialog: () => void;
  openNewInvoiceConfirm: () => void;
  closeNewInvoiceConfirm: () => void;
  setView: (view: ViewType) => void;
  openInvoice: (record: Invoice) => void;
  createInvoice: () => Promise<void>;
  duplicateInvoice: (record: Invoice) => Promise<void>;
  useTemplateAndCreateInvoice: (template: InvoiceTemplate) => Promise<void>;
  openTemplateDetail: (template: InvoiceTemplate) => void;
  closeTemplateDetail: () => void;
  updateInvoice: (updates: Partial<Invoice>) => void;
  saveAsTemplate: (name: string, description: string) => Promise<void>;
  confirmCreateInvoice: () => Promise<void>;
  deleteInvoice: (id: string) => void;
  exportInvoice: (record: Invoice) => void;
  exportLatest: () => void;
  exportPdf: () => void;
  logout: () => Promise<void>;
  refreshRecords: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  ensureTemplatesLoaded: () => Promise<void>;
  getTemplateFromCache: (id: string) => InvoiceTemplate | null;
  ensureTemplateLoaded: (id: string) => Promise<InvoiceTemplate | null>;
  deleteTemplateById: (id: string) => Promise<void>;
  bumpTemplateUsageAndRefresh: (id: string) => Promise<void>;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

function getInvoiceIdFromPath(pathname: string) {
  const match = pathname.match(/^\/invoices\/([^/]+)$/);
  if (!match || match[1] === 'new') return null;
  return decodeURIComponent(match[1]);
}

function getTemplateIdFromPath(pathname: string) {
  const match = pathname.match(/^\/templates\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeView = getViewFromPath(pathname);
  const invoiceIdFromPath = getInvoiceIdFromPath(pathname);
  const templateIdFromPath = getTemplateIdFromPath(pathname);
  const isNewInvoicePath = pathname === '/invoices/new';

  const [lang, setLang] = useState<Language>('en');
  const autoCreatePathRef = useRef<string | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const { toast, showToast, hideToast } = useToast();
  const editorUi = useEditorUiState();
  const navigation = useAppNavigation(activeView, pathname);
  const { prevView, setView, navigateToView, router } = navigation;
  const auth = usePersistentAuthSession({ activeView });
  const { isBootstrapping, isLoggingOut, user, setUser } = auth;
  const recordsStore = useInvoiceRecordsStore({ userId: user?.id });
  const { records, setRecords, recordsLoading, hydrateLocalRecords, refreshRecords, syncRecordsForUser, resetRecords } = recordsStore;
  const templateStore = useTemplateStore({
    userId: user?.id,
    pathname,
    onDeletedCurrent: () => router.replace('/templates'),
    showToast,
  });
  const {
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
  } = templateStore;

  useEffect(() => {
    if (!user?.id) {
      hydrateLocalRecords();
      return;
    }

    syncRecordsForUser(user.id).catch((error) => {
      console.error('Failed to sync invoice records:', error);
    });
  }, [hydrateLocalRecords, syncRecordsForUser, user?.id]);

  useEffect(() => {
    if (isBootstrapping || user) return;
    if (!PRIVATE_VIEWS.includes(activeView)) return;

    const next = encodeURIComponent(pathname);
    router.replace(`/?next=${next}`);
  }, [activeView, isBootstrapping, pathname, router, user]);

  const workspace = useInvoiceWorkspace({
    user,
    records,
    setRecords,
    activeView,
    setActiveView: () => undefined,
    lang,
    showToast
  });

  const pdfExport = useInvoicePdfExport({
    invoice: workspace.invoice,
    template: workspace.template,
    isHeaderReversed: workspace.isHeaderReversed,
    lang,
    isExporting: workspace.isExporting,
    setIsExporting: workspace.actions.setIsExporting,
    printAreaRef,
  });

  useEffect(() => {
    if (!invoiceIdFromPath || records.length === 0) return;
    const targetInvoice = records.find((record) => record.id === invoiceIdFromPath);
    if (!targetInvoice) return;

    workspace.actions.setInvoice(targetInvoice);
    if (targetInvoice.template) workspace.actions.setTemplate(targetInvoice.template);
    workspace.actions.setIsHeaderReversed(targetInvoice.isHeaderReversed ?? true);
  }, [invoiceIdFromPath, records, workspace.actions]);

  useEffect(() => {
    if (!isNewInvoicePath) {
      autoCreatePathRef.current = null;
      return;
    }
    if (autoCreatePathRef.current === pathname) return;
    if (isBootstrapping) return;
    if (!user && PRIVATE_VIEWS.includes(activeView)) return;

    autoCreatePathRef.current = pathname;
    workspace.actions.createInvoice()
      .then((nextInvoice) => {
        router.replace(`/invoices/${nextInvoice.id}`);
      })
      .catch((error) => {
        console.error('Failed to create invoice from route:', error);
      });
  }, [activeView, isBootstrapping, isNewInvoicePath, pathname, router, user, workspace.actions]);

  useEffect(() => {
    if (!templateIdFromPath || !user) return;
    ensureTemplateLoaded(templateIdFromPath).catch((error) => {
      console.error('Failed to load template detail:', error);
    });
  }, [ensureTemplateLoaded, templateIdFromPath, user]);

  const actions = useAppActions({
    userId: user?.id,
    lang,
    records,
    showToast,
    navigateToView,
    refreshTemplates,
    resetTemplates,
    resetRecords,
    logoutCore: auth.logout,
    afterLogout: () => router.push('/'),
    openTemplateDetailCache,
    workspace: {
      invoice: workspace.invoice,
      actions: {
        setInvoice: workspace.actions.setInvoice,
        setTemplate: workspace.actions.setTemplate,
        setIsHeaderReversed: workspace.actions.setIsHeaderReversed,
        createInvoice: workspace.actions.createInvoice,
        duplicateInvoice: workspace.actions.duplicateInvoice,
        useTemplate: workspace.actions.useTemplate,
        saveCurrentInvoice: workspace.actions.saveCurrentInvoice,
        removeInvoice: workspace.actions.removeInvoice,
        updateInvoice: workspace.actions.updateInvoice,
      },
    },
    exportPdfNow: pdfExport.handleExportPdf,
  });

  const contextValue = useMemo<AppShellContextValue>(() => ({
    lang,
    setLang,
    activeView,
    prevView,
    isBootstrapping,
    isLoggingOut,
    user,
    setUser,
    records,
    recordsLoading,
    templates,
    templatesLoading,
    templateDetailLoading,
    invoice: workspace.invoice,
    template: workspace.template,
    isHeaderReversed: workspace.isHeaderReversed,
    isExporting: workspace.isExporting,
    saveStatus: workspace.saveStatus,
    lastSavedTime: workspace.lastSavedTime,
    isDeletingId: workspace.isDeletingId,
    toast,
    showToast,
    hideToast,
    isAIChatOpen: editorUi.isAIChatOpen,
    isShareDialogOpen: editorUi.isShareDialogOpen,
    isEmailDialogOpen: editorUi.isEmailDialogOpen,
    isSaveTemplateDialogOpen: editorUi.isSaveTemplateDialogOpen,
    isNewInvoiceConfirmOpen: editorUi.isNewInvoiceConfirmOpen,
    openAIChat: editorUi.openAIChat,
    closeAIChat: editorUi.closeAIChat,
    toggleAIChat: editorUi.toggleAIChat,
    openShareDialog: editorUi.openShareDialog,
    closeShareDialog: editorUi.closeShareDialog,
    openEmailDialog: editorUi.openEmailDialog,
    closeEmailDialog: editorUi.closeEmailDialog,
    openSaveTemplateDialog: editorUi.openSaveTemplateDialog,
    closeSaveTemplateDialog: editorUi.closeSaveTemplateDialog,
    openNewInvoiceConfirm: editorUi.openNewInvoiceConfirm,
    closeNewInvoiceConfirm: editorUi.closeNewInvoiceConfirm,
    setView,
    openInvoice: actions.openInvoice,
    createInvoice: actions.createInvoice,
    duplicateInvoice: actions.duplicateInvoice,
    useTemplateAndCreateInvoice: actions.useTemplateAndCreateInvoice,
    openTemplateDetail: actions.openTemplateDetail,
    closeTemplateDetail: actions.closeTemplateDetail,
    updateInvoice: actions.updateInvoice,
    saveAsTemplate: actions.saveAsTemplate,
    confirmCreateInvoice: actions.confirmCreateInvoice,
    deleteInvoice: actions.deleteInvoice,
    exportInvoice: actions.exportInvoice,
    exportLatest: actions.exportLatest,
    exportPdf: pdfExport.handleExportPdf,
    logout: actions.logout,
    refreshRecords,
    refreshTemplates,
    ensureTemplatesLoaded,
    getTemplateFromCache,
    ensureTemplateLoaded,
    deleteTemplateById,
    bumpTemplateUsageAndRefresh,
  }), [
    activeView,
    actions,
    bumpTemplateUsageAndRefresh,
    deleteTemplateById,
    editorUi.closeAIChat,
    editorUi.closeEmailDialog,
    editorUi.closeNewInvoiceConfirm,
    editorUi.closeSaveTemplateDialog,
    editorUi.closeShareDialog,
    editorUi.isAIChatOpen,
    editorUi.isEmailDialogOpen,
    editorUi.isNewInvoiceConfirmOpen,
    editorUi.isSaveTemplateDialogOpen,
    editorUi.isShareDialogOpen,
    editorUi.openAIChat,
    editorUi.openEmailDialog,
    editorUi.openNewInvoiceConfirm,
    editorUi.openSaveTemplateDialog,
    editorUi.openShareDialog,
    editorUi.toggleAIChat,
    ensureTemplateLoaded,
    ensureTemplatesLoaded,
    getTemplateFromCache,
    hideToast,
    isBootstrapping,
    isLoggingOut,
    lang,
    pdfExport.handleExportPdf,
    prevView,
    records,
    recordsLoading,
    refreshRecords,
    refreshTemplates,
    setUser,
    setView,
    showToast,
    templateDetailLoading,
    templates,
    templatesLoading,
    toast,
    user,
    workspace.invoice,
    workspace.isDeletingId,
    workspace.isExporting,
    workspace.isHeaderReversed,
    workspace.lastSavedTime,
    workspace.saveStatus,
    workspace.template,
    workspace.actions.removeInvoice,
    workspace.actions.updateInvoice,
  ]);

  return (
    <AppShellContext.Provider value={contextValue}>
      <DashboardShell
        user={user}
        lang={lang}
        activeView={activeView}
        invoice={workspace.invoice}
        saveStatus={workspace.saveStatus}
        lastSavedTime={workspace.lastSavedTime}
        isExporting={workspace.isExporting}
        onSetView={setView}
        onSetLang={setLang}
        onLogout={actions.logout}
        onNewInvoice={actions.createInvoice}
        onExportPdf={pdfExport.handleExportPdf}
        onSaveTemplate={editorUi.openSaveTemplateDialog}
        onShare={editorUi.openShareDialog}
        onSendEmail={editorUi.openEmailDialog}
        toast={toast}
        onCloseToast={hideToast}
        printArea={<div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]"><div ref={printAreaRef} style={{ width: '210mm' }}><InvoicePreview invoice={workspace.invoice} template={workspace.template} isHeaderReversed={workspace.isHeaderReversed} isForPdf={true} lang={lang} /></div></div>}
      >
        {children}
      </DashboardShell>
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) throw new Error('useAppShell must be used within AppShellClient');
  return context;
}

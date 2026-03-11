"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { useEditorUiState } from '@/hooks/useEditorUiState';
import { useInvoiceWorkspace } from '@/hooks/useInvoiceWorkspace';
import { useInvoicePdfExport } from '@/hooks/useInvoicePdfExport';
import { usePersistentAuthSession } from '@/hooks/usePersistentAuthSession';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';
import { useInvoiceRecordsStore } from '@/hooks/useInvoiceRecordsStore';
import { useTemplateStore } from '@/hooks/useTemplateStore';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppActions } from '@/hooks/useAppActions';
import { buildLangHref, getStoredLanguage, persistLanguage, resolveLanguage } from '@/lib/marketing';
import { getSenderDefaultsFromBillingProfile } from '@/lib/billing-profiles';
import { getViewFromPath } from '@/lib/routes';
import { getPublicTemplateById } from '@/lib/public-templates';
import type { DashboardShellProps } from '@/components/app/DashboardShellProps';
import { PRIVATE_VIEWS, type AppShellContextValue } from '@/components/app/app-shell.types';
import type { Language } from '@/types';

function getInvoiceIdFromPath(pathname: string) {
  const match = pathname.match(/^\/invoices\/([^/]+)$/);
  if (!match || match[1] === 'new') return null;
  return decodeURIComponent(match[1]);
}

function getTemplateIdFromPath(pathname: string) {
  const match = pathname.match(/^\/templates\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function useAppShellState() {
  const pathname = usePathname();
  const search = typeof window === 'undefined' ? '' : window.location.search.replace(/^\?/, '');
  const activeView = getViewFromPath(pathname);
  const invoiceIdFromPath = getInvoiceIdFromPath(pathname);
  const templateIdFromPath = getTemplateIdFromPath(pathname);
  const launchTemplateId = typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('template');
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
  const billingProfiles = useBillingProfiles({
    userId: user?.id,
    lang,
  });
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
    const queryLang = resolveLanguage(new URLSearchParams(search).get('lang'));
    if (new URLSearchParams(search).has('lang')) {
      setLang(queryLang);
      persistLanguage(queryLang);
      return;
    }

    const savedLang = getStoredLanguage();
    if (savedLang) {
      setLang(savedLang);
      return;
    }

    if (typeof window !== 'undefined' && window.navigator.language.toLowerCase().includes('zh')) {
      setLang('zh-TW');
    }
  }, [search]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-Hant' : 'en';
  }, [lang]);

  const setConsoleLang = useCallback((nextLang: Language) => {
    setLang(nextLang);
    persistLanguage(nextLang);
  }, []);

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

    const nextPath = search ? `${pathname}?${search}` : pathname;
    const next = encodeURIComponent(nextPath);
    router.replace(`/?next=${next}`);
  }, [activeView, isBootstrapping, pathname, router, search, user]);

  const defaultSenderProfile = billingProfiles.senderProfiles.find((profile) => profile.isDefault);
  const defaultSender = getSenderDefaultsFromBillingProfile(defaultSenderProfile);

  const workspace = useInvoiceWorkspace({
    user,
    defaultSender: {
      ...defaultSender,
      name: defaultSender.name || user?.name || '',
      email: defaultSender.email || user?.email || '',
    },
    records,
    setRecords,
    activeView,
    setActiveView: () => undefined,
    lang,
    showToast,
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
  }, [
    invoiceIdFromPath,
    records,
    workspace.actions.setInvoice,
    workspace.actions.setTemplate,
    workspace.actions.setIsHeaderReversed,
  ]);

  useEffect(() => {
    if (!isNewInvoicePath) {
      autoCreatePathRef.current = null;
      return;
    }

    const routeKey = search ? `${pathname}?${search}` : pathname;
    if (autoCreatePathRef.current === routeKey) return;
    if (isBootstrapping) return;
    if (!user && PRIVATE_VIEWS.includes(activeView)) return;

    autoCreatePathRef.current = routeKey;
    const publicTemplate = launchTemplateId ? getPublicTemplateById(launchTemplateId) : null;
    workspace.actions.createInvoice(publicTemplate?.template.template_data)
      .then((nextInvoice) => {
        router.replace(`/invoices/${nextInvoice.id}`);
      })
      .catch((error) => {
        console.error('Failed to create invoice from route:', error);
      });
  }, [activeView, isBootstrapping, isNewInvoicePath, launchTemplateId, pathname, router, search, user, workspace.actions]);

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
    afterLogout: () => router.push(buildLangHref('/', lang)),
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
    setLang: setConsoleLang,
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
    isLogoutConfirmOpen: editorUi.isLogoutConfirmOpen,
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
    openLogoutConfirm: editorUi.openLogoutConfirm,
    closeLogoutConfirm: editorUi.closeLogoutConfirm,
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
    refreshBillingProfiles: billingProfiles.refresh,
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
    editorUi.closeLogoutConfirm,
    editorUi.closeNewInvoiceConfirm,
    editorUi.closeSaveTemplateDialog,
    editorUi.closeShareDialog,
    editorUi.isAIChatOpen,
    editorUi.isEmailDialogOpen,
    editorUi.isLogoutConfirmOpen,
    editorUi.isNewInvoiceConfirmOpen,
    editorUi.isSaveTemplateDialogOpen,
    editorUi.isShareDialogOpen,
    editorUi.openAIChat,
    editorUi.openEmailDialog,
    editorUi.openLogoutConfirm,
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
    billingProfiles.refresh,
    refreshTemplates,
    setUser,
    setConsoleLang,
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

  const dashboardShellProps = useMemo<Omit<DashboardShellProps, 'children'>>(() => ({
    user,
    lang,
    activeView,
    invoice: workspace.invoice,
    saveStatus: workspace.saveStatus,
    lastSavedTime: workspace.lastSavedTime,
    isExporting: workspace.isExporting,
    onSetView: setView,
    onSetLang: setConsoleLang,
    onLogout: editorUi.openLogoutConfirm,
    onNewInvoice: actions.createInvoice,
    onExportPdf: pdfExport.handleExportPdf,
    onSaveTemplate: editorUi.openSaveTemplateDialog,
    onShare: editorUi.openShareDialog,
    onSendEmail: editorUi.openEmailDialog,
    isLoggingOut,
    isLogoutConfirmOpen: editorUi.isLogoutConfirmOpen,
    onCloseLogoutConfirm: editorUi.closeLogoutConfirm,
    onConfirmLogout: actions.logout,
    toast,
    onCloseToast: hideToast,
    printArea: null,
  }), [
    actions.createInvoice,
    actions.logout,
    activeView,
    editorUi.openEmailDialog,
    editorUi.closeLogoutConfirm,
    editorUi.isLogoutConfirmOpen,
    editorUi.openLogoutConfirm,
    editorUi.openSaveTemplateDialog,
    editorUi.openShareDialog,
    hideToast,
    isLoggingOut,
    lang,
    pdfExport.handleExportPdf,
    setConsoleLang,
    setView,
    toast,
    user,
    billingProfiles.refresh,
    workspace.invoice,
    workspace.isExporting,
    workspace.lastSavedTime,
    workspace.saveStatus,
  ]);

  return {
    contextValue,
    dashboardShellProps,
    printAreaRef,
    invoice: workspace.invoice,
    template: workspace.template,
    isHeaderReversed: workspace.isHeaderReversed,
    lang,
  };
}

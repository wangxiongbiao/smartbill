"use client";

import { useCallback, useMemo, useState } from 'react';

export function useEditorUiState() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [isNewInvoiceConfirmOpen, setIsNewInvoiceConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const openAIChat = useCallback(() => setIsAIChatOpen(true), []);
  const closeAIChat = useCallback(() => setIsAIChatOpen(false), []);
  const toggleAIChat = useCallback(() => setIsAIChatOpen((value) => !value), []);
  const openShareDialog = useCallback(() => setIsShareDialogOpen(true), []);
  const closeShareDialog = useCallback(() => setIsShareDialogOpen(false), []);
  const openEmailDialog = useCallback(() => setIsEmailDialogOpen(true), []);
  const closeEmailDialog = useCallback(() => setIsEmailDialogOpen(false), []);
  const openSaveTemplateDialog = useCallback(() => setIsSaveTemplateDialogOpen(true), []);
  const closeSaveTemplateDialog = useCallback(() => setIsSaveTemplateDialogOpen(false), []);
  const openNewInvoiceConfirm = useCallback(() => setIsNewInvoiceConfirmOpen(true), []);
  const closeNewInvoiceConfirm = useCallback(() => setIsNewInvoiceConfirmOpen(false), []);
  const openLogoutConfirm = useCallback(() => setIsLogoutConfirmOpen(true), []);
  const closeLogoutConfirm = useCallback(() => setIsLogoutConfirmOpen(false), []);

  return useMemo(() => ({
    isAIChatOpen,
    isShareDialogOpen,
    isEmailDialogOpen,
    isSaveTemplateDialogOpen,
    isNewInvoiceConfirmOpen,
    isLogoutConfirmOpen,
    openAIChat,
    closeAIChat,
    toggleAIChat,
    openShareDialog,
    closeShareDialog,
    openEmailDialog,
    closeEmailDialog,
    openSaveTemplateDialog,
    closeSaveTemplateDialog,
    openNewInvoiceConfirm,
    closeNewInvoiceConfirm,
    openLogoutConfirm,
    closeLogoutConfirm,
  }), [
    closeAIChat,
    closeEmailDialog,
    closeLogoutConfirm,
    closeNewInvoiceConfirm,
    closeSaveTemplateDialog,
    closeShareDialog,
    isAIChatOpen,
    isEmailDialogOpen,
    isLogoutConfirmOpen,
    isNewInvoiceConfirmOpen,
    isSaveTemplateDialogOpen,
    isShareDialogOpen,
    openAIChat,
    openEmailDialog,
    openLogoutConfirm,
    openNewInvoiceConfirm,
    openSaveTemplateDialog,
    openShareDialog,
    toggleAIChat,
  ]);
}

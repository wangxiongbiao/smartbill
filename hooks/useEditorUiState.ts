"use client";

import { useState } from 'react';

export function useEditorUiState() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [isNewInvoiceConfirmOpen, setIsNewInvoiceConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  return {
    isAIChatOpen,
    isShareDialogOpen,
    isEmailDialogOpen,
    isSaveTemplateDialogOpen,
    isNewInvoiceConfirmOpen,
    isLogoutConfirmOpen,
    openAIChat: () => setIsAIChatOpen(true),
    closeAIChat: () => setIsAIChatOpen(false),
    toggleAIChat: () => setIsAIChatOpen((v) => !v),
    openShareDialog: () => setIsShareDialogOpen(true),
    closeShareDialog: () => setIsShareDialogOpen(false),
    openEmailDialog: () => setIsEmailDialogOpen(true),
    closeEmailDialog: () => setIsEmailDialogOpen(false),
    openSaveTemplateDialog: () => setIsSaveTemplateDialogOpen(true),
    closeSaveTemplateDialog: () => setIsSaveTemplateDialogOpen(false),
    openNewInvoiceConfirm: () => setIsNewInvoiceConfirmOpen(true),
    closeNewInvoiceConfirm: () => setIsNewInvoiceConfirmOpen(false),
    openLogoutConfirm: () => setIsLogoutConfirmOpen(true),
    closeLogoutConfirm: () => setIsLogoutConfirmOpen(false),
  };
}

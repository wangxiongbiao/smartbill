import type React from 'react';
import type { Invoice, InvoiceTemplate, Language, TemplateCategory, TemplateType, User, ViewType } from '@/types';

export type ToastLevel = 'success' | 'error' | 'warning' | 'info';

export interface RecordsViewState {
  searchQuery: string;
  selectedMonth: 'all' | number;
  currentPage: number;
  scrollTop: number;
}

export interface AppShellContextValue {
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
  recordsViewState: RecordsViewState;
  setRecordsViewState: React.Dispatch<React.SetStateAction<RecordsViewState>>;
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
  isLogoutConfirmOpen: boolean;
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
  openLogoutConfirm: () => void;
  closeLogoutConfirm: () => void;
  setView: (view: ViewType) => void;
  openInvoice: (record: Invoice) => void;
  createInvoice: () => Promise<void>;
  duplicateInvoice: (record: Invoice) => Promise<void>;
  useTemplateAndCreateInvoice: (template: InvoiceTemplate) => Promise<void>;
  openTemplateDetail: (template: InvoiceTemplate) => void;
  closeTemplateDetail: () => void;
  updateInvoice: (updates: Partial<Invoice>) => void;
  saveAsTemplate: (name: string, description: string, templateType: TemplateCategory) => Promise<void>;
  confirmCreateInvoice: () => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  exportInvoice: (record: Invoice) => void;
  exportLatest: () => void;
  exportPdf: () => void;
  logout: () => Promise<void>;
  refreshRecords: () => Promise<void>;
  refreshBillingProfiles: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  ensureTemplatesLoaded: () => Promise<void>;
  getTemplateFromCache: (id: string) => InvoiceTemplate | null;
  ensureTemplateLoaded: (id: string) => Promise<InvoiceTemplate | null>;
  deleteTemplateById: (id: string) => Promise<void>;
  bumpTemplateUsageAndRefresh: (id: string) => Promise<void>;
}

export const PRIVATE_VIEWS: ViewType[] = ['records', 'profile', 'editor', 'templates', 'template-detail', 'school-records', 'school-editor'];

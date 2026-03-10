import type { Invoice, Language, User, ViewType } from '@/types';

export interface DashboardShellProps {
  user: User | null;
  lang: Language;
  activeView: ViewType;
  invoice: Invoice;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedTime?: Date;
  isExporting: boolean;
  onSetView: (view: ViewType) => void;
  onSetLang: (lang: Language) => void;
  onLogout: () => void;
  onNewInvoice: () => void;
  onExportPdf: () => void;
  onSaveTemplate: () => void;
  onShare: () => void;
  onSendEmail: () => void;
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean };
  onCloseToast: () => void;
  printArea: React.ReactNode;
  children: React.ReactNode;
}

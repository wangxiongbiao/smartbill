import type { Invoice, Language, User, ViewType } from '@/types';

export interface DashboardShellEditorState {
  invoice?: Invoice;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedTime?: Date;
  isExporting?: boolean;
  onExportPdf?: () => void;
  onSaveTemplate?: () => void;
  onShare?: () => void;
  onSendEmail?: () => void;
  onBack?: () => void;
  printArea?: React.ReactNode;
}

export interface DashboardShellProps {
  user: User | null;
  lang: Language;
  activeView: ViewType;
  onSetView: (view: ViewType) => void;
  onSetLang: (lang: Language) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  isLogoutConfirmOpen: boolean;
  onCloseLogoutConfirm: () => void;
  onConfirmLogout: () => void;
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean };
  onCloseToast: () => void;
  editorState?: DashboardShellEditorState | null;
  children: React.ReactNode;
}

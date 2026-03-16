import type React from 'react';
import type { DashboardShellEditorState } from '@/components/app/DashboardShellProps';
import type { Language, User, ViewType } from '@/types';

export type ToastLevel = 'success' | 'error' | 'warning' | 'info';

export interface RecordsViewState {
  searchQuery: string;
  selectedMonth: 'all' | number;
  currentPage: number;
  scrollTop: number;
  shellScrollTop: number;
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
  toast: { message: string; type: ToastLevel; isVisible: boolean };
  showToast: (message: string, type: ToastLevel) => void;
  hideToast: () => void;
  isLogoutConfirmOpen: boolean;
  openLogoutConfirm: () => void;
  closeLogoutConfirm: () => void;
  setView: (view: ViewType) => void;
  navigateToView: (view: ViewType, options?: { templateId?: string; invoiceId?: string }) => void;
  logout: () => Promise<void>;
  editorState: DashboardShellEditorState | null;
  setEditorState: React.Dispatch<React.SetStateAction<DashboardShellEditorState | null>>;
}

export const PRIVATE_VIEWS: ViewType[] = ['home', 'records', 'profile', 'editor', 'templates', 'template-detail', 'school-records', 'school-editor'];

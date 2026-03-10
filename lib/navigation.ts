import { translations } from '@/i18n';
import type { Language, ViewType } from '@/types';

export interface NavItemConfig {
  id: ViewType;
  label: string;
  icon: string;
  activeIcon?: string;
}

export function getPrimaryNavItems(lang: Language): NavItemConfig[] {
  const t = translations[lang] || translations.en;

  return [
    { id: 'home', label: t.home || 'Dashboard', icon: 'fas fa-table-columns', activeIcon: 'fa-home' },
    { id: 'records', label: t.records || 'Invoices', icon: 'fas fa-file-invoice', activeIcon: 'fa-file-invoice' },
    { id: 'editor', label: t.make || 'New', icon: 'fas fa-plus-circle', activeIcon: 'fa-plus-circle' },
    { id: 'templates', label: t.myTemplates || 'Templates', icon: 'fas fa-file-contract', activeIcon: 'fa-file-contract' },
    { id: 'profile', label: t.profile || 'Settings', icon: 'fas fa-user', activeIcon: 'fa-user' },
  ];
}

export function isNavItemActive(itemId: ViewType, activeView: ViewType) {
  return activeView === itemId
    || (itemId === 'records' && activeView === 'editor')
    || (itemId === 'templates' && activeView === 'template-detail');
}

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
    { id: 'home', label: t.home || 'Dashboard', icon: 'fas fa-chart-line', activeIcon: 'fa-chart-line' },
    { id: 'records', label: t.records || 'Invoices', icon: 'fas fa-folder-open', activeIcon: 'fa-folder-open' },
    { id: 'editor', label: t.make || 'New', icon: 'fas fa-plus', activeIcon: 'fa-plus' },
    { id: 'templates', label: t.myTemplates || 'Templates', icon: 'fas fa-layer-group', activeIcon: 'fa-layer-group' },
    { id: 'profile', label: t.accountSettingsNav || t.profile || 'Settings', icon: 'fas fa-user-gear', activeIcon: 'fa-user-gear' },
  ];
}

export function isNavItemActive(itemId: ViewType, activeView: ViewType) {
  return activeView === itemId
    || (itemId === 'records' && activeView === 'editor')
    || (itemId === 'templates' && activeView === 'template-detail');
}

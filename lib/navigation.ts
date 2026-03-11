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
  const labels = lang === 'en'
    ? {
        home: 'Dashboard',
        records: 'Invoice',
        templates: 'Templates',
        profile: 'Account',
        editor: 'New',
      }
    : {
        home: t.home || 'Dashboard',
        records: t.records || 'Invoices',
        templates: t.myTemplates || 'Templates',
        profile: t.profile || t.accountSettingsNav || 'Account',
        editor: t.make || 'New',
      };

  return [
    { id: 'home', label: labels.home, icon: 'fas fa-house', activeIcon: 'fas fa-house' },
    { id: 'records', label: labels.records, icon: 'fas fa-folder-open', activeIcon: 'fas fa-folder-open' },
    { id: 'editor', label: labels.editor, icon: 'fas fa-plus', activeIcon: 'fas fa-plus' },
    { id: 'templates', label: labels.templates, icon: 'fas fa-layer-group', activeIcon: 'fas fa-layer-group' },
    { id: 'profile', label: labels.profile, icon: 'fas fa-user-tie', activeIcon: 'fas fa-user-tie' },
  ];
}

export function isNavItemActive(itemId: ViewType, activeView: ViewType) {
  return activeView === itemId
    || (itemId === 'records' && activeView === 'editor')
    || (itemId === 'templates' && activeView === 'template-detail');
}

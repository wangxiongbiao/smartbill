import type { ViewType } from '@/types';

export const ROUTE_BY_VIEW: Partial<Record<ViewType, string>> = {
  home: '/dashboard',
  records: '/invoices',
  templates: '/templates',
  profile: '/settings',
  editor: '/invoices/new',
};

export function getViewFromPath(pathname: string): ViewType {
  if (pathname === '/dashboard') return 'home';
  if (pathname === '/invoices') return 'records';
  if (pathname === '/invoices/new' || pathname.startsWith('/invoices/')) return 'editor';
  if (pathname === '/templates') return 'templates';
  if (pathname.startsWith('/templates/')) return 'template-detail';
  if (pathname === '/settings') return 'profile';
  return 'home';
}

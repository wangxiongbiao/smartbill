"use client";

import { useEffect, useState } from 'react';
import { bumpTemplateUsage } from '@/lib/api/template';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import TemplatesView from '@/components/TemplatesView';
import { usePaginatedTemplates } from '@/hooks/usePaginatedTemplates';
import { useTemplateStore } from '@/hooks/useTemplateStore';
import { TEMPLATES_PAGE_SIZE } from '@/lib/pagination';
import { DEFAULT_TEMPLATE_TYPE, normalizeTemplateType } from '@/lib/template-types';

const TEMPLATES_VIEW_STATE_KEY = 'smartbill-templates-view-state';

export default function TemplatesRoute() {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const [templatesViewState, setTemplatesViewState] = useState({
    activeCategory: DEFAULT_TEMPLATE_TYPE,
    currentPage: 1,
  });
  const templateStore = useTemplateStore({
    userId,
    pathname: '/templates',
    showToast: app.showToast,
  });
  const paginatedTemplates = usePaginatedTemplates({
    userId,
    page: templatesViewState.currentPage,
    pageSize: TEMPLATES_PAGE_SIZE,
    templateType: templatesViewState.activeCategory,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(TEMPLATES_VIEW_STATE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setTemplatesViewState((prev) => ({
        activeCategory: normalizeTemplateType(parsed.activeCategory) || prev.activeCategory,
        currentPage: typeof parsed.currentPage === 'number' && parsed.currentPage > 0 ? parsed.currentPage : prev.currentPage,
      }));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(TEMPLATES_VIEW_STATE_KEY, JSON.stringify(templatesViewState));
    } catch {}
  }, [templatesViewState]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(paginatedTemplates.totalCount / TEMPLATES_PAGE_SIZE));
    setTemplatesViewState((prev) => (
      prev.currentPage > totalPages
        ? { ...prev, currentPage: totalPages }
        : prev
    ));
  }, [paginatedTemplates.totalCount]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={5} />;
  if (paginatedTemplates.loading && paginatedTemplates.templates.length === 0) return <ContentSkeleton blocks={5} />;

  return (
    <TemplatesView
      lang={app.lang}
      templates={paginatedTemplates.templates}
      totalCount={paginatedTemplates.totalCount}
      overallCount={paginatedTemplates.overallCount}
      activeCategory={templatesViewState.activeCategory}
      currentPage={templatesViewState.currentPage}
      loading={paginatedTemplates.loading && paginatedTemplates.templates.length === 0}
      isPageLoading={paginatedTemplates.loading && paginatedTemplates.templates.length > 0}
      onActiveCategoryChange={(activeCategory) => {
        setTemplatesViewState({ activeCategory, currentPage: 1 });
      }}
      onCurrentPageChange={(currentPage) => {
        setTemplatesViewState((prev) => ({ ...prev, currentPage }));
      }}
      onUseTemplate={async (template) => {
        await bumpTemplateUsage(template.id);
        app.navigateToView('editor', { invoiceId: 'new' });
        window.location.assign(`/invoices/new?template=${encodeURIComponent(template.id)}`);
      }}
      onViewDetail={(template) => app.navigateToView('template-detail', { templateId: template.id })}
      onDeleteTemplate={async (template) => {
        await templateStore.deleteTemplateById(template.id);
        paginatedTemplates.refresh();
      }}
      onNewDoc={() => app.navigateToView('editor')}
    />
  );
}

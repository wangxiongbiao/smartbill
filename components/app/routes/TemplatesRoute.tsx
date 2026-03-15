"use client";

import { useEffect } from 'react';
import { bumpTemplateUsage } from '@/lib/api/template';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import TemplatesView from '@/components/TemplatesView';
import { useTemplateStore } from '@/hooks/useTemplateStore';

export default function TemplatesRoute() {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const templateStore = useTemplateStore({
    userId,
    pathname: '/templates',
    showToast: app.showToast,
  });

  useEffect(() => {
    if (!userId) return;
    templateStore.ensureTemplatesLoaded().catch((error) => {
      console.error('Failed to load templates:', error);
    });
  }, [templateStore.ensureTemplatesLoaded, userId]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={5} />;
  if (templateStore.templatesLoading && templateStore.templates.length === 0) return <ContentSkeleton blocks={5} />;

  return (
    <TemplatesView
      lang={app.lang}
      templates={templateStore.templates}
      loading={templateStore.templatesLoading && templateStore.templates.length === 0}
      onUseTemplate={async (template) => {
        await bumpTemplateUsage(template.id);
        app.navigateToView('editor', { invoiceId: 'new' });
        window.location.assign(`/invoices/new?template=${encodeURIComponent(template.id)}`);
      }}
      onViewDetail={(template) => app.navigateToView('template-detail', { templateId: template.id })}
      onDeleteTemplate={async (template) => {
        await templateStore.deleteTemplateById(template.id);
      }}
      onNewDoc={() => app.navigateToView('editor')}
      onRefresh={templateStore.refreshTemplates}
    />
  );
}

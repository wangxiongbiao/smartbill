"use client";

import { useEffect } from 'react';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import TemplatesView from '@/components/TemplatesView';

export default function TemplatesRoute() {
  const app = useAppShell();
  const { ensureTemplatesLoaded } = app;

  useEffect(() => {
    if (!app.user) return;
    ensureTemplatesLoaded().catch((error) => {
      console.error('Failed to load templates:', error);
    });
  }, [app.user, ensureTemplatesLoaded]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={5} />;
  if (app.templatesLoading && app.templates.length === 0) return <ContentSkeleton blocks={5} />;

  return (
    <TemplatesView
      lang={app.lang}
      templates={app.templates}
      loading={app.templatesLoading && app.templates.length === 0}
      onUseTemplate={app.useTemplateAndCreateInvoice}
      onViewDetail={app.openTemplateDetail}
      onDeleteTemplate={async (template) => {
        await app.deleteTemplateById(template.id);
      }}
      onNewDoc={app.createInvoice}
      onRefresh={app.refreshTemplates}
    />
  );
}

"use client";

import { useEffect, useMemo } from 'react';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import TemplateDetailScreen from '@/components/app/TemplateDetailScreen';

export default function TemplateDetailRoute({ templateId }: { templateId: string }) {
  const app = useAppShell();
  const { getTemplateFromCache, ensureTemplateLoaded } = app;
  const template = useMemo(() => getTemplateFromCache(templateId), [getTemplateFromCache, templateId]);

  useEffect(() => {
    if (!app.user) return;
    ensureTemplateLoaded(templateId).catch((error) => {
      console.error('Failed to load template detail:', error);
    });
  }, [app.user, ensureTemplateLoaded, templateId]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={4} />;
  if (app.templateDetailLoading && !template) return <ContentSkeleton blocks={4} />;

  return (
    <TemplateDetailScreen
      templateId={templateId}
      template={template}
      loading={app.templateDetailLoading && !template}
      lang={app.lang}
      onUseTemplate={app.useTemplateAndCreateInvoice}
      onBack={app.closeTemplateDetail}
      onDelete={app.deleteTemplateById}
      showToast={app.showToast}
    />
  );
}

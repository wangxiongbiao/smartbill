"use client";

import { useEffect, useMemo } from 'react';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import TemplateDetailScreen from '@/components/app/TemplateDetailScreen';
import { useTemplateStore } from '@/hooks/useTemplateStore';

export default function TemplateDetailRoute({ templateId }: { templateId: string }) {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const templateStore = useTemplateStore({
    userId,
    pathname: `/templates/${templateId}`,
    onDeletedCurrent: () => app.setView('templates'),
    showToast: app.showToast,
  });
  const template = useMemo(() => templateStore.getTemplateFromCache(templateId), [templateStore.getTemplateFromCache, templateId]);

  useEffect(() => {
    if (!userId) return;
    templateStore.ensureTemplateLoaded(templateId).catch((error) => {
      console.error('Failed to load template detail:', error);
    });
  }, [templateId, templateStore.ensureTemplateLoaded, userId]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={4} />;
  if (templateStore.templateDetailLoading && !template) return <ContentSkeleton blocks={4} />;

  return (
    <TemplateDetailScreen
      templateId={templateId}
      template={template}
      loading={templateStore.templateDetailLoading && !template}
      lang={app.lang}
      onUseTemplate={async () => {
        window.location.assign(`/invoices/new?template=${encodeURIComponent(templateId)}`);
      }}
      onBack={() => app.setView('templates')}
      onDelete={templateStore.deleteTemplateById}
      showToast={app.showToast}
    />
  );
}

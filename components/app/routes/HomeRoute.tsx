"use client";

import HomeView from '@/components/HomeView';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import { useAppShell } from '@/components/app/AppShellClient';

export default function HomeRoute() {
  const app = useAppShell();

  if (app.isBootstrapping) return <ContentSkeleton blocks={4} />;

  return (
    <HomeView
      records={app.records}
      lang={app.lang}
      onCreateEmpty={app.createInvoice}
      onOpenRecords={() => app.setView('records')}
      onOpenTemplates={() => app.setView('templates')}
      onOpenAI={app.openAIChat}
      onExportLatest={app.exportLatest}
    />
  );
}

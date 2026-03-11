"use client";

import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import RecordsView from '@/components/RecordsView';

export default function RecordsRoute() {
  const app = useAppShell();

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={5} />;
  if (app.recordsLoading && app.records.length === 0) return <ContentSkeleton blocks={5} />;

  return (
    <RecordsView
      records={app.records}
      lang={app.lang}
      isDeletingId={app.isDeletingId}
      onEdit={app.openInvoice}
      onDelete={app.deleteInvoice}
      onExport={app.exportInvoice}
      onNewDoc={app.createInvoice}
    />
  );
}

"use client";

import { useEffect } from 'react';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import ProfileView from '@/components/ProfileView';
import { useInvoiceRecordsStore } from '@/hooks/useInvoiceRecordsStore';
import { useTemplateCount } from '@/hooks/useTemplateCount';

export default function ProfileRoute() {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const recordsStore = useInvoiceRecordsStore({ userId });
  const templateCount = useTemplateCount(userId);

  useEffect(() => {
    if (!userId) return;

    recordsStore.refreshRecords().catch((error) => {
      console.error('Failed to sync records for profile view:', error);
    });
  }, [recordsStore.refreshRecords, userId]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={3} />;

  return (
    <ProfileView
      records={recordsStore.records}
      templatesCount={templateCount.count}
      user={app.user}
      onLogout={app.openLogoutConfirm}
      onUpdateUser={app.setUser}
      onRefreshBillingProfiles={async () => undefined}
      lang={app.lang}
      showToast={app.showToast}
    />
  );
}

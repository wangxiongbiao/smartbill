"use client";

import { useEffect } from 'react';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import ProfileView from '@/components/ProfileView';
import { useInvoiceRecordsStore } from '@/hooks/useInvoiceRecordsStore';
import { useTemplateStore } from '@/hooks/useTemplateStore';

export default function ProfileRoute() {
  const app = useAppShell();
  const userId = app.user?.id ?? null;
  const recordsStore = useInvoiceRecordsStore({ userId });
  const templateStore = useTemplateStore({
    userId,
    pathname: '/settings',
    showToast: app.showToast,
  });

  useEffect(() => {
    if (!userId) return;

    recordsStore.syncRecordsForUser(userId).catch((error) => {
      console.error('Failed to sync records for profile view:', error);
    });
    templateStore.ensureTemplatesLoaded().catch((error) => {
      console.error('Failed to load templates for profile view:', error);
    });
  }, [recordsStore.syncRecordsForUser, templateStore.ensureTemplatesLoaded, userId]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={3} />;

  return (
    <ProfileView
      records={recordsStore.records}
      templatesCount={templateStore.templates.length}
      user={app.user}
      onLogout={app.openLogoutConfirm}
      onUpdateUser={app.setUser}
      onRefreshBillingProfiles={async () => undefined}
      lang={app.lang}
      showToast={app.showToast}
    />
  );
}

"use client";

import { useEffect } from 'react';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import ProfileView from '@/components/ProfileView';

export default function ProfileRoute() {
  const app = useAppShell();
  const { ensureTemplatesLoaded } = app;

  useEffect(() => {
    ensureTemplatesLoaded().catch((error) => {
      console.error('Failed to load templates for profile view:', error);
    });
  }, [ensureTemplatesLoaded]);

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={3} />;

  return (
    <ProfileView
      records={app.records}
      templatesCount={app.templates.length}
      user={app.user}
      onLogout={app.openLogoutConfirm}
      onUpdateUser={app.setUser}
      onRefreshBillingProfiles={app.refreshBillingProfiles}
      lang={app.lang}
      showToast={app.showToast}
    />
  );
}

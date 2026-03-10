"use client";

import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import ProfileView from '@/components/ProfileView';

export default function ProfileRoute() {
  const app = useAppShell();

  if (app.isBootstrapping || !app.user) return <ContentSkeleton blocks={3} />;

  return (
    <ProfileView
      recordsCount={app.records.length}
      user={app.user}
      onLogout={app.logout}
      onUpdateUser={app.setUser}
      lang={app.lang}
      showToast={app.showToast}
    />
  );
}

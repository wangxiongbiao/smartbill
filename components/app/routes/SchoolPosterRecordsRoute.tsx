"use client";

import { useRouter } from 'next/navigation';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import SchoolPosterRecordsView from '@/components/SchoolPosterRecordsView';
import { useSchoolPosters } from '@/hooks/useSchoolPosters';

export default function SchoolPosterRecordsRoute() {
  const app = useAppShell();
  const router = useRouter();
  const posters = useSchoolPosters({ userId: app.user?.id });

  if (app.isBootstrapping || !app.user || !posters.isHydrated) return <ContentSkeleton blocks={5} />;

  return (
    <SchoolPosterRecordsView
      records={posters.records}
      lang={app.lang}
      onCreate={() => {
        const next = posters.createPoster();
        router.push(`/school-posters/${next.id}`);
      }}
      onEdit={(record) => {
        router.push(`/school-posters/${record.id}`);
      }}
      onDuplicate={(record) => {
        const duplicate = posters.duplicatePoster(record);
        app.showToast(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '已复制院校海报' : 'School poster duplicated', 'success');
        router.push(`/school-posters/${duplicate.id}`);
      }}
      onDelete={(record) => {
        const confirmed = window.confirm(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? `确认删除 ${record.shell.school.nameCn} 吗？` : `Delete ${record.shell.school.nameEn}?`);
        if (!confirmed) return;
        posters.deletePoster(record.id);
        app.showToast(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '已删除院校海报' : 'School poster deleted', 'success');
      }}
    />
  );
}

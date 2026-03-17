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
      onCreate={async () => {
        try {
          const next = await posters.createPoster();
          router.push(`/school-posters/${next.id}`);
        } catch (error) {
          console.error('Failed to create school poster:', error);
          app.showToast(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '新建海报失败' : 'Failed to create school poster', 'error');
        }
      }}
      onEdit={(record) => {
        router.push(`/school-posters/${record.id}`);
      }}
      onDuplicate={async (record) => {
        try {
          const duplicate = await posters.duplicatePoster(record);
          app.showToast(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '已复制院校海报' : 'School poster duplicated', 'success');
          router.push(`/school-posters/${duplicate.id}`);
        } catch (error) {
          console.error('Failed to duplicate school poster:', error);
          app.showToast(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '复制海报失败' : 'Failed to duplicate school poster', 'error');
        }
      }}
      onDelete={async (record) => {
        const confirmed = window.confirm(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? `确认删除 ${record.shell.school.nameCn} 吗？` : `Delete ${record.shell.school.nameEn}?`);
        if (!confirmed) return;

        try {
          await posters.deletePoster(record.id);
          app.showToast(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '已删除院校海报' : 'School poster deleted', 'success');
        } catch (error) {
          console.error('Failed to delete school poster:', error);
          app.showToast(app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '删除海报失败' : 'Failed to delete school poster', 'error');
        }
      }}
    />
  );
}

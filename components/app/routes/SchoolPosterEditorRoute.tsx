"use client";

import { useRouter } from 'next/navigation';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import SchoolPosterEditor from '@/components/SchoolPosterEditor';
import { useSchoolPosters } from '@/hooks/useSchoolPosters';

interface SchoolPosterEditorRouteProps {
  posterId: string;
}

export default function SchoolPosterEditorRoute({ posterId }: SchoolPosterEditorRouteProps) {
  const app = useAppShell();
  const router = useRouter();
  const posters = useSchoolPosters({ userId: app.user?.id });
  const poster = posters.getPoster(posterId);

  if (app.isBootstrapping || !app.user || !posters.isHydrated) return <ContentSkeleton blocks={4} />;

  if (!poster) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <i className="fas fa-triangle-exclamation text-2xl"></i>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-900">
            {app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '没有找到这个院校海报' : 'School poster not found'}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            {app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '这条记录可能已经被删除，或者当前浏览器里还没有这份本地数据。' : 'This record may have been deleted, or the local data is not available in this browser.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/school-posters')}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {app.lang === 'zh-CN' || app.lang === 'zh-TW' ? '返回列表' : 'Back to list'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <SchoolPosterEditor
      poster={poster}
      lang={app.lang}
      onChange={posters.savePoster}
      onBack={() => router.push('/school-posters')}
    />
  );
}

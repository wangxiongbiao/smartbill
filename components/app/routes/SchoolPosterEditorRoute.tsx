"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppShell } from '@/components/app/AppShellClient';
import ContentSkeleton from '@/components/app/ContentSkeleton';
import SchoolPosterEditor from '@/components/SchoolPosterEditor';
import { useSchoolPosters } from '@/hooks/useSchoolPosters';
import type { SchoolPoster } from '@/types';

interface SchoolPosterEditorRouteProps {
  posterId: string;
}

export default function SchoolPosterEditorRoute({ posterId }: SchoolPosterEditorRouteProps) {
  const app = useAppShell();
  const {
    isBootstrapping,
    user,
    lang,
    showToast,
    setEditorState,
  } = app;
  const router = useRouter();
  const posters = useSchoolPosters({ userId: user?.id });
  const poster = posters.getPoster(posterId);
  const [draftPoster, setDraftPoster] = useState<SchoolPoster | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipNextAutoSaveRef = useRef(false);
  const isPersistingRef = useRef(false);
  const queuedPersistPosterRef = useRef<SchoolPoster | null>(null);
  const latestPosterRef = useRef<SchoolPoster | null>(null);
  const hasPendingChangesRef = useRef(false);
  const lastSaveErrorToastAtRef = useRef(0);

  useEffect(() => {
    latestPosterRef.current = draftPoster;
  }, [draftPoster]);

  useEffect(() => {
    if (!poster) return;
    if (draftPoster?.id === poster.id) return;

    skipNextAutoSaveRef.current = true;
    setDraftPoster(poster);
    setSaveStatus('idle');
    setLastSavedTime(undefined);
    hasPendingChangesRef.current = false;
  }, [draftPoster?.id, poster]);

  const persistPoster = useCallback(async (targetPoster: SchoolPoster) => {
    if (!user?.id || !targetPoster.id) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    queuedPersistPosterRef.current = targetPoster;
    if (isPersistingRef.current) return;

    isPersistingRef.current = true;
    try {
      while (queuedPersistPosterRef.current) {
        const pendingPoster = queuedPersistPosterRef.current;
        queuedPersistPosterRef.current = null;

        setSaveStatus('saving');
        try {
          await posters.savePoster(pendingPoster);
          setSaveStatus('saved');
          setLastSavedTime(new Date());
        } catch (error) {
          console.error('School poster auto-save failed:', error);
          setSaveStatus('error');
          const now = Date.now();
          if (now - lastSaveErrorToastAtRef.current > 5000) {
            lastSaveErrorToastAtRef.current = now;
            showToast(lang === 'zh-CN' || lang === 'zh-TW' ? '海报自动保存失败，请检查网络后重试' : 'Auto-save failed. Please check your network and try again.', 'error');
          }
          throw error;
        }
      }

      hasPendingChangesRef.current = false;
    } finally {
      isPersistingRef.current = false;
    }
  }, [lang, posters.savePoster, showToast, user?.id]);

  const scheduleAutoSave = useCallback((targetPoster: SchoolPoster) => {
    if (!user?.id) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }

    hasPendingChangesRef.current = true;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      persistPoster(targetPoster).catch(() => undefined);
    }, 1500);
  }, [persistPoster, user?.id]);

  const flushAutoSave = useCallback(async () => {
    if (!user?.id) return;
    if (!hasPendingChangesRef.current) return;
    if (!latestPosterRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    await persistPoster(latestPosterRef.current);
  }, [persistPoster, user?.id]);

  useEffect(() => {
    if (!draftPoster) return;
    scheduleAutoSave(draftPoster);
  }, [draftPoster, scheduleAutoSave]);

  useEffect(() => {
    return () => {
      flushAutoSave().catch(() => undefined);
    };
  }, [flushAutoSave]);

  const handleBack = useCallback(() => {
    flushAutoSave().catch(() => undefined);
    router.push('/school-posters');
  }, [flushAutoSave, router]);

  useEffect(() => {
    setEditorState({
      saveStatus,
      lastSavedTime,
      onBack: handleBack,
    });

    return () => {
      setEditorState(null);
    };
  }, [handleBack, lastSavedTime, saveStatus, setEditorState]);

  const isHydratingPoster = useMemo(() => {
    if (!poster) return false;
    return !draftPoster || draftPoster.id !== poster.id;
  }, [draftPoster, poster]);

  if (isBootstrapping || !user || !posters.isHydrated || isHydratingPoster) {
    return <ContentSkeleton blocks={4} />;
  }

  if (!poster || !draftPoster) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <i className="fas fa-triangle-exclamation text-2xl"></i>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-900">
            {lang === 'zh-CN' || lang === 'zh-TW' ? '没有找到这个院校海报' : 'School poster not found'}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            {lang === 'zh-CN' || lang === 'zh-TW'
              ? '这条记录可能已经被删除，或者当前账号下还没有这份云端数据。'
              : 'This record may have been deleted, or it is not available in your cloud data.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/school-posters')}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {lang === 'zh-CN' || lang === 'zh-TW' ? '返回列表' : 'Back to list'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <SchoolPosterEditor
      poster={draftPoster}
      lang={lang}
      onChange={(nextPoster) => {
        setDraftPoster(nextPoster);
      }}
      onBack={handleBack}
    />
  );
}

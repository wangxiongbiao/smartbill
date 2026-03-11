'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listBillingProfiles } from '@/lib/api/billing-profiles';
import type { BillingProfile, Language } from '@/types';

interface UseBillingProfilesParams {
  userId?: string;
  refreshKey?: string;
  lang: Language;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useBillingProfiles(params: UseBillingProfilesParams) {
  const { userId, refreshKey, lang, showToast } = params;
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfiles([]);
      return;
    }

    setIsLoading(true);
    try {
      const { profiles: nextProfiles } = await listBillingProfiles();
      setProfiles(nextProfiles);
    } catch (error) {
      console.error('Failed to load billing profiles:', error);
      const errorMessageByLang = {
        en: 'Failed to load saved billing profiles',
        'zh-CN': '读取已保存抬头与客户资料失败',
        'zh-TW': '已保存抬頭與客戶資料讀取失敗',
        th: 'โหลดข้อมูลผู้วางบิลและลูกค้าที่บันทึกไว้ไม่สำเร็จ',
        id: 'Gagal memuat profil penagihan yang tersimpan',
      } satisfies Record<Language, string>;
      showToast?.(
        errorMessageByLang[lang],
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [lang, showToast, userId]);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh, refreshKey]);

  const senderProfiles = useMemo(
    () => profiles.filter((profile) => profile.kind === 'sender'),
    [profiles]
  );

  const clientProfiles = useMemo(
    () => profiles.filter((profile) => profile.kind === 'client'),
    [profiles]
  );

  return {
    profiles,
    senderProfiles,
    clientProfiles,
    isLoading,
    refresh,
  };
}

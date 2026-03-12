'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { matchesBillingProfile } from '@/lib/billing-profiles';
import type { BillingProfile, BillingProfileKind, Language } from '@/types';

interface BillingProfileNameInputProps {
  kind: BillingProfileKind;
  lang: Language;
  value: string;
  placeholder: string;
  profiles: BillingProfile[];
  isLoading: boolean;
  onChange: (value: string) => void;
  onSelect: (profile: BillingProfile) => void;
}

function getCopy(lang: Language, kind: BillingProfileKind) {
  const copyByLang = {
    en: {
      title: kind === 'sender' ? 'Saved bill-from profiles' : 'Saved bill-to profiles',
      empty: kind === 'sender' ? 'No saved bill-from profiles yet' : 'No saved bill-to profiles yet',
      loading: 'Loading...',
      defaultBadge: 'Default',
    },
    'zh-CN': {
      title: kind === 'sender' ? '已保存抬头' : '已保存客户',
      empty: kind === 'sender' ? '暂无已保存抬头' : '暂无已保存客户',
      loading: '加载中...',
      defaultBadge: '默认',
    },
    'zh-TW': {
      title: kind === 'sender' ? '已保存抬頭' : '已保存客戶',
      empty: kind === 'sender' ? '暫無已保存抬頭' : '暫無已保存客戶',
      loading: '載入中...',
      defaultBadge: '預設',
    },
    th: {
      title: kind === 'sender' ? 'ข้อมูลผู้วางบิลที่บันทึกไว้' : 'ข้อมูลลูกค้าที่บันทึกไว้',
      empty: kind === 'sender' ? 'ยังไม่มีข้อมูลผู้วางบิลที่บันทึกไว้' : 'ยังไม่มีข้อมูลลูกค้าที่บันทึกไว้',
      loading: 'กำลังโหลด...',
      defaultBadge: 'ค่าเริ่มต้น',
    },
    id: {
      title: kind === 'sender' ? 'Profil penagih tersimpan' : 'Profil klien tersimpan',
      empty: kind === 'sender' ? 'Belum ada profil penagih tersimpan' : 'Belum ada profil klien tersimpan',
      loading: 'Memuat...',
      defaultBadge: 'Default',
    },
  } satisfies Record<Language, {
    title: string;
    empty: string;
    loading: string;
    defaultBadge: string;
  }>;

  return copyByLang[lang];
}

export default function BillingProfileNameInput(props: BillingProfileNameInputProps) {
  const { kind, lang, value, placeholder, profiles, isLoading, onChange, onSelect } = props;
  const copy = getCopy(lang, kind);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProfiles = useMemo(() => {
    if (!value.trim()) return profiles.slice(0, 8);
    return profiles.filter((profile) => matchesBillingProfile(profile, value)).slice(0, 8);
  }, [profiles, value]);

  return (
    <div className="relative" ref={rootRef}>
      <input
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false);
        }}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
      />

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)]">
          <div className="border-b border-slate-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {copy.title}
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {isLoading ? (
              <div className="px-3 py-4 text-sm text-slate-500">{copy.loading}</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-500">{copy.empty}</div>
            ) : (
              filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(profile);
                    setIsOpen(false);
                  }}
                  className="flex w-full flex-col gap-1 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">{profile.name || profile.email || profile.phone || profile.address}</span>
                    {kind === 'sender' && profile.isDefault && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        {copy.defaultBadge}
                      </span>
                    )}
                  </div>
                  {(profile.email || profile.phone) && (
                    <div className="truncate text-xs text-slate-500">
                      {[profile.email, profile.phone].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {profile.address && (
                    <div className="truncate text-xs leading-5 text-slate-400">
                      {profile.address}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

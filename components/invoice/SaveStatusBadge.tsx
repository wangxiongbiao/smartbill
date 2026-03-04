'use client';

import { SaveStatus } from '@/hooks/useAutoSave';

interface Props {
  status: SaveStatus;
}

export function SaveStatusBadge({ status }: Props) {
  const config: Record<SaveStatus, { icon: string; text: string; color: string } | null> = {
    idle: null,
    saving: { icon: '⏳', text: '保存中...', color: 'text-blue-500' },
    saved: { icon: '✓', text: '已保存', color: 'text-green-500' },
    offline: { icon: '⚠️', text: '离线 - 将在联网后同步', color: 'text-orange-500' },
    syncing: { icon: '🔄', text: '同步中...', color: 'text-blue-500' },
  };

  const current = config[status];
  if (!current) return null;

  return (
    <span className={`text-xs ${current.color} flex items-center gap-1`}>
      {current.icon} {current.text}
    </span>
  );
}

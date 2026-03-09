'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Invoice } from '@/types/invoice';
import { saveInvoice, syncPending } from '@/lib/invoices';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'syncing';

export function useAutoSave(
  invoice: Invoice | null,
  userId: string | undefined,
  onStatusChange: (status: SaveStatus) => void,
  enabled = true
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖保存（1秒）
  const save = useCallback(async (data: Invoice) => {
    if (!userId) return;
    
    onStatusChange('saving');
    const result = await saveInvoice(userId, data);
    onStatusChange(result.status === 'synced' ? 'saved' : 'offline');
  }, [userId, onStatusChange]);

  useEffect(() => {
    if (!enabled || !invoice || !userId) return;

    // 清除之前的定时器
    if (timerRef.current) clearTimeout(timerRef.current);

    // 设置新的防抖保存
    timerRef.current = setTimeout(() => {
      save(invoice);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, invoice, userId, save]);

  // 网络恢复时自动同步
  useEffect(() => {
    if (!enabled || !userId) return;

    const handleOnline = () => {
      onStatusChange('syncing');
      syncPending(userId).then(() => onStatusChange('saved'));
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [enabled, userId, onStatusChange]);
}

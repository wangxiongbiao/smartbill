import { supabase } from './supabase-browser';
import { Invoice } from '@/types/invoice';
import { safeDeepClean } from './utils';

// 核心：保存发票（云端优先，失败存本地）
export async function saveInvoice(userId: string, invoice: Invoice): Promise<{ status: 'synced' | 'pending'; error?: Error }> {
  try {
    // 先尝试云端
    await saveToSupabase(userId, invoice);
    
    // 成功：清除本地缓存
    localStorage.removeItem(`draft_${invoice.id}`);
    return { status: 'synced' };
    
  } catch (error) {
    // 失败：存本地，标记待同步
    localStorage.setItem(`draft_${invoice.id}`, JSON.stringify({
      ...invoice,
      syncStatus: 'pending',
      updatedAt: new Date().toISOString()
    }));
    return { status: 'pending', error: error as Error };
  }
}

// 加载发票（优先云端，fallback 本地）
export async function loadInvoice(userId: string, id: string): Promise<Invoice | null> {
  try {
    const cloud = await getFromSupabase(userId, id);
    if (cloud) return cloud;
  } catch {}
  
  // 云端失败，读本地草稿
  const draft = localStorage.getItem(`draft_${id}`);
  return draft ? JSON.parse(draft) : null;
}

// 同步所有待同步的草稿
export async function syncPending(userId: string): Promise<void> {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('draft_'));
  
  for (const key of keys) {
    const draft = JSON.parse(localStorage.getItem(key)!);
    if (draft.syncStatus === 'pending') {
      try {
        await saveToSupabase(userId, draft);
        localStorage.removeItem(key);
      } catch (e) {
        console.log('同步失败:', key);
      }
    }
  }
}

// 内部：保存到 Supabase
async function saveToSupabase(userId: string, invoice: Invoice): Promise<void> {
  const cleanData = safeDeepClean(invoice);
  if (!cleanData?.id) throw new Error('Invalid invoice data');

  const { error } = await supabase
    .from('invoices')
    .upsert({
      id: cleanData.id,
      user_id: userId,
      invoice_number: cleanData.invoiceNumber,
      invoice_data: { ...cleanData, updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) throw error;
}

// 内部：从 Supabase 读取
async function getFromSupabase(userId: string, id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_data')
    .eq('user_id', userId)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data.invoice_data as Invoice;
}

// 保留原有接口兼容性
export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row: any) => row.invoice_data as Invoice);
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
  if (error) throw error;
  localStorage.removeItem(`draft_${invoiceId}`);
}

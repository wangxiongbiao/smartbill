import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from './supabase/client';
import { Invoice, Profile } from '../types';
import { safeDeepClean } from './utils';

function getSupabaseClient(supabase?: SupabaseClient) {
    return supabase ?? createBrowserClient();
}

/**
 * 获取用户 profile
 */
export async function getUserProfile(userId: string, supabase?: SupabaseClient): Promise<Profile | null> {
    const client = getSupabaseClient(supabase);
    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log('[getUserProfile] Profile not found for user:', userId, '(first-time user)');
            return null;
        }
        console.error('[getUserProfile] Error fetching profile:', error);
        return null;
    }
    return data;
}

/**
 * 更新用户 profile
 */
export async function updateUserProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>, supabase?: SupabaseClient) {
    const client = getSupabaseClient(supabase);
    const { error } = await client
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

/**
 * 保存或更新发票到数据库
 */
export async function saveInvoice(userId: string, invoice: Invoice, supabase?: SupabaseClient): Promise<void> {
    console.log('[saveInvoice] 开始保存');
    console.log('[saveInvoice] userId:', userId);
    console.log('[saveInvoice] invoice.id:', invoice.id);
    console.log('[saveInvoice] invoice.invoiceNumber:', invoice.invoiceNumber);

    const client = getSupabaseClient(supabase);
    const cleanInvoiceData = safeDeepClean(invoice);

    if (!cleanInvoiceData || !cleanInvoiceData.id) {
        console.error('[saveInvoice] ❌ Error: Cleaned invoice data is invalid');
        throw new Error('Failed to sanitize invoice data');
    }

    const payload = {
        id: cleanInvoiceData.id,
        user_id: userId,
        invoice_number: cleanInvoiceData.invoiceNumber,
        invoice_data: cleanInvoiceData,
        updated_at: new Date().toISOString()
    };

    console.log('[saveInvoice] 准备 upsert，payload已清理');

    const { data, error } = await client
        .from('invoices')
        .upsert(payload, {
            onConflict: 'id'
        })
        .select();

    if (error) {
        console.error('[saveInvoice] ❌ Supabase 错误:', error);
        console.error('[saveInvoice] 错误详情:', JSON.stringify(error, null, 2));
        throw error;
    }

    console.log('[saveInvoice] ✅ 保存成功，返回数据:', data);
}

/**
 * 获取用户所有发票
 */
export async function getUserInvoices(userId: string, supabase?: SupabaseClient): Promise<Invoice[]> {
    const client = getSupabaseClient(supabase);
    const { data, error } = await client
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }

    return data.map(row => row.invoice_data as Invoice);
}

/**
 * 获取用户最新的一张发票
 */
export async function getLatestInvoice(userId: string, supabase?: SupabaseClient): Promise<Invoice | null> {
    const client = getSupabaseClient(supabase);
    const { data, error } = await client
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        console.log('[getLatestInvoice] No invoice found or error:', error?.message);
        return null;
    }

    return data.invoice_data as Invoice;
}

/**
 * 删除发票
 */
export async function deleteInvoice(invoiceId: string, userId?: string, supabase?: SupabaseClient): Promise<void> {
    const client = getSupabaseClient(supabase);
    let query = client
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
}

/**
 * 批量保存发票 (用于首次同步 localStorage 数据)
 */
export async function batchSaveInvoices(userId: string, invoices: Invoice[], supabase?: SupabaseClient): Promise<void> {
    const client = getSupabaseClient(supabase);
    const cleanInvoices = invoices.map(invoice => safeDeepClean(invoice)).filter(i => i && i.id);

    const records = cleanInvoices.map(invoice => ({
        id: invoice.id,
        user_id: userId,
        invoice_number: invoice.invoiceNumber,
        invoice_data: invoice,
        updated_at: new Date().toISOString()
    }));

    const { error } = await client
        .from('invoices')
        .upsert(records, { onConflict: 'id' });

    if (error) {
        console.error('Error batch saving invoices:', error);
        throw error;
    }
}
